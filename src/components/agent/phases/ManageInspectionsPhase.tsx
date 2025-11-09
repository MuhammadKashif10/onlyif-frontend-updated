'use client';

import React, { useEffect, useState } from 'react';
import { useAgentContext } from '@/context/AgentContext';
import Button from '@/components/reusable/Button';
import InputField from '@/components/reusable/InputField';

interface InspectionFormData {
  date: string;
  time: string;
  inspector: string;
  client: string;
  notes: string;
}

export default function ManageInspectionsPhase() {
  const { 
    agentData, 
    updateAgentData, 
    addInspection, 
    updateInspection, 
    deleteInspection,
    nextPhase, 
    previousPhase, 
    setLoading, 
    loading 
  } = useAgentContext();
  
  const [inspections, setInspections] = useState(agentData.inspections);
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState<string | null>(null);
  const [formData, setFormData] = useState<InspectionFormData>({
    date: '',
    time: '',
    inspector: '',
    client: '',
    notes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    // Simulate fetching inspections for the selected property
    const fetchInspections = async () => {
      if (!agentData.selectedProperty) return;
      
      setLoading(true);
      try {
        // Use real API call to fetch inspections
        const response = await fetch(`/api/inspections?propertyId=${agentData.selectedProperty.id}`, {
          headers: {
            'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
            'Content-Type': 'application/json'
          }
        });
        
        if (!response.ok) throw new Error('Failed to fetch inspections');
        
        const data = await response.json();
        const inspections = data.data || data;
        
        setInspections(inspections);
        updateAgentData({ inspections });
      } catch (error) {
        console.error('Error fetching inspections:', error);
        setInspections([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInspections();
  }, [agentData.selectedProperty, setLoading, updateAgentData]);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.date) newErrors.date = 'Date is required';
    if (!formData.time) newErrors.time = 'Time is required';
    if (!formData.inspector) newErrors.inspector = 'Inspector name is required';
    if (!formData.client) newErrors.client = 'Client name is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm() || !agentData.selectedProperty) return;
    
    const inspectionData = {
      propertyId: agentData.selectedProperty.id,
      propertyName: agentData.selectedProperty.title,
      address: agentData.selectedProperty.address,
      date: formData.date,
      time: formData.time,
      status: 'scheduled' as const,
      inspector: formData.inspector,
      client: formData.client,
      notes: formData.notes
    };

    if (editingInspection) {
      updateInspection(editingInspection, inspectionData);
      const updatedInspections = inspections.map(inspection => 
        inspection.id === editingInspection 
          ? { ...inspection, ...inspectionData }
          : inspection
      );
      setInspections(updatedInspections);
    } else {
      const newInspection = {
        id: Date.now().toString(),
        ...inspectionData
      };
      addInspection(inspectionData);
      setInspections([...inspections, newInspection]);
    }
    
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      date: '',
      time: '',
      inspector: '',
      client: '',
      notes: ''
    });
    setShowForm(false);
    setEditingInspection(null);
    setErrors({});
  };

  const handleEdit = (inspection: any) => {
    setFormData({
      date: inspection.date,
      time: inspection.time,
      inspector: inspection.inspector,
      client: inspection.client,
      notes: inspection.notes || ''
    });
    setEditingInspection(inspection.id);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this inspection?')) {
      deleteInspection(id);
      setInspections(inspections.filter(inspection => inspection.id !== id));
    }
  };

  const handleStatusUpdate = (id: string, status: 'scheduled' | 'completed' | 'cancelled') => {
    updateInspection(id, { status });
    const updatedInspections = inspections.map(inspection => 
      inspection.id === id ? { ...inspection, status } : inspection
    );
    setInspections(updatedInspections);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
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

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Manage Inspections</h2>
            <p className="text-gray-600 mt-1">
              {agentData.selectedProperty ? `For: ${agentData.selectedProperty.title}` : 'Schedule and manage property inspections'}
            </p>
          </div>
          <Button
            onClick={() => setShowForm(true)}
            variant="primary"
          >
            Schedule Inspection
          </Button>
        </div>

        {/* Inspection Form */}
        {showForm && (
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              {editingInspection ? 'Edit Inspection' : 'Schedule New Inspection'}
            </h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  error={errors.date}
                  required
                />
                <InputField
                  label="Time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  error={errors.time}
                  required
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Inspector"
                  type="text"
                  value={formData.inspector}
                  onChange={(e) => setFormData({ ...formData, inspector: e.target.value })}
                  error={errors.inspector}
                  placeholder="Inspector name"
                  required
                />
                <InputField
                  label="Client"
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  error={errors.client}
                  placeholder="Client name"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Additional notes or special instructions"
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div className="flex gap-3">
                <Button type="submit" variant="primary">
                  {editingInspection ? 'Update Inspection' : 'Schedule Inspection'}
                </Button>
                <Button type="button" onClick={resetForm} variant="secondary">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        {/* Inspections List */}
        <div className="space-y-4">
          {inspections.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-gray-400 text-lg mb-2">No inspections scheduled</div>
              <p className="text-gray-500">Schedule your first inspection to get started.</p>
            </div>
          ) : (
            inspections.map((inspection) => (
              <div key={inspection.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">
                        {new Date(inspection.date).toLocaleDateString()} at {inspection.time}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600 space-y-1">
                      <div><strong>Inspector:</strong> {inspection.inspector}</div>
                      <div><strong>Client:</strong> {inspection.client}</div>
                      {inspection.notes && (
                        <div><strong>Notes:</strong> {inspection.notes}</div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 ml-4">
                    {inspection.status === 'scheduled' && (
                      <>
                        <Button
                          onClick={() => handleStatusUpdate(inspection.id, 'completed')}
                          variant="primary"
                          size="sm"
                        >
                          Mark Completed
                        </Button>
                        <Button
                          onClick={() => handleEdit(inspection)}
                          variant="secondary"
                          size="sm"
                        >
                          Edit
                        </Button>
                      </>
                    )}
                    <Button
                      onClick={() => handleDelete(inspection.id)}
                      variant="secondary"
                      size="sm"
                      className="text-red-600 hover:text-red-700"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Navigation */}
        <div className="flex flex-col sm:flex-row gap-3 mt-6 pt-6 border-t border-gray-200">
          <Button onClick={previousPhase} variant="secondary" className="flex-1">
            Back to Property Details
          </Button>
          <Button onClick={nextPhase} variant="primary" className="flex-1">
            Manage Notes
          </Button>
        </div>
      </div>
    </div>
  );
}