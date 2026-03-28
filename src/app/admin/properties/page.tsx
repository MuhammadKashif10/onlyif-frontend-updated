"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import AdminLayout from "@/components/admin/AdminLayout";
import { adminApi } from "@/api/admin";
import { formatCurrencyCompact } from "@/utils/currency";

type Address =
  | string
  | {
      street?: string;
      city?: string;
      state?: string;
      zipCode?: string;
      country?: string;
    };

interface Property {
  _id: string; // Change from 'id' to '_id' to match MongoDB
  title: string;
  price: number;
  status: "draft" | "review" | "active" | "sold" | "withdrawn";
  agents?: Array<{
    agent: {
      _id: string;
      name: string;
      email: string;
    };
    role: string;
    isActive: boolean;
  }>;
  assignedAgent?: {
    _id?: string;
    name: string;
    email: string;
  };
  seller?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
    role?: string;
    joinedDate?: string;
    totalProperties?: number;
    profileImage?: string;
  };
  owner?: {
    _id?: string;
    name: string;
    email: string;
    phone?: string;
  };
  contactInfo?: {
    name: string;
    email: string;
    phone?: string;
  };
  createdAt: string;
  address: Address;
}

interface Agent {
  _id: string;
  id: string;  // Add id field for compatibility with backend
  name: string;
  email: string;
  status: string;
}

const PropertiesPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const queryClient = useQueryClient();
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(
    null
  );
  console.log("🚀 ~ PropertiesPage ~ selectedProperty:", selectedProperty);
  const [selectedAgent, setSelectedAgent] = useState("");
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showSellerModal, setShowSellerModal] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<Property['seller'] | null>(null);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Add debounced search term
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 500); // 500ms delay

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch properties using React Query with debounced search
  const {
    data: propertiesData,
    isLoading: loadingProperties,
    error: propertiesError,
  } = useQuery({
    queryKey: ["admin-properties", debouncedSearchTerm, statusFilter],
    queryFn: () =>
      adminApi.getProperties({
        search: debouncedSearchTerm || undefined,
        status: statusFilter !== "all" ? statusFilter : undefined,
        limit: 0, // No limit - fetch all properties
      }),
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Fetch agents for assignment
  const { data: agentsData } = useQuery({
    queryKey: ["admin-agents"],
    queryFn: () => adminApi.getAgents({ status: "approved" }),
    enabled: !!user && (user.role === "admin" || user.role === "super_admin"),
    retry: 1,
    refetchOnWindowFocus: false,
  });

  // Mutations for property actions
  // Replace the existing updatePropertyMutation with separate mutations
  const approvePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => {
      console.log("Approve mutation called with propertyId:", propertyId);
      if (!propertyId) {
        throw new Error("Property ID is required for approval");
      }
      return adminApi.approveProperty(propertyId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setNotification({
        type: "success",
        message: "Property approved successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      console.error("Error approving property:", error);
      if (error.message === "Property ID is required for approval") {
        setNotification({ type: "error", message: "Property ID is required for approval" });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to approve property";
        setNotification({ type: "error", message: errorMessage });
      }

      setTimeout(() => setNotification(null), 5000);
    },
  });

  const rejectPropertyMutation = useMutation({
    mutationFn: (propertyId: string) => {
      console.log("Reject mutation called with propertyId:", propertyId);
      if (!propertyId) {
        throw new Error("Property ID is required for rejection");
      }
      return adminApi.rejectProperty(propertyId);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setNotification({
        type: "success",
        message: "Property rejected successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      console.error("Error rejecting property:", error);
      if (error.message === "Property ID is required for rejection") {
        setNotification({ type: "error", message: "Property ID is required for rejection" });
      } else {
        const errorMessage =
          error.response?.data?.message ||
          error.message ||
          "Failed to reject property";
        setNotification({ type: "error", message: errorMessage });
      }
      setTimeout(() => setNotification(null), 5000);
    },
  });

  const deletePropertyMutation = useMutation({
    mutationFn: (propertyId: string) => adminApi.deleteProperty(propertyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setNotification({
        type: "success",
        message: "Property deleted successfully!",
      });
      setTimeout(() => setNotification(null), 3000);
    },
    onError: (error: any) => {
      console.error("Error deleting property:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Failed to delete property";
      setNotification({ type: "error", message: errorMessage });
      setTimeout(() => setNotification(null), 5000);
    },
  });
  // Remove lines 178-193 (the duplicate handleAssignAgent function)
  // Keep only the React Query mutation:
  const assignAgentMutation = useMutation({
    mutationFn: ({
      propertyId,
      agentId,
    }: {
      propertyId: string;
      agentId: string;
    }) => {
      console.log("=== MUTATION FUNCTION CALLED ===");
      console.log("Received propertyId:", propertyId);
      console.log("Received agentId:", agentId);
      console.log("PropertyId type:", typeof propertyId);
      console.log("AgentId type:", typeof agentId);

      if (!propertyId) {
        throw new Error("Property ID is required but was undefined");
      }
      if (!agentId) {
        throw new Error("Agent ID is required but was undefined");
      }

      return adminApi.assignPropertyToAgent(propertyId, { agentId });
    },
    onSuccess: () => {
      console.log("=== ASSIGNMENT SUCCESS ===");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
      setShowAssignModal(false);
      setSelectedProperty(null);
      setSelectedAgent("");
      setNotification({
        type: "success",
        message: "Agent assigned successfully!",
      });
      setTimeout(() => setNotification(null), 5000);
    },
    onError: (error: any) => {
      console.error("=== ASSIGNMENT ERROR ===");
      console.error("Error object:", error);
      console.error("Error response:", error?.response);
      console.error("Error data:", error?.response?.data);
      const errorMessage =
        error?.response?.data?.message ||
        "Failed to assign agent. Please try again.";
      setNotification({ type: "error", message: errorMessage });
      setTimeout(() => setNotification(null), 5000);
    },
  });

  // Update the button click handler
  // Remove the handleAssignAgentClick function (lines 175-181)
  // Delete these lines:
  // const handleAssignAgentClick = () => {
  //   if (!selectedProperty || !selectedAgent) return;
  //   assignAgentMutation.mutate({
  //     propertyId: selectedProperty._id,
  //     agentId: selectedAgent
  //   });
  // };
  useEffect(() => {
    if (!loading) {
      if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
        router.push("/admin/login");
        return;
      }
    }
  }, [user, loading, router]);

  // Add this useEffect to debug the agents data
  // Agents are correctly mapped from API response

  // Debug useEffect is properly placed (after line 187)
  useEffect(() => {
    if (agentsData?.data) {
      console.log("=== AGENTS DATA DEBUG ===");
      console.log("Agents data:", agentsData.data);
      console.log("First agent structure:", agentsData.data[0]);
      console.log("Agent ID field:", agentsData.data[0]?._id);
    }
  }, [agentsData]);

  // Remove the old handlePropertyAction function - it's replaced by React Query mutations
  // Lines 134-154 should be deleted

  // Remove lines 207-237 (the entire handleAssignAgent async function)
  // Keep only the handleAssignAgentClick function that uses React Query
  const handleAssignAgent = async () => {
    if (!selectedProperty || !selectedAgent) {
      setNotification({ type: "error", message: "Please select an agent" });
      return;
    }

    try {
      // DEBUG: Log the values being sent
      console.log("=== FRONTEND DEBUG ===");
      console.log("Selected Property ID:", selectedProperty._id); // Change from .id to ._id
      console.log("Selected Agent ID:", selectedAgent);
      console.log("Agent ID length:", selectedAgent.length);
      console.log("Agent ID type:", typeof selectedAgent);
      console.log(
        "Is valid ObjectId format:",
        /^[0-9a-fA-F]{24}$/.test(selectedAgent)
      );

      await adminApi.assignPropertyToAgent(selectedProperty._id, {
        // Change from .id to ._id
        agentId: selectedAgent,
      });

      setNotification({
        type: "success",
        message: "Agent assigned successfully!",
      });
      setShowAssignModal(false);
      setSelectedAgent("");
      queryClient.invalidateQueries({ queryKey: ["admin-properties"] });
    } catch (error: any) {
      console.error("Assignment error:", error);
      setNotification({
        type: "error",
        message: error.response?.data?.message || "Failed to assign agent",
      });
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const properties = propertiesData?.data || [];
  const agents = agentsData?.data || [];

  // Add the missing filteredProperties using useMemo
  const formatAddress = (address: Property['address']) => {
    if (!address) return "";
    if (typeof address === "string") {
      return address.replace(/\bUS\b/g, "AUS");
    }
    const { street, city, state, zipCode, country } = address;
    const normalizedCountry = country === "US" ? "AUS" : country;
    return [street, city, state, zipCode, normalizedCountry].filter(Boolean).join(", ");
  };

  const filteredProperties = useMemo(() => {
    if (!properties.length) return [];

    return properties.filter((property) => {
      // Apply search filter
      const matchesSearch =
        !debouncedSearchTerm ||
        property.title?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
        formatAddress(property.address)
          .toLowerCase()
          .includes(debouncedSearchTerm.toLowerCase());

      // Apply status filter
      const matchesStatus =
        statusFilter === "all" || property.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [properties, debouncedSearchTerm, statusFilter]);
  console.log("🚀 ~ filteredProperties:", filteredProperties);

  // Add debugging for properties data
  useEffect(() => {
    console.log("=== PROPERTIES DEBUG ===");
    console.log("Properties data:", propertiesData);
    console.log("Properties array:", properties);
    console.log("Filtered properties:", filteredProperties);
    if (filteredProperties.length > 0) {
      console.log("First property structure:", filteredProperties[0]);
      console.log("First property ID:", filteredProperties[0]._id);
      console.log("First property keys:", Object.keys(filteredProperties[0]));
    }
  }, [propertiesData,  filteredProperties]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Property Management
            </h1>
            <p className="mt-2 text-gray-600">
              Manage all property listings and assignments
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search properties by title, address, or description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg
                    className="h-5 w-5 text-gray-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                  </svg>
                </div>
                {searchTerm && (
                  <button
                    onClick={() => setSearchTerm("")}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  >
                    <svg
                      className="h-5 w-5 text-gray-400 hover:text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
              {debouncedSearchTerm && (
                <p className="text-sm text-gray-500 mt-1">
                  Searching for: "{debouncedSearchTerm}"
                </p>
              )}
            </div>
            <div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option key="all" value="all">
                  All Status
                </option>
                <option key="pending" value="pending">
                  Pending
                </option>
                <option key="review" value="review">
                  Review
                </option>
                <option key="approved" value="approved">
                  Approved
                </option>
                <option key="rejected" value="rejected">
                  Rejected
                </option>
                <option key="active" value="active">
                  Active
                </option>
                <option key="sold" value="sold">
                  Sold
                </option>
              </select>
            </div>
          </div>
        </div>

        {/* Properties Table */}
        {loadingProperties ? (
          <div className="flex justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        ) : propertiesError ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <p className="text-red-600">
              Failed to load properties. Please try again.
            </p>
            <button
              onClick={() =>
                queryClient.invalidateQueries({
                  queryKey: ["admin-properties"],
                })
              }
              className="mt-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
            >
              Retry
            </button>
          </div>
        ) : properties.length === 0 ? (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-12 text-center">
            <p className="text-gray-600 text-lg">No properties available</p>
            <p className="text-gray-500 mt-2">
              Properties will appear here once they are added to the system.
            </p>
          </div>
        ) : (
          <div className="bg-white shadow-sm rounded-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Property
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Assigned Agent
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Seller
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredProperties.map((property) => (
                    <tr key={property._id || property.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {formatAddress(property.address)}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {formatCurrencyCompact(property.price || 0)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            property.status === "active"
                              ? "bg-green-100 text-green-800"
                              : property.status === "draft"
                              ? "bg-yellow-100 text-yellow-800"
                              : property.status === "review"
                              ? "bg-blue-100 text-blue-800"
                              : property.status === "sold"
                              ? "bg-gray-100 text-gray-800"
                              : "bg-red-100 text-red-800"
                          }`}
                        >
                          {property.status}
                        </span>
                      </td>
                      {/* <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {
                        property.agents && property.agents.length > 0 ? (
                          <div>
                            {property.agents
                              .filter(agentEntry => agentEntry.isActive)
                              .map((agentEntry, index) => (
                                <div key={index} className="text-sm">
                                  {agentEntry.agent.name} ({agentEntry.role})
                                </div>
                              ))
                            }
                          </div>
                        ) : (
                          <span className="text-gray-400">No agent assigned</span>
                        )}
                      </td> */}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {(() => {
                          const activeAgentName =
                            property.assignedAgent?.name ||
                            property.agents?.find((a) => a.isActive)?.agent?.name;
                          return activeAgentName ? (
                            <span className="text-gray-900">{activeAgentName}</span>
                          ) : (
                            <span className="text-gray-400">No agent assigned</span>
                          );
                        })()}
                      </td>

                      <td className="px-6 py-4 whitespace-nowrap">
                        {(() => {
                          const sellerName =
                            property.seller?.name ||
                            property.contactInfo?.name ||
                            property.owner?.name;

                          const sellerPhone =
                            property.seller?.phone ||
                            property.contactInfo?.phone ||
                            property.owner?.phone;

                          if (!sellerName && !sellerPhone) {
                            return (
                              <>
                                <div className="text-sm text-gray-900">No seller info</div>
                                <div className="text-sm text-gray-500">N/A</div>
                              </>
                            );
                          }

                          return (
                            <>
                              <div className="text-sm text-gray-900">{sellerName || 'Unknown'}</div>
                              <div className="text-sm text-gray-500">{sellerPhone || 'N/A'}</div>
                            </>
                          );
                        })()}
                        {property.seller && (
                          <button
                            onClick={() => {
                              setSelectedSeller(property.seller);
                              setShowSellerModal(true);
                            }}
                            className="mt-1 text-blue-600 hover:text-blue-900 text-xs font-medium"
                          >
                            View
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">

                        {(property.status === "draft" || property.status === "review") && (
                          <>
                            <button
                              onClick={() => {
                                console.log("=== APPROVE BUTTON DEBUG ===");
                                console.log("Full property object:", property);
                                console.log("Property ID (_id):", property._id);
                                console.log("Property ID (id):", property.id);
                                console.log("Property keys:", Object.keys(property));
                                
                                const propertyId = property._id || property.id;
                                console.log("Final property ID to use:", propertyId);
                                
                                if (!propertyId) {
                                  console.error("Property ID is missing!");
                                  setNotification({ type: "error", message: "Property ID is required for approval" });
                                  return;
                                }
                                approvePropertyMutation.mutate(propertyId);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={approvePropertyMutation.isPending}
                            >
                              {approvePropertyMutation.isPending ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Approving...
                                </>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              onClick={() => {
                                console.log("=== REJECT BUTTON DEBUG ===");
                                console.log("Full property object:", property);
                                console.log("Property ID (_id):", property._id);
                                console.log("Property ID (id):", property.id);
                                console.log("Property keys:", Object.keys(property));
                                
                                const propertyId = property._id || property.id;
                                console.log("Final property ID to use:", propertyId);
                                
                                if (!propertyId) {
                                  console.error("Property ID is missing!");
                                  setNotification({ type: "error", message: "Property ID is required for rejection" });
                                  return;
                                }
                                rejectPropertyMutation.mutate(propertyId);
                              }}
                              className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                              disabled={rejectPropertyMutation.isPending}
                            >
                              {rejectPropertyMutation.isPending ? (
                                <>
                                  <svg
                                    className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                  >
                                    <circle
                                      className="opacity-25"
                                      cx="12"
                                      cy="12"
                                      r="10"
                                      stroke="currentColor"
                                      strokeWidth="4"
                                    ></circle>
                                    <path
                                      className="opacity-75"
                                      fill="currentColor"
                                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                    ></path>
                                  </svg>
                                  Rejecting...
                                </>
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => {
                            console.log("🔍 Assign Agent Button Clicked");
                            console.log("📋 Property Object:", property);
                            console.log("📝 Property Title:", property.title);

                            const propertyId = property._id || property.id;
                            if (!propertyId) {
                              console.error("❌ Property ID is missing!");
                              setNotification({
                                type: "error",
                                message:
                                  "Property ID is missing. Cannot assign agent.",
                              });
                              return;
                            }

                            setSelectedProperty(property);
                            setSelectedAgent("");
                            setShowAssignModal(true);

                            console.log(
                              "✅ Modal should open with property:",
                              propertyId
                            );
                          }}
                          className="text-blue-600 hover:text-blue-900 text-sm"
                        >
                          Assign Agent
                        </button>
                        <button
                          onClick={() => {
                            console.log("=== DELETE BUTTON DEBUG ===");
                            console.log("Full property object:", property);
                            console.log("Property ID (_id):", property._id);
                            console.log("Property ID (id):", property.id);
                            console.log("Property keys:", Object.keys(property));
                            
                            const propertyId = property._id || property.id;
                            console.log("Final property ID to use:", propertyId);
                            
                            if (!propertyId) {
                              console.error("Property ID is missing!");
                              setNotification({ type: "error", message: "Property ID is required for deletion" });
                              return;
                            }
                            deletePropertyMutation.mutate(propertyId);
                          }}
                          className="inline-flex items-center px-3 py-1 border border-transparent text-xs font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed"
                          disabled={deletePropertyMutation.isPending}
                        >
                          {deletePropertyMutation.isPending ? (
                            <>
                              <svg
                                className="animate-spin -ml-1 mr-2 h-3 w-3 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                              >
                                <circle
                                  className="opacity-25"
                                  cx="12"
                                  cy="12"
                                  r="10"
                                  stroke="currentColor"
                                  strokeWidth="4"
                                ></circle>
                                <path
                                  className="opacity-75"
                                  fill="currentColor"
                                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                ></path>
                              </svg>
                              Deleting...
                            </>
                          ) : (
                            "Delete"
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Assign Agent Modal */}
        {showAssignModal && selectedProperty && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Assign Agent to {selectedProperty.title}
              </h3>

              {/* Debug Panel for Development */}
              {process.env.NODE_ENV === "development" && (
                <div className="mb-4 p-2 bg-gray-100 rounded text-xs">
                  <p>
                    <strong>Debug Info:</strong>
                  </p>
                  <p>Property ID: {selectedProperty._id}</p>
                  <p>Property Title: {selectedProperty.title}</p>
                  <p>Selected Agent: {selectedAgent}</p>
                  <p>Agents Available: {agents.length}</p>
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Agent
                </label>
                <select
                  value={selectedAgent}
                  onChange={(e) => {
                    console.log("🎯 Agent Selected:", e.target.value);
                    setSelectedAgent(e.target.value);
                  }}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Choose an agent...</option>
                  {agents.map((agent: Agent) => (
                    <option key={agent._id || agent.id} value={agent.id || agent._id}>
                      {agent.name} ({agent.email})
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowAssignModal(false);
                    setSelectedProperty(null);
                    setSelectedAgent("");
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    console.log("🚀 Assign Agent Button Clicked in Modal");
                    console.log("📋 Selected Property:", selectedProperty);
                    console.log("🆔 Property ID:", selectedProperty?._id || selectedProperty?.id);
                    console.log("👤 Selected Agent:", selectedAgent);

                    if (!selectedProperty) {
                      console.error("❌ No property selected");
                      setNotification({
                        type: "error",
                        message: "No property selected. Please try again.",
                      });
                      return;
                    }

                    const propertyId = selectedProperty._id || (selectedProperty as any).id;
                    if (!propertyId) {
                      console.error("❌ Property ID is missing");
                      setNotification({
                        type: "error",
                        message: "Property ID is missing. Cannot assign agent.",
                      });
                      return;
                    }

                    if (!selectedAgent) {
                      console.error("❌ No agent selected");
                      setNotification({
                        type: "error",
                        message: "Please select an agent to assign.",
                      });
                      return;
                    }

                    const objectIdRegex = /^[0-9a-fA-F]{24}$/;
                    if (!objectIdRegex.test(propertyId)) {
                      console.error("❌ Invalid Property ID format:", propertyId);
                      setNotification({
                        type: "error",
                        message:
                          "Invalid property ID format. Please refresh and try again.",
                      });
                      return;
                    }

                    if (!objectIdRegex.test(selectedAgent)) {
                      console.error("❌ Invalid Agent ID format:", selectedAgent);
                      setNotification({
                        type: "error",
                        message:
                          "Invalid agent ID format. Please refresh and try again.",
                      });
                      return;
                    }

                    console.log("✅ All validations passed. Making API call...");
                    console.log("📤 API Call Parameters:", {
                      propertyId,
                      agentId: selectedAgent,
                    });

                    assignAgentMutation.mutate({
                      propertyId,
                      agentId: selectedAgent,
                    });
                  }}
                  disabled={!selectedAgent || assignAgentMutation.isPending}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50"
                >
                  {assignAgentMutation.isPending
                    ? "Assigning..."
                    : "Assign Agent"}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Seller Details Modal */}
        {showSellerModal && selectedSeller && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                Seller Details
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.name}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Email</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedSeller.email}</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700">Phone</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedSeller.phone || 'Not provided'}
                  </p>
                </div>
                
                {selectedSeller.joinedDate && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Joined Date</label>
                    <p className="mt-1 text-sm text-gray-900">
                      {new Date(selectedSeller.joinedDate).toLocaleDateString()}
                    </p>
                  </div>
                )}
                
                {selectedSeller.totalProperties && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Properties</label>
                    <p className="mt-1 text-sm text-gray-900">{selectedSeller.totalProperties}</p>
                  </div>
                )}
              </div>
              
              <div className="flex justify-end mt-6">
                <button
                  onClick={() => {
                    setShowSellerModal(false);
                    setSelectedSeller(null);
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Notification */}
        {notification && (
          <div
            className={`fixed top-4 right-4 p-4 rounded-md shadow-lg z-50 ${
              notification.type === "success"
                ? "bg-green-100 text-green-800 border border-green-200"
                : "bg-red-100 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              <span className="mr-2">
                {notification.type === "success" ? "✅" : "❌"}
              </span>
              {notification.message}
            </div>
            <button
              onClick={() => setNotification(null)}
              className="ml-4 text-sm underline"
            >
              Dismiss
            </button>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default PropertiesPage;
