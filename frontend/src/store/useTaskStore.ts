// import { create } from 'zustand';
// import axios from '../lib/axios';
// import { toast } from 'react-hot-toast';

// // Enums matching your controller
// const TaskStatusEnum = {
//   BACKLOG: 'BACKLOG',
//   TODO: 'TODO',
//   IN_PROGRESS: 'IN_PROGRESS',
//   IN_REVIEW: 'IN_REVIEW',
//   DONE: 'DONE'
// } as const;

// type TaskStatusEnum = typeof TaskStatusEnum[keyof typeof TaskStatusEnum];

// // Task Priority Enum
// const TaskPriorityEnum = {
//   LOW: 'LOW',
//   MEDIUM: 'MEDIUM',
//   HIGH: 'HIGH',
//   URGENT: 'URGENT'
// } as const;

// type TaskPriorityEnum = typeof TaskPriorityEnum[keyof typeof TaskPriorityEnum];

// export { TaskStatusEnum, TaskPriorityEnum };

// // Interfaces
// export interface User {
//   id: string;
//   name: string;
//   profilePicture?: string;
// }

// export interface Project {
//   id: string;
//   name: string;
//   emoji?: string;
// }

// export interface Task {
//   id: string;
//   title: string;
//   description?: string;
//   status: TaskStatusEnum;
//   priority: TaskPriorityEnum;
//   dueDate?: string;
//   assignedToId?: string;
//   projectId?: string;
//   communityId: string;
//   createdById: string;
//   createdAt: string;
//   updatedAt: string;
//   createdBy: User;
//   assignedTo?: User;
//   project?: Project;
// }

// export interface CreateTaskData {
//   title: string;
//   description?: string;
//   priority?: TaskPriorityEnum;
//   status?: TaskStatusEnum;
//   assignedTo?: string | null;
//   dueDate?: string;
//   projectId?: string | null;
// }

// export interface UpdateTaskData {
//   title?: string;
//   description?: string;
//   priority?: TaskPriorityEnum;
//   status?: TaskStatusEnum;
//   assignedTo?: string | null;
//   dueDate?: string;
//   projectId?: string | null;
// }

// export interface TaskFilters {
//   projectId?: string;
//   status?: TaskStatusEnum[];
//   priority?: TaskPriorityEnum[];
//   assignedTo?: string[];
//   keyword?: string;
//   dueDate?: string;
// }

// export interface PaginationParams {
//   pageSize?: number;
//   pageNumber?: number;
// }

// export interface TasksResponse {
//   tasks: Task[];
//   total: number;
//   pageNumber: number;
//   totalPages: number;
// }

// interface TaskState {
//   // State
//   tasks: Task[];
//   currentTask: Task | null;
//   loading: boolean;
//   error: string | null;
  
//   // Pagination state
//   currentPage: number;
//   totalPages: number;
//   totalTasks: number;
  
//   // Filter state
//   filters: TaskFilters;
  
//   // Actions
//   fetchTasks: (communityId: string, filters?: TaskFilters, pagination?: PaginationParams) => Promise<void>;
//   fetchTaskById: (communityId: string, taskId: string) => Promise<void>;
//   createTask: (communityId: string, data: CreateTaskData) => Promise<Task | null>;
//   updateTask: (communityId: string, taskId: string, data: UpdateTaskData) => Promise<Task | null>;
//   updateTaskStatus: (communityId: string, taskId: string, status: TaskStatusEnum) => Promise<Task | null>;
//   assignTask: (communityId: string, taskId: string, assignedTo: string | null) => Promise<Task | null>;
//   deleteTask: (communityId: string, taskId: string) => Promise<boolean>;
  
//   // Filter actions
//   setFilters: (filters: Partial<TaskFilters>) => void;
//   clearFilters: () => void;
  
//   // Utility actions
//   clearError: () => void;
//   clearCurrentTask: () => void;
//   reset: () => void;
// }

// export const useTaskStore = create<TaskState>((set, _get) => ({
//   // Initial state
//   tasks: [],
//   currentTask: null,
//   loading: false,
//   error: null,
//   currentPage: 1,
//   totalPages: 1,
//   totalTasks: 0,
//   filters: {},

//   // Fetch all tasks with filters and pagination
//   fetchTasks: async (communityId: string, filters?: TaskFilters, pagination?: PaginationParams) => {
//     set({ loading: true, error: null });
//     try {
//       const params: any = {
//         pageSize: pagination?.pageSize || 10,
//         pageNumber: pagination?.pageNumber || 1,
//       };

//       // Add filters to params
//       if (filters?.projectId) params.projectId = filters.projectId;
//       if (filters?.status?.length) params.status = filters.status.join(',');
//       if (filters?.priority?.length) params.priority = filters.priority.join(',');
//       if (filters?.assignedTo?.length) params.assignedTo = filters.assignedTo.join(',');
//       if (filters?.keyword) params.keyword = filters.keyword;
//       if (filters?.dueDate) params.dueDate = filters.dueDate;

//       const { data } = await axios.get(`/community/${communityId}/task`, { params });
      
//       set({ 
//         tasks: data.tasks || [],
//         currentPage: data.pageNumber || 1,
//         totalPages: data.totalPages || 1,
//         totalTasks: data.total || 0,
//         filters: filters || {}
//       });
//     } catch (error: any) {
//       let errorMessage = 'Failed to fetch tasks';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Fetch single task by ID
//   fetchTaskById: async (communityId: string, taskId: string) => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await axios.get(`/community/${communityId}/task/${taskId}`);
//       set({ currentTask: data });
//     } catch (error: any) {
//       let errorMessage = 'Failed to fetch task';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Create new task
//   createTask: async (communityId: string, data: CreateTaskData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await axios.post(`/community/${communityId}/task`, data);
//       const newTask = response.data.success ? response.data.data.task : response.data.task;
      
//       // Add to tasks list
//       set(state => ({
//         tasks: [newTask, ...state.tasks],
//         totalTasks: state.totalTasks + 1
//       }));
      
//       toast.success('Task created successfully');
//       return newTask;
//     } catch (error: any) {
//       let errorMessage = 'Failed to create task';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       } else if (error.response?.data?.details) {
//         errorMessage = error.response.data.details[0]?.message || errorMessage;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Update task
//   updateTask: async (communityId: string, taskId: string, data: UpdateTaskData) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await axios.put(`/community/${communityId}/task/${taskId}`, data);
//       const updatedTask = response.data.task;
      
//       // Update in tasks list
//       set(state => ({
//         tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
//         currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask
//       }));
      
//       toast.success('Task updated successfully');
//       return updatedTask;
//     } catch (error: any) {
//       let errorMessage = 'Failed to update task';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Update task status
//   updateTaskStatus: async (communityId: string, taskId: string, status: TaskStatusEnum) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await axios.patch(`/community/${communityId}/task/${taskId}/status`, { status });
//       const updatedTask = response.data;
      
//       // Update in tasks list
//       set(state => ({
//         tasks: state.tasks.map(t => t.id === taskId ? { ...t, status } : t),
//         currentTask: state.currentTask?.id === taskId ? { ...state.currentTask, status } : state.currentTask
//       }));
      
//       toast.success('Task status updated successfully');
//       return updatedTask;
//     } catch (error: any) {
//       let errorMessage = 'Failed to update task status';
//       if (error.response?.data?.message) {
//         errorMessage = error.response.data.message;
//       } else if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Assign task
//   assignTask: async (communityId: string, taskId: string, assignedTo: string | null) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await axios.post(`/community/${communityId}/task/${taskId}/assign`, { assignedTo });
//       const updatedTask = response.data.success ? response.data.data.task : response.data.task;
      
//       // Update in tasks list
//       set(state => ({
//         tasks: state.tasks.map(t => t.id === taskId ? updatedTask : t),
//         currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask
//       }));
      
//       toast.success(response.data.message || 'Task assignment updated successfully');
//       return updatedTask;
//     } catch (error: any) {
//       let errorMessage = 'Failed to assign task';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       } else if (error.response?.data?.details) {
//         errorMessage = error.response.data.details[0]?.message || errorMessage;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//       return null;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Delete task
//   deleteTask: async (communityId: string, taskId: string) => {
//     set({ loading: true, error: null });
//     try {
//       await axios.delete(`/community/${communityId}/task/${taskId}`);
      
//       // Remove from tasks list
//       set(state => ({
//         tasks: state.tasks.filter(t => t.id !== taskId),
//         currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
//         totalTasks: Math.max(0, state.totalTasks - 1)
//       }));
      
//       toast.success('Task deleted successfully');
//       return true;
//     } catch (error: any) {
//       let errorMessage = 'Failed to delete task';
//       if (error.response?.data?.error) {
//         errorMessage = Array.isArray(error.response.data.error) 
//           ? error.response.data.error[0].message || error.response.data.error[0]
//           : error.response.data.error;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//       return false;
//     } finally {
//       set({ loading: false });
//     }
//   },

//   // Filter actions
//   setFilters: (newFilters: Partial<TaskFilters>) => {
//     set(state => ({
//       filters: { ...state.filters, ...newFilters }
//     }));
//   },

//   clearFilters: () => {
//     set({ filters: {} });
//   },

//   // Utility actions
//   clearError: () => set({ error: null }),
  
//   clearCurrentTask: () => set({ currentTask: null }),
  
//   reset: () => set({
//     tasks: [],
//     currentTask: null,
//     loading: false,
//     error: null,
//     currentPage: 1,
//     totalPages: 1,
//     totalTasks: 0,
//     filters: {}
//   })
// }));

import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

const TaskStatusEnum = {
  BACKLOG: 'BACKLOG',
  TODO: 'TODO',
  IN_PROGRESS: 'IN_PROGRESS',
  IN_REVIEW: 'IN_REVIEW',
  DONE: 'DONE'
} as const;

type TaskStatusEnum = typeof TaskStatusEnum[keyof typeof TaskStatusEnum];

const TaskPriorityEnum = {
  LOW: 'LOW',
  MEDIUM: 'MEDIUM',
  HIGH: 'HIGH',
  URGENT: 'URGENT'
} as const;

type TaskPriorityEnum = typeof TaskPriorityEnum[keyof typeof TaskPriorityEnum];

export { TaskStatusEnum, TaskPriorityEnum };

export interface User {
  id: string;
  name: string;
  profilePicture?: string | null;
}

export interface Project {
  id: string;
  name: string;
  emoji?: string | null;
}

export interface Task {
  id: string;
  title: string;
  description?: string | null;
  status: TaskStatusEnum;
  priority: TaskPriorityEnum;
  dueDate?: string | null;
  assignedToId?: string | null;
  projectId?: string | null;
  communityId: string;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  assignedTo?: User | null;
  project?: Project | null;
}

export interface CreateTaskData {
  title: string;
  description?: string | null;
  priority?: TaskPriorityEnum;
  status?: TaskStatusEnum;
  assignedTo?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
}

export interface UpdateTaskData {
  title?: string | null;
  description?: string | null;
  priority?: TaskPriorityEnum;
  status?: TaskStatusEnum;
  assignedTo?: string | null;
  dueDate?: string | null;
  projectId?: string | null;
}

export interface TaskFilters {
  projectId?: string;
  status?: TaskStatusEnum[];
  priority?: TaskPriorityEnum[];
  assignedTo?: string[];
  keyword?: string;
  dueDate?: string;
}

export interface PaginationParams {
  pageSize?: number;
  pageNumber?: number;
}

export interface TasksResponse {
  tasks: Task[];
  total: number;
  pageNumber: number;
  totalPages: number;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: { task: Task };
}

interface TaskState {
  tasks: Task[];
  currentTask: Task | null;
  loading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalTasks: number;
  filters: TaskFilters;
  fetchTasks: (communityId: string, filters?: TaskFilters, pagination?: PaginationParams) => Promise<void>;
  fetchTaskById: (communityId: string, taskId: string) => Promise<void>;
  createTask: (communityId: string, data: CreateTaskData) => Promise<Task | null>;
  updateTask: (communityId: string, taskId: string, data: UpdateTaskData) => Promise<Task | null>;
  updateTaskStatus: (communityId: string, taskId: string, status: TaskStatusEnum) => Promise<Task | null>;
  assignTask: (communityId: string, taskId: string, assignedTo: string | null) => Promise<Task | null>;
  deleteTask: (communityId: string, taskId: string) => Promise<boolean>;
  setFilters: (filters: Partial<TaskFilters>) => void;
  clearFilters: () => void;
  clearError: () => void;
  clearCurrentTask: () => void;
  reset: () => void;
}

export const useTaskStore = create<TaskState>((set) => ({
  tasks: [],
  currentTask: null,
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  totalTasks: 0,
  filters: {},

  fetchTasks: async (communityId: string, filters?: TaskFilters, pagination?: PaginationParams) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching tasks for communityId:', communityId, { filters, pagination });
      console.log('API Base URL:', axios.defaults.baseURL);
      const token = localStorage.getItem('token');
      const params: any = {
        pageSize: pagination?.pageSize || 10,
        pageNumber: pagination?.pageNumber || 1,
      };
      if (filters?.projectId) params.projectId = filters.projectId;
      if (filters?.status?.length) params.status = filters.status.join(',');
      if (filters?.priority?.length) params.priority = filters.priority.join(',');
      if (filters?.assignedTo?.length) params.assignedTo = filters.assignedTo.join(',');
      if (filters?.keyword) params.keyword = filters.keyword;
      if (filters?.dueDate) params.dueDate = filters.dueDate;

      const { data } = await axios.get<TasksResponse>(`/community/${communityId}/task`, {
        params,
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Tasks API Response:', data);

      if (!data || !Array.isArray(data.tasks)) {
        throw new Error('Invalid tasks response');
      }

      set({
        tasks: data.tasks,
        currentPage: data.pageNumber || 1,
        totalPages: data.totalPages || 1,
        totalTasks: data.total || 0,
        filters: filters || {},
      });
    } catch (error: any) {
      console.error('Fetch Tasks Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch tasks';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchTaskById: async (communityId: string, taskId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching task:', { communityId, taskId });
      const token = localStorage.getItem('token');
      const { data } = await axios.get<Task>(`/community/${communityId}/task/${taskId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Task API Response:', data);
      set({ currentTask: data });
    } catch (error: any) {
      console.error('Fetch Task Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch task';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  createTask: async (communityId: string, data: CreateTaskData) => {
    set({ loading: true, error: null });
    try {
      console.log('Creating task for communityId:', communityId, data);
      const token = localStorage.getItem('token');
      const response = await axios.post<TaskResponse>(`/community/${communityId}/task`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Create Task API Response:', response.data);
      const newTask = response.data.data.task;
      set(state => ({
        tasks: [newTask, ...state.tasks],
        totalTasks: state.totalTasks + 1,
      }));
      toast.success(response.data.message);
      return newTask;
    } catch (error: any) {
      console.error('Create Task Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to create task';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details[0]?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateTask: async (communityId: string, taskId: string, data: UpdateTaskData) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating task:', { communityId, taskId, data });
      const token = localStorage.getItem('token');
      const response = await axios.put<{ message: string; task: Task }>(`/community/${communityId}/task/${taskId}`, data, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Update Task API Response:', response.data);
      const updatedTask = response.data.task;
      set(state => ({
        tasks: state.tasks.map(t => (t.id === taskId ? updatedTask : t)),
        currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask,
      }));
      toast.success(response.data.message);
      return updatedTask;
    } catch (error: any) {
      console.error('Update Task Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to update task';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  updateTaskStatus: async (communityId: string, taskId: string, status: TaskStatusEnum) => {
    set({ loading: true, error: null });
    try {
      console.log('Updating task status:', { communityId, taskId, status });
      const token = localStorage.getItem('token');
      const response = await axios.patch<Task>(`/community/${communityId}/task/${taskId}/status`, { status }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Update Task Status API Response:', response.data);
      const updatedTask = response.data;
      set(state => ({
        tasks: state.tasks.map(t => (t.id === taskId ? updatedTask : t)),
        currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask,
      }));
      toast.success('Task status updated successfully');
      return updatedTask;
    } catch (error: any) {
      console.error('Update Task Status Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to update task status';
      if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  assignTask: async (communityId: string, taskId: string, assignedTo: string | null) => {
    set({ loading: true, error: null });
    try {
      console.log('Assigning task:', { communityId, taskId, assignedTo });
      const token = localStorage.getItem('token');
      const response = await axios.post<TaskResponse>(`/community/${communityId}/task/${taskId}/assign`, { assignedTo }, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('Assign Task API Response:', response.data);
      const updatedTask = response.data.data.task;
      set(state => ({
        tasks: state.tasks.map(t => (t.id === taskId ? updatedTask : t)),
        currentTask: state.currentTask?.id === taskId ? updatedTask : state.currentTask,
      }));
      toast.success(response.data.message);
      return updatedTask;
    } catch (error: any) {
      console.error('Assign Task Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to assign task';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.response?.data?.details) {
        errorMessage = error.response.data.details[0]?.message || errorMessage;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return null;
    } finally {
      set({ loading: false });
    }
  },

  deleteTask: async (communityId: string, taskId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Deleting task:', { communityId, taskId });
      const token = localStorage.getItem('token');
      await axios.delete(`/community/${communityId}/task/${taskId}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      set(state => ({
        tasks: state.tasks.filter(t => t.id !== taskId),
        currentTask: state.currentTask?.id === taskId ? null : state.currentTask,
        totalTasks: Math.max(0, state.totalTasks - 1),
      }));
      toast.success('Task deleted successfully');
      return true;
    } catch (error: any) {
      console.error('Delete Task Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to delete task';
      if (error.response?.data?.error) {
        errorMessage = Array.isArray(error.response.data.error)
          ? error.response.data.error[0]?.message || error.response.data.error[0] || errorMessage
          : error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
      return false;
    } finally {
      set({ loading: false });
    }
  },

  setFilters: (newFilters: Partial<TaskFilters>) => {
    set(state => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },

  clearFilters: () => {
    set({ filters: {} });
  },

  clearError: () => set({ error: null }),
  clearCurrentTask: () => set({ currentTask: null }),
  reset: () => set({
    tasks: [],
    currentTask: null,
    loading: false,
    error: null,
    currentPage: 1,
    totalPages: 1,
    totalTasks: 0,
    filters: {},
  }),
}));