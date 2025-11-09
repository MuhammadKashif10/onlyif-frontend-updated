'use client';

import React, { useState, useEffect } from 'react';
import Button from '@/components/reusable/Button';
import Modal from '@/components/reusable/Modal';
import InputField from '@/components/reusable/InputField';
import DatePicker from '@/components/reusable/DatePicker';
import TimeSlotSelector from '@/components/reusable/TimeSlotSelector';
import TextArea from '@/components/reusable/TextArea';
import Loader from '@/components/reusable/Loader';
import { notificationAPI } from '@/api/notifications';

interface Inspection {
  id: string;
  propertyId: string;
  propertyName: string;
  propertyAddress: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  inspector: string;
  client: string;
  clientEmail: string;
  clientPhone: string;
  notes: string;
  internalNotes: string;
  reminderSent: boolean;
  createdAt: string;
}

interface InspectionManagerProps {
  agentId: string;
  className?: string;
}

export default function InspectionManager({ agentId, className = '' }: InspectionManagerProps) {
  const [inspections, setInspections] = useState<Inspection[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingInspection, setEditingInspection] = useState<Inspection | null>(null);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [formData, setFormData] = useState({
    propertyId: '',
    propertyName: '',
    propertyAddress: '',
    inspector: '',
    client: '',
    clientEmail: '',
    clientPhone: '',
    notes: '',
    internalNotes: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    loadInspections();
  }, [agentId]);

  const loadInspections = async () => {
    try {
      setLoading(true);
      // Use real API call instead of mock data
      const response = await fetch('/api/inspections', {
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) throw new Error('Failed to load inspections');
      
      const data = await response.json();
      setInspections(data.data || data);
    } catch (error) {
      console.error('Error loading inspections:', error);
      setInspections([]);
    } finally {
      setLoading(false);
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    
    if (!formData.propertyName) newErrors.propertyName = 'Property name is required';
    if (!formData.propertyAddress) newErrors.propertyAddress = 'Property address is required';
    if (!selectedDate) newErrors.date = 'Date is required';
    if (!selectedTime) newErrors.time = 'Time is required';
    if (!formData.inspector) newErrors.inspector = 'Inspector name is required';
    if (!formData.client) newErrors.client = 'Client name is required';
    if (!formData.clientEmail) newErrors.clientEmail = 'Client email is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    try {
      const inspectionData: Inspection = {
        id: editingInspection?.id || Date.now().toString(),
        propertyId: formData.propertyId || Date.now().toString(),
        propertyName: formData.propertyName,
        propertyAddress: formData.propertyAddress,
        date: selectedDate,
        time: selectedTime,
        status: 'scheduled',
        inspector: formData.inspector,
        client: formData.client,
        clientEmail: formData.clientEmail,
        clientPhone: formData.clientPhone,
        notes: formData.notes,
        internalNotes: formData.internalNotes,
        reminderSent: false,
        createdAt: editingInspection?.createdAt || new Date().toISOString()
      };
      
      if (editingInspection) {
        setInspections(prev => prev.map(i => i.id === editingInspection.id ? inspectionData : i));
      } else {
        setInspections(prev => [...prev, inspectionData]);
        
        // Send notification to seller
        await notificationAPI.createNotification({
          userId: 'seller-id', // Would get from property data
          userType: 'seller',
          type: 'inspection_booked',
          title: 'Inspection Scheduled',
          message: `An inspection has been booked for your property on ${selectedDate} at ${selectedTime}`,
          data: { propertyId: inspectionData.propertyId, date: selectedDate, time: selectedTime },
          read: false,
          emailSent: false
        });
      }
      
      resetForm();
      setShowForm(false);
    } catch (error) {
      console.error('Error saving inspection:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      propertyId: '',
      propertyName: '',
      propertyAddress: '',
      inspector: '',
      client: '',
      clientEmail: '',
      clientPhone: '',
      notes: '',
      internalNotes: ''
    });
    setSelectedDate('');
    setSelectedTime('');
    setEditingInspection(null);
    setErrors({});
  };

  const handleEdit = (inspection: Inspection) => {
    setFormData({
      propertyId: inspection.propertyId,
      propertyName: inspection.propertyName,
      propertyAddress: inspection.propertyAddress,
      inspector: inspection.inspector,
      client: inspection.client,
      clientEmail: inspection.clientEmail,
      clientPhone: inspection.clientPhone,
      notes: inspection.notes,
      internalNotes: inspection.internalNotes
    });
    setSelectedDate(inspection.date);
    setSelectedTime(inspection.time);
    setEditingInspection(inspection);
    setShowForm(true);
  };

  const handleSendReminder = async (inspection: Inspection) => {
    try {
      // Send email reminder
      await notificationAPI.sendEmailNotification({
        to: inspection.clientEmail,
        subject: 'Inspection Reminder',
        template: 'inspection_reminder',
        data: {
          clientName: inspection.client,
          propertyName: inspection.propertyName,
          date: inspection.date,
          time: inspection.time,
          inspector: inspection.inspector
        }
      });
      
      // Update reminder status
      setInspections(prev => 
        prev.map(i => i.id === inspection.id ? { ...i, reminderSent: true } : i)
      );
      
      alert('Reminder sent successfully!');
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Failed to send reminder. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const upcomingInspections = inspections.filter(i => 
    i.status === 'scheduled' && new Date(i.date) >= new Date()
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Inspection Management</h2>
          <p className="text-gray-600 mt-1">Schedule and manage property inspections</p>
        </div>
        <Button
          onClick={() => setShowForm(true)}
          variant="primary"
        >
          Schedule Inspection
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Upcoming</h3>
          <p className="text-2xl font-bold text-blue-600">{upcomingInspections.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">This Month</h3>
          <p className="text-2xl font-bold text-green-600">
            {inspections.filter(i => {
              const inspectionDate = new Date(i.date);
              const now = new Date();
              return inspectionDate.getMonth() === now.getMonth() && 
                     inspectionDate.getFullYear() === now.getFullYear();
            }).length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg border">
          <h3 className="text-sm font-medium text-gray-500">Completed</h3>
          <p className="text-2xl font-bold text-gray-600">
            {inspections.filter(i => i.status === 'completed').length}
          </p>
        </div>
      </div>

      {/* Inspections List */}
      <div className="bg-white rounded-lg border">
        <div className="px-6 py-4 border-b">
          <h3 className="text-lg font-medium text-gray-900">All Inspections</h3>
        </div>
        <div className="divide-y">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader size="md" />
            </div>
          ) : inspections.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p>No inspections scheduled</p>
            </div>
          ) : (
            inspections.map((inspection) => (
              <div key={inspection.id} className="p-6 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3">
                      <h4 className="text-lg font-medium text-gray-900">
                        {inspection.propertyName}
                      </h4>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(inspection.status)}`}>
                        {inspection.status.charAt(0).toUpperCase() + inspection.status.slice(1)}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-1">{inspection.propertyAddress}</p>
                    <div className="flex items-center space-x-4 mt-2 text-sm text-gray-500">
                      <span>📅 {inspection.date}</span>
                      <span>🕐 {inspection.time}</span>
                      <span>👤 {inspection.client}</span>
                      <span>🔍 {inspection.inspector}</span>
                    </div>
                    {inspection.internalNotes && (
                      <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                        <p className="text-sm text-yellow-800">
                          <strong>Internal Notes:</strong> {inspection.internalNotes}
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    {inspection.status === 'scheduled' && !inspection.reminderSent && (
                      <Button
                        onClick={() => handleSendReminder(inspection)}
                        variant="secondary"
                        size="sm"
                      >
                        Send Reminder
                      </Button>
                    )}
                    <Button
                      onClick={() => handleEdit(inspection)}
                      variant="secondary"
                      size="sm"
                    >
                      Edit
                    </Button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Inspection Form Modal */}
      <Modal
        isOpen={showForm}
        onClose={() => {
          setShowForm(false);
          resetForm();
        }}
        title={editingInspection ? 'Edit Inspection' : 'Schedule New Inspection'}
        size="lg"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Property Name"
              value={formData.propertyName}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyName: e.target.value }))}
              error={errors.propertyName}
              required
            />
            <InputField
              label="Property Address"
              value={formData.propertyAddress}
              onChange={(e) => setFormData(prev => ({ ...prev, propertyAddress: e.target.value }))}
              error={errors.propertyAddress}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <DatePicker
              label="Inspection Date"
              value={selectedDate}
              onChange={setSelectedDate}
              error={errors.date}
              required
            />
            <TimeSlotSelector
              label="Inspection Time"
              value={selectedTime}
              onChange={setSelectedTime}
              error={errors.time}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Inspector Name"
              value={formData.inspector}
              onChange={(e) => setFormData(prev => ({ ...prev, inspector: e.target.value }))}
              error={errors.inspector}
              required
            />
            <InputField
              label="Client Name"
              value={formData.client}
              onChange={(e) => setFormData(prev => ({ ...prev, client: e.target.value }))}
              error={errors.client}
              required
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Client Email"
              type="email"
              value={formData.clientEmail}
              onChange={(e) => setFormData(prev => ({ ...prev, clientEmail: e.target.value }))}
              error={errors.clientEmail}
              required
            />
            <InputField
              label="Client Phone"
              type="tel"
              value={formData.clientPhone}
              onChange={(e) => setFormData(prev => ({ ...prev, clientPhone: e.target.value }))}
            />
          </div>
          
          <TextArea
            label="Public Notes"
            value={formData.notes}
            onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            placeholder="Notes visible to client and seller..."
            rows={3}
          />
          
          <TextArea
            label="Internal Notes (Agent Only)"
            value={formData.internalNotes}
            onChange={(e) => setFormData(prev => ({ ...prev, internalNotes: e.target.value }))}
            placeholder="Private notes for agent use only..."
            rows={3}
          />
          
          <div className="flex justify-end space-x-3 pt-4">
            <Button
              type="button"
              onClick={() => {
                setShowForm(false);
                resetForm();
              }}
              variant="secondary"
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              {editingInspection ? 'Update Inspection' : 'Schedule Inspection'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}