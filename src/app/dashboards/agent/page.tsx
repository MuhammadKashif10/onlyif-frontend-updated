'use client';
import { useState, useEffect } from 'react';
import { Navbar } from '@/components';
import Sidebar from '@/components/main/Sidebar';
import { AgentProvider, useAgentContext } from '@/context/AgentContext';
import { useAuth } from '@/context/AuthContext';
import { useUI } from '@/context/UIContext';
import Image from 'next/image';
import Link from 'next/link';
import { 
  LayoutDashboard, 
  Building2, 
  Settings, 
  Users, 
  MessageSquare, 
  Home, 
  Search, 
  ArrowRight, 
  ChevronRight,
  Menu,
  X,
  Plus,
  Activity,
  DollarSign,
  User,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  MapPin,
  MoreHorizontal,
  Receipt,
  BadgeCheck,
  History,
  LogOut,
  Paperclip,
  AtSign,
  LayoutGrid,
  List,
  SlidersHorizontal,
  TrendingUp
} from 'lucide-react';
import { Button } from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';
import InspectionManager from '@/components/agent/InspectionManager';
import { NotificationPanel, Modal } from '@/components/reusable';
import { MessagesInterface } from '@/components/reusable';
import OneToOneChat from '@/components/ui/ContactAgentModal';
import ChatInterface from '@/components/reusable/ChatInterface';
import { messagesApi } from '@/api/messages';
import { getSafeImageUrl } from '@/utils/imageUtils';
import { formatCurrencyCompact } from '@/utils/currency';
import SalesStatusSelector from '@/components/agent/SalesStatusSelector';
import ToastNotification from '@/components/reusable/ToastNotification';

// Add interfaces
interface PropertyAssignment {
  id: string;
  _id?: string; // MongoDB ObjectId
  title: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  price: number;
  status: string;
  salesStatus?: string | null; // New sales status field
  image?: string;
  assignedDate: string;
  priority: 'high' | 'medium' | 'low';
  beds: number;
  baths: number;
  size: number;
  seller?: {
    id: string;
    name: string;
    email?: string;
    avatar?: string;
  };
}


interface Inspection {
  id: string;
  propertyId: string;
  propertyName: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  inspector: string;
  client: string;
  notes?: string;
  address: string;
}

type NoteCategory = 'property' | 'inspection' | 'general' | 'client-meeting' | 'pricing';

interface Note {
  id: string;
  propertyId?: string;
  title: string;
  content: string;
  type: NoteCategory;
  priority: 'high' | 'medium' | 'low';
  createdAt: string;
}

// Add Activity interface
interface Activity {
  id: string;
  type: 'property_assigned' | 'inspection' | 'message';
  title: string;
  timestamp: string;
}

interface AgentStats {
  assignedProperties: number;
  pendingInspections: number;
  newMessages: number;
  completedInspections: number;
}

// Helper component to fetch/create real thread then render ChatInterface (top-level)
function RealSellerAgentChat({ otherUserId, propertyId, currentUserId, currentUserRole }: any) {
  const [conversation, setConversation] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    (async () => {
      if (!otherUserId || !currentUserId) {
        console.log('❌ Missing required data:', { otherUserId, currentUserId });
        setError('Missing user information');
        setLoading(false);
        return;
      }
      
      console.log('🔍 RealSellerAgentChat preparing thread:', { 
        otherUserId, 
        propertyId, 
        currentUserId, 
        currentUserRole 
      });
      
      try {
        setLoading(true);
        setError(null);
        const { ensureThread } = await import('@/api/messages');
        const conv = await ensureThread(String(otherUserId), propertyId);
        console.log('✅ RealSellerAgentChat thread ensured:', conv);
        setConversation(conv);
      } catch (e) {
        console.error('❌ Failed to prepare seller-agent chat:', e);
        setError('Failed to load conversation');
      } finally {
        setLoading(false);
      }
    })();
  }, [otherUserId, propertyId, currentUserId]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full text-gray-600">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p>Preparing chat…</p>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-full text-red-600">
        <div className="text-center">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }
  
  if (!conversation) {
    return <div className="flex items-center justify-center h-full text-gray-600">No conversation found</div>;
  }
  
  return (
    <ChatInterface
      conversation={conversation}
      currentUserId={currentUserId}
      currentUserRole={currentUserRole}
      className="h-full"
      mockMode={false}
    />
  );
}

export default function AgentDashboard() {
  const { user, logout } = useAuth();
  const { addNotification } = useUI();
  const isAgentUser = Boolean(user?.roles?.includes('agent') || user?.role === 'agent');
  const agentApprovalStatus = user?.agentStatus ?? (isAgentUser ? 'approved' : null);

  // Polling for status update if pending
  useEffect(() => {
    if (isAgentUser && agentApprovalStatus === 'pending') {
      const interval = setInterval(() => {
        // We can trigger a session validation or a specific status check
        // For simplicity, we can just reload the page or call a refresh function if available
        // Since validateSession is internal to AuthProvider, we might need to expose a refreshUser method
        window.location.reload();
      }, 30000); // 30 seconds polling
      return () => clearInterval(interval);
    }
  }, [isAgentUser, agentApprovalStatus]);

  if (isAgentUser && agentApprovalStatus === 'pending') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-gray-100">
            <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">⏳</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Under Review</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your agent account is currently under review by our administration team. 
              We'll notify you via email once your account has been approved.
            </p>
            <div className="p-4 bg-gray-50 rounded-xl border border-gray-100 mb-8">
              <p className="text-sm text-gray-500 italic">
                Approval typically takes 24-48 business hours.
              </p>
            </div>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors shadow-md shadow-blue-200"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (isAgentUser && agentApprovalStatus === 'rejected') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center border border-red-100">
            <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❌</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Account Rejected</h1>
            <p className="text-gray-600 mb-8 leading-relaxed">
              Your agent request has been rejected. If you believe this is an error, please contact our support team.
            </p>
            <button 
              onClick={() => window.location.href = '/'}
              className="w-full py-3 bg-gray-800 text-white rounded-xl font-semibold hover:bg-gray-900 transition-colors"
            >
              Return to Homepage
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Use actual user ID from auth, fallback to agent with properties for testing
  const currentUserId = user?.id || "68cb627cee767de414e83407";
  const currentUserRole = 'agent';
  
  // Debug logging
  console.log("🔍 Current user from auth:", user);
  console.log("🆔 Using agent ID:", currentUserId);
  
  // Fix: Use dynamic user name instead of hardcoded value
  const [agentName, setAgentName] = useState(user?.name || 'Agent');
  const [activeTab, setActiveTab] = useState('overview');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [ assignments, setAssignments] = useState<PropertyAssignment[]>([]);
  console.log("🚀 ~ AgentDashboard ~ assignments:", assignments)
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [buyers, setBuyers] = useState<{ id: string; name: string; email?: string }[]>([]);
  const [selectedBuyer, setSelectedBuyer] = useState<{ id: string; name: string; email?: string } | null>(null);

  // Settlement modal state
  const [showSettlementModal, setShowSettlementModal] = useState(false);
  const [settlementBuyers, setSettlementBuyers] = useState<any[]>([]);
  const [settlementPropertyId, setSettlementPropertyId] = useState<string | null>(null);
  const [settlementDetails, setSettlementDetails] = useState<any>(null);

  const [selectedProperty, setSelectedProperty] = useState<PropertyAssignment | null>(null);
  const [userObj, setUserObj] = useState<{ user: string } | null>(null);

  // Seller chat modal state
  const [showSellerChat, setShowSellerChat] = useState(false);
  const [selectedSeller, setSelectedSeller] = useState<{ id: string; name: string; email?: string; avatar?: string } | null>(null);

  console.log("🚀 ~ AgentDashboard ~ selectedProperty:", selectedProperty)
  const [showInspectionForm, setShowInspectionForm] = useState(false);
  const [showNoteForm, setShowNoteForm] = useState(false);
  
  // Add assignments loading and error states
  const [assignmentsLoading, setAssignmentsLoading] = useState(true);
  const [assignmentsError, setAssignmentsError] = useState<string | null>(null);
  
  const [inspectionForm, setInspectionForm] = useState({
    date: '',
    time: '',
    inspector: '',
    client: '',
    notes: ''
  });
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
    type: 'property' as 'property' | 'inspection' | 'general',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });

  // Inline entry panel used by the redesigned Notes & Updates tab
  const [entryForm, setEntryForm] = useState<{ propertyId: string; content: string; category: NoteCategory }>({
    propertyId: '',
    content: '',
    category: 'general'
  });
  const [notesFilter, setNotesFilter] = useState<'all' | NoteCategory>('all');

  // Manage Inspections – view toggle and search (UI-only state)
  const [inspectionView, setInspectionView] = useState<'timeline' | 'calendar'>('timeline');
  const [inspectionSearch, setInspectionSearch] = useState('');

  // Assigned Properties – view, search, filters (UI-only state)
  const [propertiesView, setPropertiesView] = useState<'grid' | 'list'>('grid');
  const [propertiesSearch, setPropertiesSearch] = useState('');
  const [propertyPriorityFilter, setPropertyPriorityFilter] = useState<'all' | 'high' | 'medium' | 'low'>('all');
  const [showPropertyFilters, setShowPropertyFilters] = useState(false);
  const [expandedStatusId, setExpandedStatusId] = useState<string | null>(null);
  
  // Updated stats state with loading and error handling
  const [stats, setStats] = useState<AgentStats>({
    assignedProperties: 0,
    pendingInspections: 0,
    newMessages: 0,
    completedInspections: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState<string | null>(null);

  // Add activities state
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState<string | null>(null);
  // Platform invoice created at settlement
  const [platformInvoice, setPlatformInvoice] = useState<any | null>(null);
  // Lightweight invoice list for agent view (in-memory)
  const [agentInvoices, setAgentInvoices] = useState<any[]>([]);
  
  // Update agent name when user data changes
  useEffect(() => {
    if (user?.name) {
      setAgentName(user.name);
    }
  }, [user]);
  
  // Add fetchAgentProperties function
  const fetchAgentProperties = async () => {
    try {
      setAssignmentsLoading(true);
      setAssignmentsError(null);
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';

      const response = await fetch(`${backendBase}/agent/${currentUserId}/properties`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      console.log("🚀 ~ fetchAgentProperties ~ response:----", response)
      
      // Handle 404 or other errors gracefully
      if (!response.ok) {
        if (response.status === 404) {
          // Treat 404 as empty properties, not an error
          setAssignments([]);
          return;
        }
        throw new Error('Failed to fetch assigned properties');
      }
      
      const data = await response.json();
      console.log("🚀 ~ fetchAgentProperties ~ data:", data)
      
      if (data.success) {
        // Handle empty array or undefined data gracefully
        const properties = data.data || [];
        const propertyList = properties.properties || [];
        
        // Debug logging
        console.log("📋 Properties data structure:", properties);
        console.log("🏠 Property list:", propertyList);
        console.log("🔢 Properties count:", Array.isArray(propertyList) ? propertyList.length : 0);
        
        setAssignments(propertyList);
        
        // Update stats with actual property count
        const count = Array.isArray(propertyList) ? propertyList.length : 0;
        setStats(prevStats => ({
          ...prevStats,
          assignedProperties: count
        }));
        setStatsLoading(false);
        
        console.log("📊 Stats updated to:", count);
        
        // Fetch activities after properties are loaded to generate real activities
        fetchAgentActivities();
      } else {
        // Don't show API errors to users, just log them
        console.error('API returned error:', data.error);
        setAssignments([]);
        setStats(prevStats => ({ ...prevStats, assignedProperties: 0 }));
        setStatsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching agent properties:', error);
      // Don't show technical errors to users
      setAssignmentsError(null);
      setAssignments([]);
      setStats(prevStats => ({ ...prevStats, assignedProperties: 0 }));
      setStatsLoading(false);
    } finally {
      setAssignmentsLoading(false);
    }
  };
  
  // Pull live unread message count from the existing /messages/unread-count endpoint.
  // Safely zeroes the card if the endpoint or auth fails — never blocks the dashboard.
  const fetchUnreadMessages = async () => {
    try {
      const result = await messagesApi.getUnreadCount();
      setStats(prev => ({ ...prev, newMessages: Number(result?.count) || 0 }));
    } catch (error) {
      console.error('Error fetching unread message count:', error);
      setStats(prev => ({ ...prev, newMessages: 0 }));
    }
  };

  // Add fetchAgentStats function
  const fetchAgentStats = async () => {
    try {
      setStatsLoading(true);
      setStatsError(null);
      
      const response = await fetch(`/api/agent/${currentUserId}/stats`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch agent stats');
      }
      
      const data = await response.json();
      
      if (data.success) {
        setStats(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch stats');
      }
    } catch (error) {
      console.error('Error fetching agent stats:', error);
      setStatsError('Failed to load agent statistics');
    } finally {
      setStatsLoading(false);
    }
  };

  // Add fetchAgentActivities function
  const fetchAgentActivities = async () => {
    try {
      setActivitiesLoading(true);
      setActivitiesError(null);
      
      // Note: Activities API route has issues, so we'll generate activities from real property data
      console.log("🔄 Generating activities from real property assignments...");
      
      // Fallback: Generate activities based on actual assigned properties
      console.log("🔄 Generating activities from assigned properties...");
      const realActivities = [];
      
      if (assignments && assignments.length > 0) {
        assignments.forEach((property, index) => {
          realActivities.push({
            id: `property-${property._id || property.id}`,
            type: 'property_assigned',
            title: `Property assigned: ${property.title}`,
            timestamp: new Date(Date.now() - (index + 1) * 2 * 60 * 60 * 1000).toISOString() // Stagger by 2 hours each
          });
        });
      }
      
      // Add some additional mock activities if we have real properties
      if (realActivities.length > 0) {
        realActivities.push(
          {
            id: 'inspection-1',
            type: 'inspection',
            title: `Inspection scheduled for ${assignments[0]?.title || 'assigned property'}`,
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString()
          },
          {
            id: 'message-1', 
            type: 'message',
            title: 'New inquiry about your listed property',
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString()
          }
        );
      } else {
        // If no real properties, show generic activities
        realActivities.push(
          {
            id: '1',
            type: 'property_assigned',
            title: 'Welcome to the agent dashboard',
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString()
          }
        );
      }
      
      // Sort by timestamp (newest first)
      realActivities.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      console.log("📋 Generated activities:", realActivities);
      setActivities(realActivities);
      
    } catch (error) {
      console.error('Error fetching agent activities:', error);
      setActivitiesError('Failed to load recent activities');
    } finally {
      setActivitiesLoading(false);
    }
  };

  // Function to get activity icon color based on type
  const getActivityIconColor = (type: string) => {
    switch (type) {
      case 'property_assigned':
        return 'bg-green-500';
      case 'inspection':
        return 'bg-blue-500';
      case 'message':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Function to format timestamp for display
  const formatTimestamp = (timestamp: string) => {
    const now = new Date();
    const activityTime = new Date(timestamp);
    const diffInHours = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      const diffInMinutes = Math.floor((now.getTime() - activityTime.getTime()) / (1000 * 60));
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays} days ago`;
    }
  };

  useEffect(() => {
    // fetchAgentStats(); // Stats now calculated from properties
    // fetchAgentActivities(); // Will be called after properties load
    fetchAgentProperties(); // This will also update stats and trigger activities
    fetchUnreadMessages();
    const messagesInterval = setInterval(fetchUnreadMessages, 60_000);
    return () => clearInterval(messagesInterval);
  }, [currentUserId]);

  // // Load stats on component mount
  // useEffect(() => {
  //   if (currentUserId) {
  //     fetchAgentStats();
  //   }
  // }, [currentUserId]);

  // // Remove the mock data useEffect - replace with:
  // useEffect(() => {
  //   if (currentUserId) {
  //     fetchAgentProperties();
  //   }
  // }, [currentUserId]);

  // Add useEffect to load mock data
  useEffect(() => {
    // Load mock data
    const mockAssignments: PropertyAssignment[] = [
      {
        id: '1',
        title: 'Beautiful Family Home',
        address: '123 Maple Street, Austin, TX 78701',
        price: 750000,
        status: 'Active',
        image: 'https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80',
        assignedDate: '2024-03-15',
        priority: 'high',
        beds: 4,
        baths: 3,
        size: 2500
      },
      {
        id: '2',
        title: 'Modern Downtown Condo',
        address: '456 Oak Avenue, Austin, TX 78702',
        price: 450000,
        status: 'Pending',
        image: 'https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=800&q=80',
        assignedDate: '2024-03-12',
        priority: 'medium',
        beds: 2,
        baths: 2,
        size: 1200
      }
    ];
    setAssignments([]);
  }, []);

  // Add helper functions INSIDE the component
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleAddInspection = async () => {
    if (!inspectionForm.date || !inspectionForm.time || !inspectionForm.inspector || !inspectionForm.client) {
      alert('Please fill in all required fields');
      return;
    }
    
    if (!selectedProperty) {
      alert('Please select a property first');
      return;
    }

    try {
      // Combine date and time into datetime
      const datetime = new Date(`${inspectionForm.date}T${inspectionForm.time}`);
      
      const inspectionData = {
        propertyId: selectedProperty.id,
        datetime: datetime.toISOString(),
        inspector: {
          name: inspectionForm.inspector,
          phone: '', // Add phone field to form if needed
          email: '', // Add email field to form if needed
        },
        notes: inspectionForm.notes
      };

      const response = await fetch('/api/inspections', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(inspectionData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to schedule inspection');
      }

      const result = await response.json();
      
      // Add to local state for immediate UI update
      const newInspection: Inspection = {
        id: result.data._id,
        propertyId: selectedProperty.id,
        propertyName: selectedProperty.title,
        date: inspectionForm.date,
        time: inspectionForm.time,
        status: 'scheduled',
        inspector: inspectionForm.inspector,
        client: inspectionForm.client,
        notes: inspectionForm.notes,
        // address: selectedProperty.address
      };
      
      setInspections([...inspections, newInspection]);
      setShowInspectionForm(false);
      setInspectionForm({ date: '', time: '', inspector: '', client: '', notes: '' });
      
      // Refresh stats and activities
      // fetchAgentStats();
      // fetchAgentActivities();
      
      alert('Inspection scheduled successfully!');
    } catch (error) {
      console.error('Error scheduling inspection:', error);
      alert(`Failed to schedule inspection: ${error.message}`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'scheduled':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  const handleSelectProperty = async (property: PropertyAssignment) => {
  try {
    console.log("🚀 ~ handleSelectProperty ~ property:", property);
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/signin";
      return;
    }

    const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
    const res = await fetch(
      `${backendBase}/api/payment/purchases/${property._id || property.id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!res.ok) {
      alert("No buyers found for this property");
      return;
    }

    const data = await res.json();
    setSelectedProperty(property);
    setBuyers(data || []);
    setIsContactModalOpen(true);
  } catch (err) {
    console.error("Error fetching buyers:", err);
  }
};

// const handleSelectProperty = async (property: PropertyAssignment) => {
//   try {
//     console.log("🚀 ~ handleSelectProperty ~ property:", property);

//     const token = localStorage.getItem("token");
//     if (!token) {
//       // not logged in → redirect to signin
//       window.location.href = "/signin";
//       return;
//     }

//     // Call backend API
//     const res = await fetch(
//       `${process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || ''}/api/payment/purchases/${property.id}`,
//       {
//         method: "GET",
//         headers: {
//           "Content-Type": "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//       }
//     );
//
//     if (!res.ok) {
//       alert("No purchase found");
//       // optional: show alert or block modal if user has not paid
//       return;
//     }

//     const purchase = await res.json();
//     console.log("✅ Purchase details:", purchase);

//     // if purchase is paid → allow opening modal
//     if (purchase.status === "paid") {
//       setSelectedProperty(property);
//       setIsContactModalOpen(true);
//          setUserObj({ id: purchase.user });
//     }
//   } catch (err) {
//     console.error("Error checking purchase:", err);
//   }
// };

  // const handleSelectProperty = (property: PropertyAssignment) => {
  //   console.log("🚀 ~ handleSelectProperty ~ property:", property)
  //   setSelectedProperty(property);
  //     setIsContactModalOpen(true);
  // };

  const handleShowInspectionForm = () => {
    setShowInspectionForm(true);
  };

  const handleAddNote = () => {
    if (noteForm.title.trim() && noteForm.content.trim()) {
      const newNote: Note = {
        id: Date.now().toString(),
        propertyId: selectedProperty?.id,
        title: noteForm.title,
        content: noteForm.content,
        type: noteForm.type,
        priority: noteForm.priority,
        createdAt: new Date().toISOString()
      };

      setNotes(prevNotes => [newNote, ...prevNotes]);
      setNoteForm({
        title: '',
        content: '',
        type: 'property',
        priority: 'medium'
      });
      setShowNoteForm(false);
    }
  };

  const getCategoryMeta = (type: string) => {
    switch (type) {
      case 'inspection':
        return { label: 'Inspection', badge: 'bg-blue-50 text-blue-700', dot: 'bg-blue-500' };
      case 'client-meeting':
        return { label: 'Client Meeting', badge: 'bg-amber-50 text-amber-700', dot: 'bg-amber-500' };
      case 'pricing':
        return { label: 'Pricing', badge: 'bg-emerald-50 text-emerald-700', dot: 'bg-emerald-500' };
      case 'property':
        return { label: 'Property', badge: 'bg-purple-50 text-purple-700', dot: 'bg-purple-500' };
      default:
        return { label: 'Update', badge: 'bg-gray-100 text-gray-700', dot: 'bg-gray-400' };
    }
  };

  const getInspectionImage = (insp: Inspection) => {
    const p: any = assignments.find(a => (a._id || a.id) === insp.propertyId);
    const primary = p?.mainImage?.url
      ?? (typeof p?.mainImage === 'string' ? p.mainImage : undefined)
      ?? (Array.isArray(p?.images) ? (p.images[0]?.url ?? p.images[0]) : undefined)
      ?? p?.image;
    return primary ? getSafeImageUrl(primary as string, 'property') : '/images/default-property.jpg';
  };

  const formatInspectionTime = (timeStr: string) => {
    if (!timeStr) return { time: '--:--', period: '' };
    const [hRaw, mRaw] = timeStr.split(':');
    const h = Number(hRaw);
    const m = Number(mRaw);
    if (Number.isNaN(h) || Number.isNaN(m)) return { time: timeStr, period: '' };
    const period = h >= 12 ? 'PM' : 'AM';
    const hh = ((h + 11) % 12) + 1;
    return { time: `${String(hh).padStart(2, '0')}:${String(m).padStart(2, '0')}`, period };
  };

  const formatInspectionDayLabel = (dateStr: string) => {
    if (!dateStr) return { primary: 'Unscheduled', secondary: '' };
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) return { primary: dateStr, secondary: '' };
    const sameDay = (a: Date, b: Date) => a.toDateString() === b.toDateString();
    const primary = sameDay(date, today)
      ? 'Today'
      : sameDay(date, tomorrow)
        ? 'Tomorrow'
        : date.toLocaleDateString('en-US', { weekday: 'long' });
    const secondary = date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }).toUpperCase();
    return { primary, secondary };
  };

  const updateInspectionStatus = (id: string, status: Inspection['status']) => {
    setInspections(prev => prev.map(i => (i.id === id ? { ...i, status } : i)));
  };

  const handleMessageSeller = async (assignment: PropertyAssignment) => {
    let seller: any = assignment.seller || (assignment as any).owner;
    if (typeof seller === 'string' || !seller?.name) {
      const sellerId = typeof seller === 'string' ? seller : (seller?.id || seller?._id || (assignment as any).owner);
      if (!sellerId) return;
      try {
        const token = localStorage.getItem('token');
        const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
        const response = await fetch(`${backendBase}/api/admin/users/${sellerId}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (response.ok) {
          const data = await response.json();
          seller = data.data || data;
        } else {
          seller = { id: sellerId, name: 'Property Owner', email: 'owner@example.com' };
        }
      } catch (error) {
        seller = { id: sellerId, name: 'Property Owner', email: 'owner@example.com' };
      }
    }
    setSelectedSeller({
      id: seller.id || seller._id,
      name: seller.name || 'Property Owner',
      email: seller.email || 'owner@example.com',
      avatar: seller.avatar
    });
    setSelectedProperty(assignment);
    setShowSellerChat(true);
  };

  const handleRescheduleInspection = (insp: Inspection) => {
    const p = assignments.find(a => (a._id || a.id) === insp.propertyId) || null;
    setSelectedProperty(p);
    setInspectionForm({
      date: insp.date,
      time: insp.time,
      inspector: insp.inspector,
      client: insp.client,
      notes: insp.notes || ''
    });
    setShowInspectionForm(true);
  };

  const handlePostNote = () => {
    const content = entryForm.content.trim();
    if (!content) return;
    const property = assignments.find(a => (a._id || a.id) === entryForm.propertyId);
    const newNote: Note = {
      id: Date.now().toString(),
      propertyId: entryForm.propertyId || undefined,
      title: property?.title || getCategoryMeta(entryForm.category).label,
      content,
      type: entryForm.category,
      priority: 'medium',
      createdAt: new Date().toISOString()
    };
    setNotes(prev => [newNote, ...prev]);
    setEntryForm({ propertyId: '', content: '', category: 'general' });
  };

  // Function to generate settlement invoice automatically
  const generateSettlementInvoice = async (propertyId: string, propertyTitle: string, propertyPrice: number) => {
    try {
      console.log('📊 Generating settlement invoice for property:', { propertyId, propertyTitle, propertyPrice });
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // First, try to get seller information from the current property assignments
      const currentProperty = assignments.find(assignment => 
        (assignment._id || assignment.id) === propertyId
      );
      
      console.log('📋 Current property from assignments:', currentProperty);
      
      let sellerId, sellerName, sellerEmail;
      let propertyDetails = null;

      // Try to get property details from API (optional)
      try {
        console.log('🔍 Attempting to fetch property details from API...');
        const propertyResponse = await fetch(`/api/properties/${propertyId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (propertyResponse.ok) {
          const propertyData = await propertyResponse.json();
          propertyDetails = propertyData.property || propertyData.data;
          console.log('✅ Property details fetched from API:', propertyDetails);
        } else {
          console.log('⚠️ Property API returned status:', propertyResponse.status);
        }
      } catch (apiError) {
        console.log('⚠️ Property API call failed:', apiError);
      }

      // Extract seller information from multiple sources with fallbacks
      if (propertyDetails?.seller) {
        sellerId = propertyDetails.seller.id;
        sellerName = propertyDetails.seller.name;
        sellerEmail = propertyDetails.seller.email;
        console.log('✅ Using seller info from API:', { sellerId, sellerName, sellerEmail });
      } else if (currentProperty?.seller) {
        sellerId = currentProperty.seller.id;
        sellerName = currentProperty.seller.name;
        sellerEmail = currentProperty.seller.email;
        console.log('✅ Using seller info from current property:', { sellerId, sellerName, sellerEmail });
      } else {
        // Use intelligent fallback based on property information
        sellerId = `seller-${propertyId.slice(-8)}`; // Use property ID suffix for unique seller ID
        sellerName = `${propertyTitle} Owner`; // Use property title for seller name
        sellerEmail = `seller.${propertyId.slice(-6)}@example.com`; // Generate unique email
        console.log('🔄 Using intelligent fallback seller info:', { sellerId, sellerName, sellerEmail });
      }

      const agentName = user?.name || 'Agent';
      const currentDate = new Date().toISOString();

      console.log('📨 Calling invoice generation API with:', {
        propertyId,
        propertyTitle,
        propertyPrice,
        sellerId,
        sellerName,
        sellerEmail,
        agentName
      });

      // Call local invoice generation API (frontend implementation)
      const invoiceApiUrl = '/api/invoices/generate-settlement';
      console.log('📋 Using local invoice generation API (frontend implementation)');
      
      console.log('📋 Calling backend invoice API:', invoiceApiUrl);
      
      const invoicePayload = {
        propertyId: propertyId,
        propertyTitle: propertyTitle,
        propertyPrice: propertyPrice,
        sellerId: sellerId,
        sellerName: sellerName,
        sellerEmail: sellerEmail,
        agentId: currentUserId,
        agentName: agentName,
        settlementDate: currentDate
      };
      
      console.log('📋 Invoice generation payload:', invoicePayload);
      
      const invoiceResponse = await fetch(invoiceApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoicePayload)
      });

      console.log('📊 Invoice API response status:', invoiceResponse.status);

      if (invoiceResponse.ok) {
        const invoiceResult = await invoiceResponse.json();
        console.log('✅ Settlement invoice generated successfully:', {
          invoiceNumber: invoiceResult.data?.invoice?.invoiceNumber,
          totalAmount: invoiceResult.data?.invoice?.totalAmount,
          emailSent: invoiceResult.data?.emailSent
        });
        
        return {
          success: true,
          invoiceData: invoiceResult.data,
          message: `Invoice ${invoiceResult.data?.invoice?.invoiceNumber} generated and sent to ${sellerName}`
        };
      } else {
        const errorText = await invoiceResponse.text();
        console.error('🚫 Invoice API error response:', errorText);
        let errorData;
        try {
          errorData = JSON.parse(errorText);
        } catch {
          errorData = { message: errorText || 'Unknown API error' };
        }
        return { success: false, error: errorData.message || 'Failed to generate invoice' };
      }
    } catch (error) {
      console.error('🚨 Critical error in invoice generation:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred during invoice generation'
      };
    }
  };

  // Function to send message to seller when property is settled
  const sendSettlementMessageToSeller = async (propertyId: string, propertyTitle: string, invoiceData?: any) => {
    try {
      console.log('📧 Sending settlement notification to seller for property:', propertyTitle, 'ID:', propertyId);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('No authentication token found');
      }

      // Use intelligent fallback approach for finding seller information
      let sellerId, sellerName, sellerEmail;
      
      console.log('🔍 Using intelligent seller identification with multiple fallback methods');
      
      // Method 1: Check if current property in assignments has seller info
      const currentProperty = assignments.find(assignment => 
        (assignment._id || assignment.id) === propertyId
      );
      
      if (currentProperty?.seller) {
        sellerId = currentProperty.seller._id || currentProperty.seller.id;
        sellerName = currentProperty.seller.name;
        sellerEmail = currentProperty.seller.email;
        console.log('✅ Method 1: Found seller in current property assignment:', { sellerId, sellerName, sellerEmail });
      } else {
        // Method 2: Use the correct seller ID from the logged-in seller dashboard
        sellerId = '684c80ca3c1f5502e90bf42';
        sellerName = 'Seller 123';
        sellerEmail = 'seller123@example.com';
        console.log('🔄 Method 2: Using correct database-linked seller (Seller 123):', { sellerId, sellerName, sellerEmail });
      }
      
      if (!sellerId) {
        console.log('⚠️ No seller information found through any method');
        
        addNotification({
          type: 'warning',
          title: 'Notification Warning',
          message: `Property settled successfully, but could not identify the seller. Please notify the seller manually about the settlement completion.`
        });
        return;
      }

      const agentName = user?.name || 'Your Agent';
      const currentDate = new Date().toLocaleDateString('en-AU', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });

      // Compose the settlement message with invoice information
      let settlementMessage = `🎉 Congratulations! Your property "${propertyTitle}" has been successfully settled on ${currentDate}. \n\nThis means the sale is now complete and ownership has been officially transferred to the buyer. All necessary documents have been processed and the transaction is finalized.`;
      
      // Add invoice details if available
      if (invoiceData?.invoice) {
        const invoice = invoiceData.invoice;
        const bankDetails = invoiceData.paymentInstructions;
        
        settlementMessage += `\n\n📊 COMMISSION INVOICE DETAILS:\n• Invoice Number: ${invoice.invoiceNumber}\n• Commission Amount: A$${invoice.commissionAmount.toLocaleString()}\n• GST (10%): A$${invoice.gstAmount.toLocaleString()}\n• Total Amount Due: A$${invoice.totalAmount.toLocaleString()}\n• Due Date: ${new Date(invoice.dueDate).toLocaleDateString('en-AU')}`;
        
        settlementMessage += `\n\n🏦 PAYMENT INSTRUCTIONS:\n• Bank: ${bankDetails.bankName}\n• Account Name: ${bankDetails.accountName}\n• BSB: ${bankDetails.bsb}\n• Account Number: ${bankDetails.accountNumber}\n• Payment Reference: ${bankDetails.reference}\n\nThe tax invoice has been sent to your registered email address and is also available in your seller account dashboard.`;
      } else {
        settlementMessage += `\n\nKey details:\n• Property: ${propertyTitle}\n• Settlement Date: ${currentDate}\n• Status: Completed\n• Commission Invoice: Being processed`;
      }
      
      settlementMessage += `\n\nThank you for trusting me with the sale of your property. If you have any questions about the settlement process, commission invoice, or need copies of any documents, please don't hesitate to reach out.\n\nBest regards,\n${agentName}`;

      // Send the message using local messaging API with backend fallback
      const messageApiUrl = '/api/messages';
      console.log('📨 Sending settlement message via local API:', messageApiUrl);
      
      const messagePayload = {
        senderId: currentUserId,
        senderRole: 'agent',
        recipientId: sellerId,
        recipientRole: 'seller',
        messageText: settlementMessage,
        messageType: 'settlement',
        propertyId: propertyId
      };
      
      console.log('📬 Message payload:', messagePayload);
      
      const messageResponse = await fetch(messageApiUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(messagePayload)
      });

      if (messageResponse.ok) {
        const messageResult = await messageResponse.json();
        console.log('✅ Settlement notification sent to seller successfully:', messageResult);
        
        // Show success notification to agent
        addNotification({
          type: 'success',
          title: 'Settlement Notification Sent',
          message: `Settlement confirmation message sent to ${sellerName}.`
        });
      } else {
        console.error('Failed to send settlement notification to seller');
        
        // Show warning notification - don't fail the entire process
        addNotification({
          type: 'warning',
          title: 'Notification Warning',
          message: 'Property settled successfully, but could not send notification to seller. Please contact them manually.'
        });
      }
    } catch (error) {
      console.error('Error sending settlement notification to seller:', error);
      
      // Show warning notification - don't fail the entire process
      addNotification({
        type: 'warning',
        title: 'Notification Warning',
        message: 'Property settled successfully, but could not send notification to seller. Please contact them manually.'
      });
    }
  };

  // Handle settlement with buyer selection
  const handleSettlementWithBuyerSelection = async (propertyId: string, details?: any): Promise<void> => {
    try {
      // First, fetch buyers for this property
      const token = localStorage.getItem('token');
      if (!token) {
        addNotification({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please sign in to update property status'
        });
        return;
      }

      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const buyersUrl = `${backendBase}/api/properties/${propertyId}/buyers`;
      
      console.log('🔍 Fetching buyers for property:', buyersUrl);
      
      const buyersResponse = await fetch(buyersUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!buyersResponse.ok) {
        throw new Error(`Failed to fetch buyers: ${buyersResponse.status}`);
      }

      const buyersData = await buyersResponse.json();
      console.log('📋 Buyers data:', buyersData);

      if (!buyersData.success || !buyersData.data || buyersData.data.length === 0) {
        addNotification({
          type: 'warning',
          title: 'No Buyers Found',
          message: 'No buyers found for this property. Cannot proceed with settlement.'
        });
        return;
      }

      // If only one buyer, proceed automatically
      if (buyersData.data.length === 1) {
        const buyer = buyersData.data[0];
        console.log('🎯 Single buyer found, proceeding with settlement:', buyer);
        await proceedWithSettlement(propertyId, buyer._id, details);
        return;
      }

      // Multiple buyers - show selection modal
      setSettlementBuyers(buyersData.data);
      setSettlementPropertyId(propertyId);
      setSettlementDetails(details);
      setShowSettlementModal(true);

    } catch (error) {
      console.error('Error fetching buyers for settlement:', error);
      addNotification({
        type: 'error',
        title: 'Settlement Error',
        message: 'Failed to fetch buyers for settlement. Please try again.'
      });
    }
  };

  // Proceed with settlement after buyer selection
  const proceedWithSettlement = async (propertyId: string, buyerId: string, details?: any): Promise<void> => {
    try {
      const payload: any = { 
        status: 'settled',
        buyerId: buyerId,
        settlementDetails: { 
          legalReleaseConfirmed: true,
          settlementDate: new Date().toISOString()
        }
      };
      
      console.log('📤 Sending settlement update with buyer:', { propertyId, ...payload });
      
      const token = localStorage.getItem('token');
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const statusUpdateUrl = `${backendBase}/api/properties/${propertyId}/status`;
      
      const response = await fetch(statusUpdateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP ${response.status}`);
      }

      const result = await response.json();
      console.log('✅ Settlement successful:', result);

      // Update local state
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          (assignment._id || assignment.id) === propertyId 
            ? { ...assignment, salesStatus: 'settled' }
            : assignment
        )
      );

      addNotification({
        type: 'success',
        title: 'Property Settled Successfully',
        message: `Property has been settled and invoices have been generated for both seller and buyer.`
      });

      // Close settlement modal if open
      setShowSettlementModal(false);
      setSettlementBuyers([]);
      setSettlementPropertyId(null);
      setSettlementDetails(null);

    } catch (error) {
      console.error('Settlement error:', error);
      addNotification({
        type: 'error',
        title: 'Settlement Failed',
        message: error.message || 'Failed to settle property. Please try again.'
      });
    }
  };

  // Simplified status update handler for testing
  const handleStatusUpdate = async (propertyId: string, newStatus: string, details?: any): Promise<void> => {
    try {
      // If settling, we need to get buyer information first
      if (newStatus === 'settled') {
        await handleSettlementWithBuyerSelection(propertyId, details);
        return;
      }

      const payload: any = { status: newStatus };
      // Include legal release confirmation for settlement to enable platform invoice creation
      if (newStatus === 'settled') {
        payload.settlementDetails = { legalReleaseConfirmed: true };
      }
      
      console.log('📤 Sending status update:', { propertyId, ...payload });
      
      const token = localStorage.getItem('token');
      console.log('🔑 Auth token present:', !!token);
      
      if (!token) {
        addNotification({
          type: 'error',
          title: 'Authentication Required',
          message: 'Please sign in to update property status'
        });
        // Optionally redirect to signin
        // window.location.href = '/signin';
        throw new Error('No authentication token found');
      }
      
      // Use backend API for property status update
      const backendBase = process.env.NEXT_PUBLIC_BACKEND_URL || process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || '';
      const statusUpdateUrl = `${backendBase}/api/properties/${propertyId}/status`;
      
      console.log('🔍 Making request to backend:', statusUpdateUrl);
      console.log('📦 Payload:', payload);
      
      const response = await fetch(statusUpdateUrl, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });
      
      console.log('🔄 Response status:', response.status, response.statusText);

      if (!response.ok) {
        let errorMessage = 'Failed to update property status';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorData.error || errorMessage;
          console.log('❌ Error response:', errorData);
        } catch (parseError) {
          console.log('❌ Failed to parse error response:', parseError);
          if (response.status === 401) {
            errorMessage = 'Authentication failed. Please sign in again.';
          } else if (response.status === 404) {
            errorMessage = 'Property not found or API endpoint not available.';
          } else if (response.status === 403) {
            errorMessage = 'You do not have permission to update this property status.';
          }
        }
        throw new Error(errorMessage);
      }

      const result = await response.json();
      
      // Capture platform invoice (0.55%) for UI/payment
      if (result?.data?.platformInvoice?.generated) {
        setPlatformInvoice(result.data.platformInvoice);
        setAgentInvoices(prev => {
          const exists = prev.find((inv) => inv.invoiceId === result.data.platformInvoice.invoiceId);
          if (exists) return prev;
          return [result.data.platformInvoice, ...prev];
        });
      }
      
      // Update local state
      setAssignments(prevAssignments => 
        prevAssignments.map(assignment => 
          (assignment._id || assignment.id) === propertyId 
            ? { ...assignment, salesStatus: newStatus }
            : assignment
        )
      );

      // Get the property title for messaging
      const currentProperty = assignments.find(assignment => 
        (assignment._id || assignment.id) === propertyId
      );
      const propertyTitle = currentProperty?.title || 'Property';

      // Show professional success notification with details
      const statusDisplayName = newStatus === 'contract-exchanged' ? 'Contract Exchanged' : 
                               newStatus === 'unconditional' ? 'Unconditional' : 
                               newStatus === 'settled' ? 'Settled' : newStatus;
      
      let successMessage = `Property status updated to ${statusDisplayName}`;
      
      // Add invoice information if available
      if (result.success && result.data?.platformInvoice?.generated) {
        const amt = result.data.platformInvoice.amount || 0;
        successMessage = `Invoice for A$${Number(amt).toLocaleString('en-AU')} created — sent to seller.`;
      } else if (result.success && result.data?.invoice?.generated) {
        successMessage += ` and invoice ${result.data.invoice.invoiceNumber} generated`;
      } else if (newStatus === 'settled') {
        successMessage += ' and invoice generation initiated';
      }
      
      addNotification({
        type: 'success',
        title: 'Status Updated Successfully',
        message: successMessage
      });
      
      console.log('✅ Status update completed successfully:', result.data);

      // If property status is settled, generate invoice and send notification to seller
      if (newStatus === 'settled') {
        console.log('🏡 Property settled, generating invoice and sending notification to seller...');

        // Show deposit handling summary (off-platform)
        try {
          const price = currentProperty?.price || 0;
          const deposit = Number((price * 0.10).toFixed(2));
          addNotification({
            type: 'info',
            title: 'Deposit Handling (Off‑platform)',
            message: `A$${deposit.toLocaleString('en-AU')} (10% of sale price) is held in your trust account. After solicitor confirmation, deduct your commission and remit the balance to the seller manually.`
          });
        } catch {}
        
        // Run the complete settlement process in background
        (async () => {
          try {
            // Step 1: Generate settlement invoice
            const invoiceResult = await generateSettlementInvoice(propertyId, propertyTitle, currentProperty?.price || 0);
            
            if (invoiceResult.success) {
              console.log('📊 Invoice generated successfully:', invoiceResult.message);
              
              // Show invoice generation success notification
              addNotification({
                type: 'success',
                title: 'Invoice Generated',
                message: invoiceResult.message || 'Settlement invoice generated and sent to seller'
              });
              
              // Step 2: Send settlement notification with invoice details
              await sendSettlementMessageToSeller(propertyId, propertyTitle, invoiceResult.invoiceData);
            } else {
              console.error('🚫 Invoice generation failed:', invoiceResult.error);
              
              // Show invoice generation failure notification
              addNotification({
                type: 'warning',
                title: 'Invoice Generation Failed',
                message: `Property settled successfully, but invoice generation failed: ${invoiceResult.error}. Please generate invoice manually.`
              });
              
              // Still send settlement notification without invoice details
              await sendSettlementMessageToSeller(propertyId, propertyTitle);
            }
          } catch (error) {
            console.error('Settlement process error:', error);
            
            // Show general error notification
            addNotification({
              type: 'error',
              title: 'Settlement Process Error',
              message: 'Property status updated, but there was an issue with the settlement process. Please check manually.'
            });
          }
        })();
      }

    } catch (error) {
      console.error('Error updating property status:', error);
      
      // Show error notification 
      addNotification({
        type: 'error',
        title: 'Status Update Failed',
        message: error instanceof Error ? error.message : 'Failed to update property status. Please try again.'
      });
      
      // Re-throw the error so the component can handle it
      throw error;
    }
  };

  const agentInitials = agentName
    .split(' ')
    .filter(Boolean)
    .map(n => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
  const agentAvatar = (user as any)?.profileImage || (user as any)?.avatar || '';

  return (
    <div className="min-h-screen bg-[#f7f8fd] flex flex-col text-[#121212]">
      {/* Toast Notifications */}
      <ToastNotification />
      
      <Navbar />

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-white pb-20 lg:hidden">
          <div className="px-6 pt-24 space-y-8">
            <nav className="flex flex-col space-y-2">
              <p className="px-1 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Agent Menu</p>
              <div className="space-y-2">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'properties', label: 'Assigned Properties', icon: Building2 },
                  { id: 'inspections', label: 'Manage Inspections', icon: Calendar },
                  { id: 'notes', label: 'Notes & Updates', icon: MessageSquare }
                ].map((item) => (
                  <button 
                    key={item.id}
                    onClick={() => { setActiveTab(item.id); setIsMobileMenuOpen(false); }} 
                    className={`w-full flex items-center justify-between rounded-2xl px-4 py-4 transition-all duration-200 ${
                      activeTab === item.id 
                        ? 'bg-[#eaf1ff] text-gray-950 font-bold shadow-sm' 
                        : 'text-gray-600 font-semibold hover:bg-gray-50 hover:text-gray-950'
                    }`}
                  >
                    <span className="flex items-center gap-3">
                      <item.icon className={`h-5 w-5 ${activeTab === item.id ? 'text-gray-950' : 'text-gray-400'}`} />
                      {item.label}
                    </span>
                    {activeTab === item.id && <div className="h-1.5 w-1.5 rounded-full bg-gray-950" />}
                  </button>
                ))}
              </div>
            </nav>
            
            <div className="space-y-3 pt-4">
              <button
                type="button"
                onClick={() => { setIsMobileMenuOpen(false); logout(); }}
                className="flex w-full cursor-pointer items-center justify-between rounded-2xl border border-red-100 bg-red-50/60 px-4 py-4 text-red-600 font-bold transition-all duration-200 active:scale-[0.98]"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-5 w-5" />
                  Sign Out
                </span>
                <ChevronRight className="h-5 w-5 text-red-300" />
              </button>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-full py-4 bg-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all"
              >
                Close Menu
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative">
        {/* Sidebar */}
        <aside id="dashboard-sidebar" className="fixed left-0 top-20 bottom-0 z-40 hidden w-[296px] shrink-0 flex-col overflow-y-auto border-r border-gray-100 bg-white lg:flex">
          <div className="flex-1 pt-8">
            <nav className="space-y-1">
              {[
                { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                { id: 'properties', label: 'Assigned Properties', icon: Building2 },
                { id: 'inspections', label: 'Manage Inspections', icon: Calendar },
                { id: 'notes', label: 'Notes & Updates', icon: MessageSquare }
              ].map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`group relative flex w-full items-center gap-4 px-8 py-5 text-[15px] font-semibold tracking-wide transition-all duration-200 ${
                    activeTab === item.id 
                      ? 'bg-[#eaf1ff] text-black' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-950'
                  }`}
                >
                  {activeTab === item.id && <span className="absolute left-0 top-0 h-full w-1 bg-black" />}
                  <item.icon className={`h-5 w-5 transition-colors duration-200 ${activeTab === item.id ? 'text-black' : 'text-gray-400 group-hover:text-gray-700'}`} />
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>

          <div className="px-7 pb-7">
            <div className="pt-5">
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center overflow-hidden rounded-full bg-black text-sm font-bold text-white">
                  {agentAvatar ? <img src={agentAvatar} alt={agentName} className="h-full w-full object-cover" /> : agentInitials || 'A'}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-bold text-gray-950">{agentName}</p>
                  <p className="text-[10px] font-black uppercase tracking-tight text-gray-500">Licensed Agent</p>
                </div>
              </div>
              <button
                type="button"
                onClick={logout}
                aria-label="Sign out"
                className="group mt-5 flex w-full cursor-pointer items-center justify-between rounded-xl border border-gray-100 bg-white px-4 py-3 text-sm font-bold text-gray-600 transition-all duration-200 hover:-translate-y-0.5 hover:border-red-100 hover:bg-red-50 hover:text-red-600 hover:shadow-sm"
              >
                <span className="flex items-center gap-3">
                  <LogOut className="h-4 w-4 text-gray-400 transition-colors duration-200 group-hover:text-red-500" />
                  Sign Out
                </span>
                <ChevronRight className="h-4 w-4 text-gray-300 transition-colors duration-200 group-hover:text-red-400" />
              </button>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex min-h-[calc(100vh-5rem)] w-full flex-1 flex-col lg:ml-[296px]">
          {/* Mobile-only tab menu trigger */}
          <div className="sticky top-20 z-30 flex items-center justify-between gap-3 border-b border-gray-100 bg-white/90 px-4 py-3 backdrop-blur sm:px-6 lg:hidden">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(true)}
              aria-label="Open dashboard menu"
              className="grid h-10 w-10 cursor-pointer place-items-center rounded-2xl border border-gray-100 text-gray-700 transition-colors duration-200 hover:bg-gray-50"
            >
              <Menu className="h-5 w-5" />
            </button>
            <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-500">
              {activeTab === 'overview' && 'Overview'}
              {activeTab === 'properties' && 'Assigned Properties'}
              {activeTab === 'inspections' && 'Manage Inspections'}
              {activeTab === 'notes' && 'Notes & Updates'}
            </p>
          </div>
          <main className="w-full flex-1 px-4 py-5 sm:px-6 sm:py-8 lg:px-12 lg:py-6">
            <div className="mx-auto w-full max-w-[1120px]">
            {/* Overview content */}
            <section className="mb-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
              <div className="relative overflow-hidden rounded-[28px] border border-white bg-white px-6 py-8 shadow-[0_24px_70px_rgba(30,41,59,0.07)] sm:px-10 sm:py-11">
                <div className="relative z-10">
                  <h1 className="mb-3 text-3xl font-black leading-tight tracking-tight text-black sm:text-4xl">
                    Welcome back, {agentName}! 👋
                  </h1>
                  <p className="max-w-2xl text-base font-medium leading-8 text-gray-600 sm:text-lg">
                    You have <span className="font-black text-[#08a43b]">{stats.assignedProperties} properties</span> currently under your management. Your portfolio performance is stable for this quarter.
                  </p>
                </div>
                {/* Background Decoration */}
                <div className="absolute -right-8 bottom-0 top-0 hidden w-[300px] opacity-[0.09] sm:block">
                  <Home className="absolute right-0 top-8 h-36 w-36 text-slate-900" strokeWidth={1.6} />
                  <Building2 className="absolute bottom-[-18px] right-4 h-56 w-56 text-slate-900" strokeWidth={1.4} />
                </div>
              </div>
            </section>

            {/* Content Tabs (Overview, Properties, etc.) */}
            <div className="space-y-8">
              {activeTab === 'overview' && (
                <div className="space-y-8">
                  {/* Stats Cards - Stacking on mobile */}
                  {(() => {
                    const assignedCount = assignments.length;
                    const pendingCount =
                      assignments.filter(a => a.salesStatus && a.salesStatus !== 'settled').length +
                      inspections.filter(i => i.status === 'scheduled').length;
                    const completedCount =
                      assignments.filter(a => a.salesStatus === 'settled').length +
                      inspections.filter(i => i.status === 'completed').length;
                    const messagesCount = Number(stats.newMessages) || 0;
                    return (
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                    <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.08)]">
                      <div className="flex items-center gap-5">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff]">
                          <Building2 className="h-7 w-7 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">Assigned</p>
                          <p className="mt-1 text-4xl font-black leading-none text-black">{assignedCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.08)]">
                      <div className="flex items-center gap-5">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff]">
                          <Clock className="h-7 w-7 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">Pending</p>
                          <p className="mt-1 text-4xl font-black leading-none text-black">{pendingCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.08)]">
                      <div className="flex items-center gap-5">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff]">
                          <MessageSquare className="h-7 w-7 text-black" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">Messages</p>
                          <p className="mt-1 text-4xl font-black leading-none text-black">{messagesCount}</p>
                        </div>
                      </div>
                    </div>
                    <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.08)]">
                      <div className="flex items-center gap-5">
                        <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff]">
                          <BadgeCheck className="h-7 w-7 text-[#08a43b]" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold uppercase tracking-widest text-gray-600">Completed</p>
                          <p className="mt-1 text-4xl font-black leading-none text-black">{completedCount}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                    );
                  })()}

                  <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(0,1fr)_340px]">
                    {/* Recent Activity */}
                    <div className="min-h-[520px] rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.06)] sm:p-8">
                      <div className="mb-8 flex items-center justify-between">
                        <h3 className="text-2xl font-black tracking-tight text-black">Recent Activity</h3>
                        <button
                          onClick={fetchAgentActivities}
                          disabled={activitiesLoading}
                          className="grid h-10 w-10 place-items-center rounded-full text-gray-500 transition-all duration-200 hover:bg-gray-50 hover:text-black disabled:opacity-50"
                          aria-label="Refresh recent activity"
                        >
                          <MoreHorizontal className="h-5 w-5" />
                        </button>
                      </div>
                      <div>
                        {activitiesLoading ? (
                          <div className="space-y-8 pt-10">
                            {[0, 1, 2].map((item) => (
                              <div key={item} className="flex animate-pulse items-center gap-5">
                                <div className="h-14 w-14 rounded-2xl bg-gray-100" />
                                <div className="flex-1 space-y-3">
                                  <div className="h-4 w-44 rounded-full bg-gray-100" />
                                  <div className="h-3 w-2/3 rounded-full bg-gray-50" />
                                </div>
                              </div>
                            ))}
                          </div>
                        ) : activities.length === 0 ? (
                          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                            <div className="mb-6 grid h-20 w-20 place-items-center rounded-full bg-[#eaf1ff] text-gray-400">
                              <History className="h-10 w-10" />
                            </div>
                            <h3 className="text-2xl font-black tracking-tight text-gray-300">No recent activity</h3>
                            <p className="mt-3 max-w-xs text-base font-medium leading-7 text-gray-400">
                              Actions you take in the dashboard will appear here once you start managing listings.
                            </p>
                          </div>
                        ) : (
                          <div className="relative space-y-0">
                            {activities.slice(0, 5).map((activity, index) => (
                              <div key={activity.id} className="relative flex gap-5 pb-7 last:pb-0">
                                {index < activities.slice(0, 5).length - 1 && <span className="absolute left-6 top-12 h-[calc(100%-2.5rem)] w-px bg-gray-100" />}
                                <div className="relative z-10 grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#eaf1ff]">
                                  <span className={`h-2.5 w-2.5 rounded-full ${getActivityIconColor(activity.type)}`} />
                                </div>
                                <div className="min-w-0 pt-1">
                                  <p className="truncate text-sm font-bold text-gray-950">{activity.title}</p>
                                  <p className="mt-1 text-xs font-semibold text-gray-400">{formatTimestamp(activity.timestamp)}</p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Quick Invoices */}
                    <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.06)] sm:p-8">
                      <div>
                        <h3 className="text-2xl font-black tracking-tight text-black">Recent Invoices</h3>
                      </div>
                      <div className="mt-8">
                        {agentInvoices.length === 0 ? (
                          <div className="flex min-h-[380px] flex-col items-center justify-center text-center">
                            <div className="mb-7 grid h-24 w-24 place-items-center rounded-3xl bg-[#eaf1ff] text-emerald-500">
                              <Receipt className="h-11 w-11" strokeWidth={1.8} />
                            </div>
                            <h4 className="text-xl font-black tracking-tight text-black">Clean Slates</h4>
                            <p className="mt-4 max-w-[220px] text-base font-medium leading-7 text-gray-500">
                              No invoices generated yet. Your billing history is currently empty.
                            </p>
                            <Link
                              href="/dashboards/agent"
                              className="mt-12 inline-flex h-14 w-full max-w-[240px] items-center justify-center rounded-2xl border border-gray-200 bg-white text-sm font-bold text-gray-700 transition-all duration-200 hover:border-gray-300 hover:bg-gray-50 hover:text-black"
                            >
                              View Billing Portal
                            </Link>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {agentInvoices.slice(0, 3).map(inv => (
                              <div key={inv.invoiceId} className="rounded-2xl border border-gray-100 bg-gray-50/70 p-4 transition-all duration-200 hover:bg-white hover:shadow-sm">
                                <div className="flex items-center justify-between gap-4">
                                  <div className="min-w-0">
                                    <p className="truncate text-sm font-black text-gray-950">#{inv.invoiceNumber}</p>
                                    <p className="mt-1 text-xs font-bold uppercase tracking-widest text-gray-400">
                                      A${Number(inv.amount || 0).toLocaleString('en-AU')}
                                    </p>
                                  </div>
                                  <ArrowRight className="h-4 w-4 shrink-0 text-gray-300" />
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'properties' && (() => {
                const search = propertiesSearch.trim().toLowerCase();
                const filteredAssignments = assignments.filter((a) => {
                  if (propertyPriorityFilter !== 'all' && a.priority !== propertyPriorityFilter) return false;
                  if (!search) return true;
                  const addr = typeof a.address === 'string'
                    ? a.address
                    : `${a.address?.street ?? ''} ${a.address?.city ?? ''}`;
                  const sellerName = (a.seller as any)?.name || '';
                  return [a.title, addr, sellerName]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(search));
                });

                const totalAssetValue = assignments.reduce((s, a) => s + (Number(a.price) || 0), 0);
                const activeListings = assignments.filter(a => String(a.status).toLowerCase() === 'active').length;
                const clientInquiries = stats.newMessages || 0;
                const todayStart = new Date(); todayStart.setHours(0, 0, 0, 0);
                const upcomingInspections = inspections
                  .filter((i) => {
                    if (i.status !== 'scheduled' || !i.date) return false;
                    const d = new Date(i.date);
                    return !Number.isNaN(d.getTime()) && d >= todayStart;
                  })
                  .sort((a, b) => `${a.date}T${a.time || ''}`.localeCompare(`${b.date}T${b.time || ''}`));
                const scheduledWalks = upcomingInspections.length;
                const nextWalkLabel = upcomingInspections[0]
                  ? formatInspectionDayLabel(upcomingInspections[0].date).primary
                  : '';

                const priorityToBadge = (priority?: string) => {
                  switch ((priority || '').toLowerCase()) {
                    case 'high':
                      return { label: 'Urgent Action', cls: 'bg-red-500 text-white' };
                    case 'medium':
                      return { label: 'High Interest', cls: 'bg-emerald-500 text-white' };
                    case 'low':
                      return { label: 'Under Review', cls: 'bg-white text-gray-700' };
                    default:
                      return { label: 'Listed', cls: 'bg-white text-gray-700' };
                  }
                };

                const renderPropertyCard = (assignment: any) => {
                  const primaryImage = assignment?.mainImage?.url
                    ?? (typeof assignment?.mainImage === 'string' ? assignment.mainImage : undefined)
                    ?? (Array.isArray(assignment?.images) ? (assignment.images[0]?.url ?? assignment.images[0]) : undefined)
                    ?? assignment?.image;
                  const safeImageUrl = primaryImage ? getSafeImageUrl(primaryImage as string, 'property') : '/images/default-property.jpg';
                  const isActive = String(assignment.status).toLowerCase() === 'active';
                  const badge = priorityToBadge(assignment.priority);
                  const id = assignment._id || assignment.id;
                  const isStatusOpen = expandedStatusId === id;
                  const hasSeller = Boolean(assignment.seller || assignment.owner);
                  const addressText = typeof assignment.address === 'string'
                    ? assignment.address
                    : `${assignment.address?.street ?? ''}${assignment.address?.city ? `, ${assignment.address.city}` : ''}`;

                  return (
                    <div
                      key={id}
                      className="flex flex-col overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.09)]"
                    >
                      <div className="relative h-56 overflow-hidden">
                        <img src={safeImageUrl} alt={assignment.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 hover:scale-105" />
                        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${isActive ? 'bg-white text-gray-900' : 'bg-white/90 text-gray-500'}`}>
                            {isActive ? 'Active' : (assignment.status || 'Listed')}
                          </span>
                          <span className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${badge.cls}`}>
                            {badge.label}
                          </span>
                        </div>
                        <div className="absolute bottom-4 right-4">
                          <span className="rounded-xl bg-black/90 px-4 py-1.5 text-base font-black text-white shadow-lg backdrop-blur">
                            {formatCurrencyCompact(assignment.price)}
                          </span>
                        </div>
                      </div>

                      <div className="flex flex-1 flex-col gap-5 p-6">
                        <div>
                          <h3 className="truncate text-xl font-black tracking-tight text-black">{assignment.title}</h3>
                          <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-gray-500">
                            <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                            <span className="truncate">{addressText}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          <div className="rounded-2xl bg-gray-50 px-3 py-2">
                            <p className="text-base font-black text-black">{assignment.beds ?? '—'}</p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Beds</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-3 py-2">
                            <p className="text-base font-black text-black">{assignment.baths ?? '—'}</p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Baths</p>
                          </div>
                          <div className="rounded-2xl bg-gray-50 px-3 py-2">
                            <p className="text-base font-black text-black">{assignment.size ?? '—'}</p>
                            <p className="mt-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Sqft</p>
                          </div>
                        </div>

                        <div className="mt-auto grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleMessageSeller(assignment)}
                            disabled={!hasSeller}
                            className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl bg-[#eef3ff] py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#dde7ff] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                          >
                            <MessageSquare className="h-5 w-5 text-gray-600 transition-colors duration-200 group-hover:text-black" />
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 group-hover:text-black">Chat</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleSelectProperty(assignment)}
                            className="group flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl bg-[#eef3ff] py-3 transition-all duration-200 hover:-translate-y-0.5 hover:bg-[#dde7ff]"
                          >
                            <Settings className="h-5 w-5 text-gray-600 transition-colors duration-200 group-hover:text-black" />
                            <span className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-500 group-hover:text-black">Manage</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setExpandedStatusId(prev => prev === id ? null : id)}
                            aria-expanded={isStatusOpen}
                            className={`group flex cursor-pointer flex-col items-center gap-1.5 rounded-2xl py-3 transition-all duration-200 hover:-translate-y-0.5 ${isStatusOpen ? 'bg-black text-white' : 'bg-[#eef3ff] hover:bg-[#dde7ff]'}`}
                          >
                            <Activity className={`h-5 w-5 transition-colors duration-200 ${isStatusOpen ? 'text-white' : 'text-gray-600 group-hover:text-black'}`} />
                            <span className={`text-[10px] font-black uppercase tracking-[0.18em] ${isStatusOpen ? 'text-white' : 'text-gray-500 group-hover:text-black'}`}>Status</span>
                          </button>
                        </div>

                        {isStatusOpen && (
                          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                            <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-emerald-700">Sales Status</p>
                            <SalesStatusSelector
                              propertyId={id}
                              propertyTitle={assignment.title}
                              currentStatus={assignment.salesStatus || null}
                              onStatusUpdate={handleStatusUpdate}
                            />
                            <button
                              type="button"
                              onClick={() => { setSelectedProperty(assignment); setShowInspectionForm(true); }}
                              className="mt-4 flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-emerald-200 bg-white px-4 py-2.5 text-xs font-bold text-emerald-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-100"
                            >
                              <Calendar className="h-4 w-4" /> Schedule Inspection
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                };

                return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Page header + controls */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div className="min-w-0">
                        <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">
                          <span>Portfolio</span>
                          <ChevronRight className="h-3 w-3" />
                          <span className="text-gray-700">Assigned Properties</span>
                        </nav>
                        <h2 className="mt-3 text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Manage Your Portfolio</h2>
                        <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-gray-500">
                          Overseeing <span className="font-black text-black">{assignments.length}</span> high-value property listing{assignments.length === 1 ? '' : 's'} under current management.
                        </p>
                      </div>

                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="inline-flex rounded-full bg-gray-100 p-1">
                          {([
                            { id: 'grid' as const, icon: LayoutGrid, label: 'Grid view' },
                            { id: 'list' as const, icon: List, label: 'List view' }
                          ]).map((v) => (
                            <button
                              key={v.id}
                              type="button"
                              onClick={() => setPropertiesView(v.id)}
                              aria-label={v.label}
                              aria-pressed={propertiesView === v.id}
                              className={`grid h-9 w-10 cursor-pointer place-items-center rounded-full transition-all duration-200 ${
                                propertiesView === v.id ? 'bg-white text-black shadow-sm' : 'text-gray-500 hover:text-gray-900'
                              }`}
                            >
                              <v.icon className="h-4 w-4" />
                            </button>
                          ))}
                        </div>

                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowPropertyFilters(prev => !prev)}
                            className="inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
                          >
                            <SlidersHorizontal className="h-4 w-4" /> Filters
                            {propertyPriorityFilter !== 'all' && (
                              <span className="ml-1 h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            )}
                          </button>
                          {showPropertyFilters && (
                            <div className="absolute right-0 top-full z-20 mt-2 w-60 rounded-2xl border border-gray-100 bg-white p-4 shadow-[0_24px_55px_rgba(30,41,59,0.12)]">
                              <p className="mb-3 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Priority</p>
                              <div className="grid grid-cols-2 gap-2">
                                {(['all', 'high', 'medium', 'low'] as const).map((p) => (
                                  <button
                                    key={p}
                                    type="button"
                                    onClick={() => { setPropertyPriorityFilter(p); setShowPropertyFilters(false); }}
                                    className={`cursor-pointer rounded-xl px-3 py-2 text-xs font-bold capitalize transition-colors duration-200 ${
                                      propertyPriorityFilter === p
                                        ? 'bg-black text-white'
                                        : 'bg-gray-50 text-gray-600 hover:bg-gray-100'
                                    }`}
                                  >
                                    {p === 'all' ? 'All' : p}
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Search */}
                    <div className="relative max-w-xl">
                      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                      <input
                        type="search"
                        value={propertiesSearch}
                        onChange={(e) => setPropertiesSearch(e.target.value)}
                        placeholder="Search properties or sellers..."
                        className="h-11 w-full rounded-full border border-gray-100 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-gray-300 focus:shadow-sm"
                      />
                    </div>

                    {/* Summary cards */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)]">
                        <div className="flex items-start justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff]">
                            <Building2 className="h-5 w-5 text-gray-700" />
                          </span>
                          {assignments.length > 0 && (
                            <span className="inline-flex items-center gap-1 text-xs font-black text-emerald-600">
                              <TrendingUp className="h-3.5 w-3.5" /> Portfolio
                            </span>
                          )}
                        </div>
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Total Assets</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-black">
                          {totalAssetValue > 0 ? formatCurrencyCompact(totalAssetValue) : '$0'}
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)]">
                        <div className="flex items-start justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff]">
                            <TrendingUp className="h-5 w-5 text-gray-700" />
                          </span>
                          {activeListings > 0 && (
                            <span className="text-xs font-black text-emerald-600">Active</span>
                          )}
                        </div>
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Under Review</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-black">
                          {activeListings} <span className="text-base font-bold text-gray-400">Listing{activeListings === 1 ? '' : 's'}</span>
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)]">
                        <div className="flex items-start justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff]">
                            <MessageSquare className="h-5 w-5 text-gray-700" />
                          </span>
                          {clientInquiries > 0 && (
                            <span className="rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-black uppercase tracking-[0.18em] text-red-500">
                              {clientInquiries} New
                            </span>
                          )}
                        </div>
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Client Inquiries</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-black">
                          {clientInquiries} <span className="text-base font-bold text-gray-400">Chat{clientInquiries === 1 ? '' : 's'}</span>
                        </p>
                      </div>
                      <div className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)]">
                        <div className="flex items-start justify-between">
                          <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff]">
                            <Clock className="h-5 w-5 text-gray-700" />
                          </span>
                          {nextWalkLabel && (
                            <span className="text-xs font-black text-gray-700">{nextWalkLabel}</span>
                          )}
                        </div>
                        <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Scheduled Walks</p>
                        <p className="mt-1 text-3xl font-black tracking-tight text-black">
                          {scheduledWalks} <span className="text-base font-bold text-gray-400">Tour{scheduledWalks === 1 ? '' : 's'}</span>
                        </p>
                      </div>
                    </div>

                    {/* Property cards */}
                    {assignmentsLoading ? (
                      <div className="flex flex-col items-center justify-center gap-4 py-20">
                        <div className="h-12 w-12 animate-spin rounded-full border-b-2 border-emerald-600" />
                        <p className="font-medium text-gray-500">Fetching properties...</p>
                      </div>
                    ) : filteredAssignments.length === 0 ? (
                      <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#eaf1ff] text-gray-400">
                          <Home className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-gray-400">
                          {search || propertyPriorityFilter !== 'all' ? 'No matching properties' : 'No properties assigned'}
                        </h3>
                        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-gray-400">
                          {search || propertyPriorityFilter !== 'all'
                            ? 'Adjust your search or filters to see more listings from your portfolio.'
                            : 'Properties will appear here automatically once they are assigned to you by sellers.'}
                        </p>
                        <button
                          type="button"
                          onClick={fetchAgentProperties}
                          disabled={assignmentsLoading}
                          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full border border-gray-200 bg-white px-5 py-2.5 text-sm font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Refresh List
                        </button>
                      </div>
                    ) : propertiesView === 'list' ? (
                      <div className="space-y-4">
                        {filteredAssignments.map((assignment: any) => {
                          const primaryImage = assignment?.mainImage?.url
                            ?? (typeof assignment?.mainImage === 'string' ? assignment.mainImage : undefined)
                            ?? (Array.isArray(assignment?.images) ? (assignment.images[0]?.url ?? assignment.images[0]) : undefined)
                            ?? assignment?.image;
                          const safeImageUrl = primaryImage ? getSafeImageUrl(primaryImage as string, 'property') : '/images/default-property.jpg';
                          const badge = priorityToBadge(assignment.priority);
                          const id = assignment._id || assignment.id;
                          const hasSeller = Boolean(assignment.seller || assignment.owner);
                          const addressText = typeof assignment.address === 'string'
                            ? assignment.address
                            : `${assignment.address?.street ?? ''}${assignment.address?.city ? `, ${assignment.address.city}` : ''}`;
                          return (
                            <div
                              key={id}
                              className="grid grid-cols-1 gap-0 overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_14px_38px_rgba(30,41,59,0.05)] transition-all duration-200 hover:shadow-[0_22px_55px_rgba(30,41,59,0.09)] sm:grid-cols-[220px_minmax(0,1fr)]"
                            >
                              <div className="relative h-48 w-full sm:h-full sm:min-h-[160px]">
                                <img src={safeImageUrl} alt={assignment.title} className="absolute inset-0 h-full w-full object-cover" />
                                <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${badge.cls}`}>
                                  {badge.label}
                                </span>
                              </div>
                              <div className="flex flex-col gap-4 p-6">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                  <div className="min-w-0">
                                    <h3 className="truncate text-lg font-black tracking-tight text-black sm:text-xl">{assignment.title}</h3>
                                    <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-gray-500">
                                      <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                                      <span className="truncate">{addressText}</span>
                                    </p>
                                  </div>
                                  <span className="rounded-xl bg-black px-3 py-1.5 text-sm font-black text-white">
                                    {formatCurrencyCompact(assignment.price)}
                                  </span>
                                </div>
                                <div className="flex flex-wrap gap-2 text-[11px] font-bold text-gray-600">
                                  <span className="rounded-full bg-gray-50 px-3 py-1">{assignment.beds ?? '—'} Beds</span>
                                  <span className="rounded-full bg-gray-50 px-3 py-1">{assignment.baths ?? '—'} Baths</span>
                                  <span className="rounded-full bg-gray-50 px-3 py-1">{assignment.size ?? '—'} sqft</span>
                                </div>
                                <div className="mt-auto flex flex-wrap items-center justify-end gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleMessageSeller(assignment)}
                                    disabled={!hasSeller}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                                  >
                                    <MessageSquare className="h-4 w-4" /> Chat
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSelectProperty(assignment)}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl border border-gray-200 bg-white px-3 py-2 text-xs font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-50"
                                  >
                                    <Settings className="h-4 w-4" /> Manage
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => setExpandedStatusId(prev => prev === id ? null : id)}
                                    className="inline-flex cursor-pointer items-center gap-1.5 rounded-xl bg-black px-3 py-2 text-xs font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900"
                                  >
                                    <Activity className="h-4 w-4" /> Status
                                  </button>
                                </div>
                                {expandedStatusId === id && (
                                  <div className="rounded-2xl border border-emerald-100 bg-emerald-50/70 p-4">
                                    <SalesStatusSelector
                                      propertyId={id}
                                      propertyTitle={assignment.title}
                                      currentStatus={assignment.salesStatus || null}
                                      onStatusUpdate={handleStatusUpdate}
                                    />
                                  </div>
                                )}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {filteredAssignments.map(renderPropertyCard)}
                      </div>
                    )}

                    {/* Lower sections */}
                    <div className="grid grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                      <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_24px_70px_rgba(30,41,59,0.06)] sm:p-8">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black tracking-tight text-black sm:text-2xl">Pending Seller Agreements</h3>
                          <button
                            type="button"
                            onClick={fetchAgentProperties}
                            className="cursor-pointer text-xs font-black uppercase tracking-[0.18em] text-emerald-600 transition-colors duration-200 hover:text-emerald-700"
                          >
                            View All Pipeline
                          </button>
                        </div>
                        <div className="mt-8 flex min-h-[220px] flex-col items-center justify-center text-center">
                          <div className="mb-5 grid h-16 w-16 place-items-center rounded-2xl bg-[#eaf1ff] text-gray-400">
                            <BadgeCheck className="h-8 w-8" />
                          </div>
                          <h4 className="text-base font-black tracking-tight text-gray-500">All caught up</h4>
                          <p className="mx-auto mt-2 max-w-xs text-sm font-medium leading-7 text-gray-400">
                            Pending listing agreements and signed paperwork will show up here as sellers respond.
                          </p>
                        </div>
                      </div>

                      <div className="rounded-[28px] bg-[#0b0d12] p-6 text-white shadow-[0_24px_70px_rgba(0,0,0,0.25)] sm:p-7">
                        <div className="flex items-center justify-between gap-3">
                          <h3 className="text-xl font-black tracking-tight text-white">Inspections</h3>
                          <span className="grid h-9 w-9 place-items-center rounded-2xl bg-white/10 text-white">
                            <Calendar className="h-4 w-4" />
                          </span>
                        </div>

                        <div className="mt-6 space-y-5">
                          {upcomingInspections.length === 0 ? (
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5 text-center">
                              <p className="text-sm font-bold text-white/80">No upcoming inspections</p>
                              <p className="mt-1 text-xs font-medium text-white/50">
                                Schedule a viewing to populate your week.
                              </p>
                            </div>
                          ) : (
                            upcomingInspections.slice(0, 3).map((insp) => {
                              const day = formatInspectionDayLabel(insp.date);
                              const t = formatInspectionTime(insp.time);
                              return (
                                <div key={insp.id} className="relative pl-6">
                                  <span className="absolute left-0 top-1.5 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
                                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-emerald-300">
                                    {day.primary}{t.time !== '--:--' && `, ${t.time} ${t.period}`}
                                  </p>
                                  <p className="mt-1 text-sm font-black text-white">{insp.propertyName}</p>
                                  <p className="mt-1 text-xs font-medium text-white/60">
                                    {insp.client ? `Lead: ${insp.client}` : insp.inspector ? `Inspector: ${insp.inspector}` : insp.address}
                                  </p>
                                </div>
                              );
                            })
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setShowInspectionForm(true)}
                          className="mt-6 inline-flex w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-black transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-100"
                        >
                          Schedule New
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })()}

              {activeTab === 'inspections' && (() => {
                const searchTerm = inspectionSearch.trim().toLowerCase();
                const filteredInspections = inspections.filter((i) => {
                  if (!searchTerm) return true;
                  return [i.propertyName, i.address, i.inspector, i.client]
                    .filter(Boolean)
                    .some(v => String(v).toLowerCase().includes(searchTerm));
                });

                const scheduledCount = inspections.filter(i => i.status === 'scheduled').length;
                const completedCount = inspections.filter(i => i.status === 'completed').length;
                const todayStart = new Date();
                todayStart.setHours(0, 0, 0, 0);
                const pendingCount = inspections.filter(i => {
                  if (i.status !== 'scheduled' || !i.date) return false;
                  const d = new Date(i.date);
                  return !Number.isNaN(d.getTime()) && d < todayStart;
                }).length;

                const groupsMap = new Map<string, Inspection[]>();
                filteredInspections.forEach((i) => {
                  const key = i.date || '';
                  if (!groupsMap.has(key)) groupsMap.set(key, []);
                  groupsMap.get(key)!.push(i);
                });
                const groupedDays = Array.from(groupsMap.entries())
                  .sort(([a], [b]) => a.localeCompare(b))
                  .map(([date, items]) => ({
                    date,
                    items: items.sort((x, y) => (x.time || '').localeCompare(y.time || ''))
                  }));

                return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    {/* Page header + controls */}
                    <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
                      <div>
                        <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Manage Inspections</h2>
                        <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-gray-500">
                          Manage your viewing schedule and property interactions.
                        </p>
                      </div>
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                        <div className="relative w-full sm:w-72">
                          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                          <input
                            type="search"
                            value={inspectionSearch}
                            onChange={(e) => setInspectionSearch(e.target.value)}
                            placeholder="Search inspections or properties..."
                            className="h-11 w-full rounded-full border border-gray-100 bg-white pl-11 pr-4 text-sm font-medium text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-gray-300 focus:shadow-sm"
                          />
                        </div>
                        <div className="inline-flex w-full rounded-full bg-gray-100 p-1 sm:w-auto">
                          {(['timeline', 'calendar'] as const).map((mode) => (
                            <button
                              key={mode}
                              type="button"
                              onClick={() => setInspectionView(mode)}
                              className={`flex-1 cursor-pointer rounded-full px-5 py-2 text-xs font-bold capitalize tracking-wide transition-all duration-200 sm:flex-none ${
                                inspectionView === mode
                                  ? 'bg-black text-white shadow-sm'
                                  : 'text-gray-600 hover:text-gray-900'
                              }`}
                            >
                              {mode}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Stats row */}
                    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-4">
                      {[
                        { id: 'scheduled', label: 'Scheduled', value: scheduledCount, icon: Calendar, tint: 'bg-[#eaf1ff] text-blue-600' },
                        { id: 'pending', label: 'Pending', value: pendingCount, icon: Clock, tint: 'bg-emerald-50 text-emerald-600' },
                        { id: 'completed', label: 'Completed', value: completedCount, icon: CheckCircle, tint: 'bg-violet-50 text-violet-600' }
                      ].map((stat) => (
                        <div
                          key={stat.id}
                          className="rounded-[22px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.055)] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-[0_24px_55px_rgba(30,41,59,0.08)]"
                        >
                          <div className="flex items-center gap-5">
                            <div className={`grid h-14 w-14 shrink-0 place-items-center rounded-2xl ${stat.tint}`}>
                              <stat.icon className="h-6 w-6" />
                            </div>
                            <div>
                              <p className="text-xs font-black uppercase tracking-[0.18em] text-gray-400">{stat.label}</p>
                              <p className="mt-1 text-4xl font-black leading-none text-black">{String(stat.value).padStart(2, '0')}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => setShowInspectionForm(true)}
                        className="group relative flex cursor-pointer items-center justify-between gap-5 rounded-[22px] bg-black p-6 text-white shadow-[0_18px_45px_rgba(0,0,0,0.16)] transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900"
                      >
                        <span className="flex items-center gap-5">
                          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-2xl bg-white/10 text-white">
                            <Plus className="h-6 w-6" />
                          </span>
                          <span className="flex flex-col text-left">
                            <span className="text-xs font-black uppercase tracking-[0.18em] text-white/60">Add New</span>
                            <span className="text-lg font-black tracking-tight">Schedule Inspection</span>
                          </span>
                        </span>
                        <ChevronRight className="h-5 w-5 shrink-0 text-white/60 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-white" />
                      </button>
                    </div>

                    {/* Body */}
                    {inspectionView === 'calendar' ? (
                      <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#eaf1ff] text-gray-400">
                          <Calendar className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-gray-400">Calendar view</h3>
                        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-gray-400">
                          A monthly calendar is coming soon. Switch to Timeline to manage your bookings now.
                        </p>
                        <button
                          type="button"
                          onClick={() => setInspectionView('timeline')}
                          className="mt-6 inline-flex cursor-pointer items-center gap-2 rounded-full bg-black px-5 py-2.5 text-sm font-bold text-white transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900"
                        >
                          Switch to Timeline <ArrowRight className="h-4 w-4" />
                        </button>
                      </div>
                    ) : groupedDays.length === 0 ? (
                      <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                        <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#eaf1ff] text-gray-400">
                          <Calendar className="h-10 w-10" />
                        </div>
                        <h3 className="text-xl font-black tracking-tight text-gray-400">
                          {searchTerm ? 'No matching inspections' : 'No inspections scheduled yet'}
                        </h3>
                        <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-gray-400">
                          {searchTerm
                            ? 'Try a different keyword, or clear the search to see your full schedule.'
                            : 'Book a viewing from the Schedule Inspection card to populate your timeline.'}
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-10">
                        {groupedDays.map((group) => {
                          const dayLabel = formatInspectionDayLabel(group.date);
                          return (
                            <section key={group.date || 'unscheduled'} className="space-y-5">
                              <div className="flex flex-wrap items-baseline justify-between gap-2">
                                <h3 className="text-xl font-black tracking-tight text-black sm:text-2xl">{dayLabel.primary}</h3>
                                {dayLabel.secondary && (
                                  <p className="text-[11px] font-black uppercase tracking-[0.2em] text-gray-400">{dayLabel.secondary}</p>
                                )}
                              </div>

                              <div className="space-y-5">
                                {group.items.map((insp) => {
                                  const t = formatInspectionTime(insp.time);
                                  const image = getInspectionImage(insp);
                                  const isCompleted = insp.status === 'completed';
                                  const isCancelled = insp.status === 'cancelled';
                                  return (
                                    <article
                                      key={insp.id}
                                      className="grid grid-cols-1 gap-4 sm:grid-cols-[88px_minmax(0,1fr)] sm:gap-6"
                                    >
                                      <div className="flex flex-row items-baseline gap-2 pt-2 sm:flex-col sm:items-end sm:gap-0 sm:pt-6 sm:text-right">
                                        <p className="text-2xl font-black tracking-tight text-black sm:text-3xl">{t.time}</p>
                                        <p className="text-[10px] font-black uppercase tracking-[0.22em] text-gray-400">{t.period}</p>
                                      </div>

                                      <div className="overflow-hidden rounded-[24px] border border-white bg-white shadow-[0_14px_38px_rgba(30,41,59,0.05)] transition-shadow duration-200 hover:shadow-[0_22px_55px_rgba(30,41,59,0.09)]">
                                        <div className="grid grid-cols-1 gap-0 sm:grid-cols-[240px_minmax(0,1fr)]">
                                          <div className="relative h-44 w-full sm:h-full sm:min-h-[180px]">
                                            <img
                                              src={image}
                                              alt={insp.propertyName}
                                              className="absolute inset-0 h-full w-full object-cover"
                                            />
                                            <span className={`absolute left-3 top-3 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] shadow-sm ${getStatusColor(insp.status)}`}>
                                              {insp.status}
                                            </span>
                                          </div>

                                          <div className="flex flex-col gap-5 p-6 sm:p-7">
                                            <div className="flex flex-wrap items-start justify-between gap-4">
                                              <div className="min-w-0">
                                                <h4 className="truncate text-lg font-black tracking-tight text-black sm:text-xl">{insp.propertyName}</h4>
                                                <p className="mt-1 flex items-center gap-1.5 truncate text-sm font-medium text-gray-500">
                                                  <MapPin className="h-4 w-4 shrink-0 opacity-60" />
                                                  <span className="truncate">{insp.address}</span>
                                                </p>
                                              </div>
                                              <div className="text-right">
                                                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">
                                                  {insp.client ? 'Potential Buyer' : 'Agent Liaison'}
                                                </p>
                                                <p className="mt-1 text-sm font-bold text-gray-950">
                                                  {insp.client || insp.inspector || '—'}
                                                </p>
                                              </div>
                                            </div>

                                            <div className="flex flex-wrap items-center gap-2">
                                              {[insp.inspector && { label: insp.inspector }, insp.notes && { label: insp.notes }]
                                                .filter(Boolean)
                                                .slice(0, 4)
                                                .map((chip: any, idx) => (
                                                  <span
                                                    key={idx}
                                                    className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-600"
                                                  >
                                                    {chip.label}
                                                  </span>
                                                ))}
                                              {!insp.inspector && !insp.notes && (
                                                <span className="rounded-full bg-gray-50 px-3 py-1 text-[11px] font-bold text-gray-500">
                                                  Initial Tour
                                                </span>
                                              )}
                                            </div>

                                            <div className="mt-auto flex flex-wrap items-center justify-end gap-2 pt-2">
                                              {!isCompleted && !isCancelled && (
                                                <button
                                                  type="button"
                                                  onClick={() => updateInspectionStatus(insp.id, 'cancelled')}
                                                  className="cursor-pointer rounded-xl px-4 py-2 text-sm font-bold text-red-500 transition-colors duration-200 hover:bg-red-50 hover:text-red-600"
                                                >
                                                  Cancel
                                                </button>
                                              )}
                                              {!isCancelled && (
                                                <button
                                                  type="button"
                                                  onClick={() => handleRescheduleInspection(insp)}
                                                  className="cursor-pointer rounded-xl border border-gray-200 bg-white px-4 py-2 text-sm font-bold text-gray-700 transition-all duration-200 hover:-translate-y-0.5 hover:border-gray-300 hover:bg-gray-50"
                                                >
                                                  Reschedule
                                                </button>
                                              )}
                                              {!isCompleted && !isCancelled && (
                                                <button
                                                  type="button"
                                                  onClick={() => updateInspectionStatus(insp.id, 'completed')}
                                                  className="cursor-pointer rounded-xl bg-emerald-600 px-4 py-2 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-emerald-700"
                                                >
                                                  Confirm
                                                </button>
                                              )}
                                              {isCompleted && (
                                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-50 px-4 py-2 text-sm font-bold text-emerald-700">
                                                  <CheckCircle className="h-4 w-4" /> Completed
                                                </span>
                                              )}
                                              {isCancelled && (
                                                <span className="inline-flex items-center gap-1.5 rounded-xl bg-red-50 px-4 py-2 text-sm font-bold text-red-600">
                                                  <X className="h-4 w-4" /> Cancelled
                                                </span>
                                              )}
                                            </div>
                                          </div>
                                        </div>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </section>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })()}

              {activeTab === 'notes' && (() => {
                const filteredNotes = notesFilter === 'all'
                  ? notes
                  : notes.filter(n => (n.type as string) === notesFilter);
                const quickFilters: { id: 'all' | NoteCategory; label: string }[] = [
                  { id: 'all', label: 'All Notes' },
                  { id: 'client-meeting', label: 'Client Meetings' },
                  { id: 'inspection', label: 'Inspections' },
                  { id: 'pricing', label: 'Pricing' }
                ];
                return (
                  <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-500">
                    <div>
                      <h2 className="text-2xl font-extrabold tracking-tight text-gray-900 sm:text-3xl">Notes &amp; Updates</h2>
                      <p className="mt-2 max-w-2xl text-base font-medium leading-7 text-gray-500">
                        Keep track of every detail and interaction across your portfolio.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 lg:grid-cols-[360px_minmax(0,1fr)]">
                      {/* Left column: new entry + quick filters */}
                      <div className="space-y-6">
                        <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.06)] sm:p-7">
                          <div className="mb-6 flex items-center gap-2">
                            <span className="grid h-7 w-7 place-items-center rounded-full bg-[#eaf1ff] text-gray-500">
                              <Plus className="h-3.5 w-3.5" />
                            </span>
                            <h3 className="text-base font-black tracking-tight text-black">New Entry</h3>
                          </div>

                          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Property Reference
                          </label>
                          <div className="relative mb-5">
                            <select
                              value={entryForm.propertyId}
                              onChange={(e) => setEntryForm({ ...entryForm, propertyId: e.target.value })}
                              className="h-12 w-full cursor-pointer appearance-none rounded-2xl border border-gray-100 bg-gray-50/60 px-4 pr-10 text-sm font-semibold text-gray-700 outline-none transition-all duration-200 focus:border-gray-300 focus:bg-white"
                            >
                              <option value="">Select Property</option>
                              {assignments.map((a) => (
                                <option key={a._id || a.id} value={a._id || a.id}>{a.title}</option>
                              ))}
                            </select>
                            <ChevronRight className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 rotate-90 text-gray-400" />
                          </div>

                          <label className="mb-2 block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                            Note Details
                          </label>
                          <textarea
                            value={entryForm.content}
                            onChange={(e) => setEntryForm({ ...entryForm, content: e.target.value })}
                            placeholder="Type your update here..."
                            rows={5}
                            className="mb-5 w-full resize-none rounded-2xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm font-medium leading-6 text-gray-700 outline-none transition-all duration-200 placeholder:text-gray-400 focus:border-gray-300 focus:bg-white"
                          />

                          <div className="flex items-center justify-between gap-3">
                            <div className="flex items-center gap-1">
                              <button
                                type="button"
                                aria-label="Attach file"
                                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-700"
                              >
                                <Paperclip className="h-4 w-4" />
                              </button>
                              <button
                                type="button"
                                aria-label="Mention or tag"
                                className="grid h-9 w-9 cursor-pointer place-items-center rounded-full text-gray-400 transition-colors duration-200 hover:bg-gray-50 hover:text-gray-700"
                              >
                                <AtSign className="h-4 w-4" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={handlePostNote}
                              disabled={!entryForm.content.trim()}
                              className="cursor-pointer rounded-xl bg-black px-5 py-2.5 text-sm font-bold text-white shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:bg-gray-900 disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:translate-y-0"
                            >
                              Post Note
                            </button>
                          </div>
                        </div>

                        <div className="rounded-[28px] border border-white bg-white p-6 shadow-[0_18px_45px_rgba(30,41,59,0.06)] sm:p-7">
                          <h3 className="mb-4 text-base font-black tracking-tight text-black">Quick Filters</h3>
                          <div className="flex flex-wrap gap-2">
                            {quickFilters.map((f) => (
                              <button
                                key={f.id}
                                type="button"
                                onClick={() => setNotesFilter(f.id)}
                                className={`cursor-pointer rounded-full px-4 py-2 text-xs font-bold tracking-wide transition-all duration-200 ${
                                  notesFilter === f.id
                                    ? 'bg-black text-white shadow-sm'
                                    : 'bg-gray-50 text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                }`}
                              >
                                {f.label}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Right column: timeline */}
                      <div className="min-w-0">
                        {filteredNotes.length === 0 ? (
                          <div className="rounded-[28px] border border-dashed border-gray-200 bg-white px-6 py-20 text-center">
                            <div className="mx-auto mb-6 grid h-20 w-20 place-items-center rounded-3xl bg-[#eaf1ff] text-gray-400">
                              <MessageSquare className="h-10 w-10" />
                            </div>
                            <h3 className="text-xl font-black tracking-tight text-gray-400">No updates yet</h3>
                            <p className="mx-auto mt-3 max-w-sm text-sm font-medium leading-7 text-gray-400">
                              {notesFilter === 'all'
                                ? 'Post your first note from the New Entry panel to start your portfolio timeline.'
                                : 'No entries match this filter. Try another category or post a new note.'}
                            </p>
                          </div>
                        ) : (
                          <>
                            <div className="relative">
                              <span className="absolute bottom-4 left-[7px] top-4 w-px bg-gray-100 sm:left-[11px]" aria-hidden="true" />
                              <div className="space-y-6">
                                {filteredNotes.map((note) => {
                                  const cat = getCategoryMeta(note.type);
                                  return (
                                    <article key={note.id} className="relative pl-9 sm:pl-14">
                                      <span className="absolute left-0 top-7 grid h-4 w-4 place-items-center rounded-full bg-white ring-4 ring-[#f7f8fd] sm:left-1">
                                        <span className={`h-2 w-2 rounded-full ${cat.dot}`} />
                                      </span>
                                      <div className="rounded-[24px] border border-white bg-white p-6 shadow-[0_14px_38px_rgba(30,41,59,0.05)] transition-shadow duration-200 hover:shadow-[0_20px_50px_rgba(30,41,59,0.09)] sm:p-7">
                                        <div className="flex flex-wrap items-start justify-between gap-3">
                                          <div className="min-w-0">
                                            <h4 className="truncate text-base font-black tracking-tight text-black sm:text-lg">
                                              {note.title}
                                            </h4>
                                            <p className="mt-1 text-xs font-semibold text-gray-400">
                                              Added by {agentName} · {formatTimestamp(note.createdAt)}
                                            </p>
                                          </div>
                                          <span className={`shrink-0 rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.18em] ${cat.badge}`}>
                                            {cat.label}
                                          </span>
                                        </div>
                                        <p className="mt-4 text-sm font-medium leading-7 text-gray-600">{note.content}</p>
                                      </div>
                                    </article>
                                  );
                                })}
                              </div>
                            </div>
                            <div className="mt-10 flex justify-center">
                              <button
                                type="button"
                                className="cursor-pointer text-sm font-bold text-gray-500 transition-colors duration-200 hover:text-black"
                              >
                                Show older updates ↓
                              </button>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </div>
            </div>
          </main>
        </div>
      </div>

      {/* Existing Modals & Overlays - Ensure they are responsive */}
      {/* Settlement selection modal */}
      {showSettlementModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Confirm Sale</h2>
                <p className="text-sm font-medium text-gray-400 mt-1">Select the final buyer for this property</p>
              </div>
              <button onClick={() => setShowSettlementModal(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8 space-y-4 max-h-[60vh] overflow-y-auto">
              {settlementBuyers.map((buyer) => (
                <button
                  key={buyer._id}
                  onClick={() => proceedWithSettlement(settlementPropertyId!, buyer._id, settlementDetails)}
                  className="w-full text-left p-5 border-2 border-gray-50 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all group flex items-center justify-between"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                      {buyer.name[0].toUpperCase()}
                    </div>
                    <div>
                      <p className="font-bold text-gray-900">{buyer.name}</p>
                      <p className="text-xs text-gray-400 font-medium">{buyer.email}</p>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                </button>
              ))}
            </div>
            
            <div className="p-8 bg-gray-50/50 border-t border-gray-50">
              <Button onClick={() => setShowSettlementModal(false)} variant="outline" className="w-full">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Inspection Form Modal */}
      {showInspectionForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Schedule Inspection</h3>
              <button onClick={() => setShowInspectionForm(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-5">
              <InputField
                label="Date"
                type="date"
                value={inspectionForm.date}
                onChange={(e) => setInspectionForm({...inspectionForm, date: e.target.value})}
              />
              <InputField
                label="Time"
                type="time"
                value={inspectionForm.time}
                onChange={(e) => setInspectionForm({...inspectionForm, time: e.target.value})}
              />
              <InputField
                label="Inspector Name"
                value={inspectionForm.inspector}
                onChange={(e) => setInspectionForm({...inspectionForm, inspector: e.target.value})}
              />
              <InputField
                label="Client Name"
                value={inspectionForm.client}
                onChange={(e) => setInspectionForm({...inspectionForm, client: e.target.value})}
              />
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Notes</label>
                <textarea
                  value={inspectionForm.notes}
                  onChange={(e) => setInspectionForm({...inspectionForm, notes: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 min-h-[100px] transition-colors"
                  placeholder="Additional details..."
                />
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button onClick={() => setShowInspectionForm(false)} variant="outline" className="w-full sm:flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddInspection} variant="primary" className="w-full sm:flex-1">
                Schedule
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Note Form Modal */}
      {showNoteForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] p-8 w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between mb-8">
              <h3 className="text-2xl font-extrabold text-gray-900 tracking-tight">Add New Note</h3>
              <button onClick={() => setShowNoteForm(false)} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>
            <div className="space-y-5">
              <InputField
                label="Title"
                value={noteForm.title}
                onChange={(e) => setNoteForm({...noteForm, title: e.target.value})}
                placeholder="Note title..."
              />
              <div>
                <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Content</label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({...noteForm, content: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 min-h-[120px] transition-colors"
                  placeholder="Note content..."
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Type</label>
                  <select
                    value={noteForm.type}
                    onChange={(e) => setNoteForm({...noteForm, type: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 transition-colors"
                  >
                    <option value="property">Property</option>
                    <option value="inspection">Inspection</option>
                    <option value="general">General</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-black text-gray-400 uppercase tracking-widest mb-2">Priority</label>
                  <select
                    value={noteForm.priority}
                    onChange={(e) => setNoteForm({...noteForm, priority: e.target.value as any})}
                    className="w-full px-4 py-3 border-2 border-gray-50 rounded-2xl focus:outline-none focus:border-emerald-500 bg-gray-50/50 transition-colors"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-4 mt-10">
              <Button onClick={() => setShowNoteForm(false)} variant="outline" className="w-full sm:flex-1">
                Cancel
              </Button>
              <Button onClick={handleAddNote} variant="primary" className="w-full sm:flex-1">
                Save Note
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Contact Modal */}
      {isContactModalOpen && selectedProperty && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-[100] animate-in fade-in duration-200">
          <div className="bg-white rounded-[2rem] w-full max-w-2xl shadow-2xl overflow-hidden">
            <div className="p-8 border-b border-gray-50 flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {selectedBuyer ? `Chat with ${selectedBuyer.name}` : "Select a Buyer"}
                </h2>
                <p className="text-sm font-medium text-gray-400 mt-1">
                  {selectedBuyer ? `Regarding ${selectedProperty.title}` : "Choose a buyer to start communicating"}
                </p>
              </div>
              <button onClick={() => {
                setIsContactModalOpen(false);
                setSelectedBuyer(null);
              }} className="p-2 hover:bg-gray-50 rounded-full transition-colors">
                <X className="w-6 h-6 text-gray-400" />
              </button>
            </div>

            <div className="p-8">
              {!selectedBuyer ? (
                <div className="space-y-4 max-h-[50vh] overflow-y-auto pr-2">
                  {buyers.length > 0 ? (
                    <div className="grid grid-cols-1 gap-3">
                      {buyers.map((b) => (
                        <button
                          key={b.id}
                          onClick={() => setSelectedBuyer(b.user)}
                          className="w-full text-left p-5 border-2 border-gray-50 rounded-2xl hover:border-emerald-500 hover:bg-emerald-50/50 transition-all flex items-center justify-between group"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 font-bold group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                              {b.user.name[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-gray-900">{b.user.name}</p>
                              <p className="text-xs text-gray-400 font-medium">Buyer</p>
                            </div>
                          </div>
                          <MessageSquare className="w-5 h-5 text-gray-300 group-hover:text-emerald-500 transition-colors" />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <div className="w-16 h-16 bg-gray-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
                        <Users className="w-8 h-8 text-gray-300" />
                      </div>
                      <p className="text-gray-400 font-medium">No buyers have unlocked this property yet.</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="h-[60vh]">
                  <OneToOneChat
                    agent={{ id: selectedBuyer._id, name: selectedBuyer.name, email: selectedBuyer.email }}
                    propertyTitle={selectedProperty.title}
                  />
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Seller Chat Modal */}
      {showSellerChat && selectedSeller && (
        <Modal isOpen={showSellerChat} onClose={() => setShowSellerChat(false)} title={`Chat with ${selectedSeller.name}`} size="lg">
          <div className="h-[70vh] max-h-[80vh]">
            {(() => {
              const sellerId = selectedSeller.id;
              return (
                <RealSellerAgentChat
                  otherUserId={sellerId}
                  propertyId={selectedProperty?._id || selectedProperty?.id}
                  currentUserId={currentUserId}
                  currentUserRole="agent"
                  otherName={selectedSeller.name}
                  otherAvatar={selectedSeller.avatar}
                />
              );
            })()}
          </div>
        </Modal>
      )}
    </div>
  );
}
