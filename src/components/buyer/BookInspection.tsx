'use client';

import React, { useState } from 'react';
import { Button } from '@/components/reusable/Button';
import { Input } from '@/components/reusable/Input';
import { Label } from '@/components/reusable/Label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/reusable/EnhancedCard';
import { Alert, AlertDescription } from '@/components/reusable/AlertComponent';
import { Loader2, Calendar, Clock, User, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

interface BookInspectionProps {
  propertyId?: string;
  propertyAddress: string;
  availableAgents?: Array<{
    id: string;
    name: string;
    availableSlots: string[];
  }>;
}

interface BookingDetails {
  propertyAddress: string;
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  confirmedDateTime: string;
  agent: {
    id: string;
    name: string;
    email: string;
    phone: string;
  };
}

interface FormData {
  buyerName: string;
  buyerEmail: string;
  buyerPhone: string;
  preferredDateTime: string;
  assignedAgentId: string;
}

const BookInspection: React.FC<BookInspectionProps> = ({ 
  propertyId, 
  propertyAddress, 
  availableAgents = [] 
}) => {
  const [formData, setFormData] = useState<FormData>({
    buyerName: '',
    buyerEmail: '',
    buyerPhone: '',
    preferredDateTime: '',
    assignedAgentId: ''
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [error, setError] = useState<string>('');
  const [suggestedSlots, setSuggestedSlots] = useState<string[]>([]);
  const [bookingId, setBookingId] = useState<string>('');

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user starts typing
    if (error) setError('');
  };

  const formatDateTime = (dateTimeString: string): string => {
    return new Date(dateTimeString).toLocaleString('en-AU', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      timeZoneName: 'short'
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuggestedSlots([]);

    try {
      const response = await fetch('/api/book-inspection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          propertyId,
          propertyAddress,
          ...formData
        }),
      });

      const data = await response.json();

      if (data.success) {
        setBookingConfirmed(true);
        setBookingDetails(data.bookingDetails);
        setBookingId(data.bookingId);
      } else {
        setError(data.message);
        if (data.suggestedSlots) {
          setSuggestedSlots(data.suggestedSlots);
        }
      }
    } catch (err) {
      setError('Failed to book inspection. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestedSlotSelect = (slot: string) => {
    setFormData(prev => ({
      ...prev,
      preferredDateTime: slot
    }));
    setError('');
    setSuggestedSlots([]);
  };

  const resetForm = () => {
    setBookingConfirmed(false);
    setBookingDetails(null);
    setBookingId('');
    setFormData({
      buyerName: '',
      buyerEmail: '',
      buyerPhone: '',
      preferredDateTime: '',
      assignedAgentId: ''
    });
    setError('');
    setSuggestedSlots([]);
  };

  if (bookingConfirmed && bookingDetails) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl text-green-600">Inspection Booked Successfully!</CardTitle>
          <CardDescription>Your property inspection has been confirmed</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2">Booking ID: {bookingId}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <p className="font-medium text-gray-700">Property:</p>
                <p className="text-gray-600">{bookingDetails.propertyAddress}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Date & Time:</p>
                <p className="text-gray-600">{formatDateTime(bookingDetails.confirmedDateTime)}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Your Details:</p>
                <p className="text-gray-600">{bookingDetails.buyerName}</p>
                <p className="text-gray-600">{bookingDetails.buyerPhone}</p>
              </div>
              <div>
                <p className="font-medium text-gray-700">Agent:</p>
                <p className="text-gray-600">{bookingDetails.agent.name}</p>
                <p className="text-gray-600">{bookingDetails.agent.phone}</p>
              </div>
            </div>
          </div>
          
          <Alert>
            <Mail className="h-4 w-4" />
            <AlertDescription>
              Confirmation emails have been sent to both you and your agent with all the details.
            </AlertDescription>
          </Alert>
          
          <Button onClick={resetForm} className="w-full">
            Book Another Inspection
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="h-5 w-5" />
          Book Property Inspection
        </CardTitle>
        <CardDescription>
          Schedule an inspection for {propertyAddress}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerName" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Full Name *
              </Label>
              <Input
                id="buyerName"
                name="buyerName"
                type="text"
                value={formData.buyerName}
                onChange={handleInputChange}
                placeholder="Enter your full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="buyerEmail" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                Email Address *
              </Label>
              <Input
                id="buyerEmail"
                name="buyerEmail"
                type="email"
                value={formData.buyerEmail}
                onChange={handleInputChange}
                placeholder="Enter your email"
                required
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="buyerPhone" className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                Phone Number *
              </Label>
              <Input
                id="buyerPhone"
                name="buyerPhone"
                type="tel"
                value={formData.buyerPhone}
                onChange={handleInputChange}
                placeholder="+61 400 123 456"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="assignedAgentId" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Select Agent *
              </Label>
              <select
                id="assignedAgentId"
                name="assignedAgentId"
                value={formData.assignedAgentId}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="">Choose an agent</option>
                {availableAgents.map(agent => (
                  <option key={agent.id} value={agent.id}>
                    {agent.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="preferredDateTime" className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Preferred Date & Time *
            </Label>
            <Input
              id="preferredDateTime"
              name="preferredDateTime"
              type="datetime-local"
              value={formData.preferredDateTime}
              onChange={handleInputChange}
              min={new Date().toISOString().slice(0, 16)}
              required
            />
          </div>
          
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {suggestedSlots.length > 0 && (
            <Alert>
              <Clock className="h-4 w-4" />
              <AlertDescription>
                <p className="mb-2">Suggested available times:</p>
                <div className="space-y-1">
                  {suggestedSlots.map((slot, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => handleSuggestedSlotSelect(slot)}
                      className="block w-full text-left px-3 py-2 bg-blue-50 hover:bg-blue-100 rounded border text-sm"
                    >
                      {formatDateTime(slot)}
                    </button>
                  ))}
                </div>
              </AlertDescription>
            </Alert>
          )}
          
          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Booking Inspection...
              </>
            ) : (
              'Book Inspection'
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default BookInspection;