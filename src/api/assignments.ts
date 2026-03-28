import { USE_MOCKS, withMockFallback } from '@/utils/mockWrapper';
import { request } from '@/utils/api';

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock assignments data - removed all mock agents
const mockAssignments: any[] = [];

export const assignmentsApi = {
  // Get assignments for an agent
  async getAssignmentsByAgent(agentId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(500);
        return mockAssignments.filter(assignment => assignment.agentId === agentId)
          .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/assignments/agent/${agentId}`);
        return response.data;
      }
    );
  },

  // Get assignments for a buyer
  async getAssignmentsByBuyer(buyerId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(400);
        return mockAssignments.filter(assignment => assignment.buyerId === buyerId)
          .sort((a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime());
      },
      // Real API call
      async () => {
        const response = await request(`/assignments/buyer/${buyerId}`);
        return response.data;
      }
    );
  },

  // Get assignment by ID
  async getAssignmentById(assignmentId: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(300);
        const assignment = mockAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
          throw new Error('Assignment not found');
        }
        return assignment;
      },
      // Real API call
      async () => {
        const response = await request(`/assignments/${assignmentId}`);
        return response.data;
      }
    );
  },

  // Create new assignment
  async createAssignment(assignmentData: any) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(600);
        const newAssignment = {
          id: `assignment-${Date.now()}`,
          ...assignmentData,
          status: 'active',
          assignedAt: new Date().toISOString(),
          tasks: assignmentData.tasks || []
        };
        mockAssignments.push(newAssignment);
        return newAssignment;
      },
      // Real API call
      async () => {
        const response = await request('/assignments', {
          method: 'POST',
          body: JSON.stringify(assignmentData)
        });
        return response.data;
      }
    );
  },

  // Update assignment status
  async updateAssignmentStatus(assignmentId: string, status: string) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(400);
        const assignment = mockAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
          throw new Error('Assignment not found');
        }
        assignment.status = status;
        if (status === 'completed') {
          assignment.completedAt = new Date().toISOString();
        }
        return assignment;
      },
      // Real API call
      async () => {
        const response = await request(`/assignments/${assignmentId}/status`, {
          method: 'PUT',
          body: JSON.stringify({ status })
        });
        return response.data;
      }
    );
  },

  // Update task completion
  async updateTaskCompletion(assignmentId: string, taskId: string, completed: boolean) {
    return withMockFallback(
      // Mock implementation
      async () => {
        await delay(300);
        const assignment = mockAssignments.find(a => a.id === assignmentId);
        if (!assignment) {
          throw new Error('Assignment not found');
        }
        const task = assignment.tasks.find(t => t.id === taskId);
        if (!task) {
          throw new Error('Task not found');
        }
        task.completed = completed;
        if (completed) {
          task.completedAt = new Date().toISOString();
        } else {
          delete task.completedAt;
        }
        return task;
      },
      // Real API call
      async () => {
        const response = await request(`/assignments/${assignmentId}/tasks/${taskId}`, {
          method: 'PUT',
          body: JSON.stringify({ completed })
        });
        return response.data;
      }
    );
  }
};