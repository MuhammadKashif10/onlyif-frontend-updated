import { USE_MOCKS, withMockFallback } from '@/utils/mockWrapper';
import { request } from '@/utils/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock contact submissions data
const mockContactSubmissions = [
  {
    id: 'contact-1',
    name: 'John Doe',
    email: 'john.doe@email.com',
    phone: '(555) 123-4567',
    subject: 'Property Inquiry',
    message: 'I\'m interested in learning more about your services and available properties in the Austin area.',
    propertyId: '1',
    propertyTitle: 'Modern Downtown Condo',
    submittedAt: '2024-01-20T10:30:00Z',
    status: 'new',
    assignedAgent: null,
    priority: 'medium'
  },
  {
    id: 'contact-2',
    name: 'Sarah Wilson',
    email: 'sarah.wilson@email.com',
    phone: '(555) 987-6543',
    subject: 'Selling My Home',
    message: 'I\'m looking to sell my home and would like to discuss your services and commission structure.',
    propertyId: null,
    propertyTitle: null,
    submittedAt: '2024-01-19T14:15:00Z',
    status: 'contacted',
    assignedAgent: 'agent-1',
    priority: 'high'
  }
];

export const contactApi = {
  // Submit contact form
  async submitContactForm(contactData: any) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(800);
        const newSubmission = {
          id: `contact-${Date.now()}`,
          ...contactData,
          submittedAt: new Date().toISOString(),
          status: 'new',
          assignedAgent: null,
          priority: 'medium'
        };
        mockContactSubmissions.push(newSubmission);
        return {
          success: true,
          data: newSubmission,
          message: 'Thank you for your inquiry. We will contact you within 24 hours.'
        };
      },
      // Real API call
      async () => {
        const response = await request('/contact/submit', {
          method: 'POST',
          body: JSON.stringify(contactData)
        });
        return response.data;
      }
    );
  },

  // Submit property inquiry
  async submitPropertyInquiry(inquiryData: any) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(700);
        const newInquiry = {
          id: `inquiry-${Date.now()}`,
          ...inquiryData,
          submittedAt: new Date().toISOString(),
          status: 'new',
          assignedAgent: null,
          priority: 'high'
        };
        mockContactSubmissions.push(newInquiry);
        return {
          success: true,
          data: newInquiry,
          message: 'Your property inquiry has been submitted. An agent will contact you soon.'
        };
      },
      // Real API call
      async () => {
        const response = await request('/contact/property-inquiry', {
          method: 'POST',
          body: JSON.stringify(inquiryData)
        });
        return response.data;
      }
    );
  },

  // Get contact submissions (admin)
  async getContactSubmissions(status?: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(500);
        let submissions = mockContactSubmissions;
        if (status) {
          submissions = submissions.filter(s => s.status === status);
        }
        return submissions.sort((a, b) => 
          new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
        );
      },
      // Real API call
      async () => {
        const params = status ? `?status=${status}` : '';
        const response = await request(`/contact/submissions${params}`);
        return response.data;
      }
    );
  },

  // Update submission status
  async updateSubmissionStatus(submissionId: string, status: string, agentId?: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(400);
        const submission = mockContactSubmissions.find(s => s.id === submissionId);
        if (!submission) {
          throw new Error('Submission not found');
        }
        submission.status = status;
        if (agentId) {
          submission.assignedAgent = agentId;
        }
        return submission;
      },
      // Real API call
      async () => {
        const response = await request(`/contact/submissions/${submissionId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status, agentId })
        });
        return response.data;
      }
    );
  },

  // Schedule callback
  async scheduleCallback(callbackData: any) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(600);
        return {
          success: true,
          data: {
            id: `callback-${Date.now()}`,
            ...callbackData,
            scheduledAt: new Date().toISOString(),
            status: 'scheduled'
          },
          message: 'Callback has been scheduled successfully.'
        };
      },
      // Real API call
      async () => {
        const response = await request('/contact/schedule-callback', {
          method: 'POST',
          body: JSON.stringify(callbackData)
        });
        return response.data;
      }
    );
  }
};
