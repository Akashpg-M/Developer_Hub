// import { create } from 'zustand';
// import axios from '../lib/axios';
// import { toast } from 'react-hot-toast';

// export interface Member {
//   id: string;
//   name: string;
//   email: string;
//   role: string;
//   joinedAt?: string;
// }

// interface MemberState {
//   members: Member[];
//   loading: boolean;
//   error: string | null;
//   fetchMembers: (communityId: string) => Promise<void>;
// }

// export const useMemberStore = create<MemberState>((set) => ({
//   members: [],
//   loading: false,
//   error: null,

//   // fetchMembers: async (communityId: string) => {
//   //   set({ loading: true, error: null });
//   //   try {
//   //     const { data } = await axios.get(`/community/${communityId}/members`);
//   //     const members = (data.members || data || []).map((member: any) => ({
//   //       id: member.user.id,
//   //       name: member.user.name,
//   //       email: member.user.email,
//   //       role: member.role,
//   //       joinedAt: member.joinedAt,
//   //     }));
//   //     set({ members });
//   //   } catch (error: any) {
//   //     let errorMessage = 'Failed to fetch members';
//   //     if (error.response?.data?.error) {
//   //       errorMessage = error.response.data.error;
//   //     }
//   //     set({ error: errorMessage });
//   //     toast.error(errorMessage);
//   //   } finally {
//   //     set({ loading: false });
//   //   }
//   // },

//   fetchMembers: async (communityId: string) => {
//     set({ loading: true, error: null });
//     try {
//       const { data } = await axios.get(`/community/${communityId}/members`);
//       console.log('API Response:', data);
//       if (!data) {
//         throw new Error('No data received from server');
//       }
//       const membersArray = data.members || data || [];
//       if (!Array.isArray(membersArray)) {
//         console.warn('Members data is not an array:', membersArray);
//         set({ members: [] });
//         return;
//       }
//       const members = membersArray.map((member: any) => {
//         if (!member.user) {
//           console.warn('Member missing user object:', member);
//           return null;
//         }
//         return {
//           id: member.user.id,
//           name: member.user.name,
//           email: member.user.email,
//           role: member.role || 'unknown',
//           joinedAt: member.joinedAt || undefined,
//         };
//       }).filter((member): member is Member => member !== null);
//       set({ members });
//     } catch (error: any) {
//       console.error('Fetch Members Error:', {
//         message: error.message,
//         response: error.response,
//         status: error.response?.status,
//         data: error.response?.data,
//         config: error.config,
//       });
//       let errorMessage = 'Failed to fetch members';
//       if (error.response?.data?.error?.message) {
//         errorMessage = error.response.data.error.message;
//       }
//       set({ error: errorMessage });
//       toast.error(errorMessage);
//     } finally {
//       set({ loading: false });
//     }
//   },
// }));


import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface User {
  id: string;
  name: string;
  email: string;
  profilePicture: string;
}

interface CommunityMember {
  user: User;
  role: string;
  joinedAt?: string;
}

interface ApiResponse {
  status: string;
  data: CommunityMember[];
}

export interface Member {
  id: string;
  name: string;
  email: string;
  role: string;
  joinedAt?: string;
}

interface MemberState {
  members: Member[];
  loading: boolean;
  error: string | null;
  fetchMembers: (communityId: string) => Promise<void>;
}

export const useMemberStore = create<MemberState>((set) => ({
  members: [],
  loading: false,
  error: null,

  fetchMembers: async (communityId: string) => {
    set({ loading: true, error: null });
    try {
      console.log('Fetching members for communityId:', communityId);
      console.log('API Base URL:', axios.defaults.baseURL);
      const token = localStorage.getItem('token'); // Adjust based on your auth setup
      const { data } = await axios.get<ApiResponse>(`/community/${communityId}/members`, {
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });
      console.log('API Response:', data);
      
      if (!data || data.status !== 'success') {
        throw new Error('Invalid response format');
      }

      const membersArray = data.data || [];
      if (!Array.isArray(membersArray)) {
        console.warn('Members data is not an array:', membersArray);
        set({ members: [] });
        return;
      }

      const members: Member[] = [];
      
      for (const member of membersArray) {
        if (!member.user) {
          console.warn('Member missing user object:', member);
          continue;
        }
        members.push({
          id: member.user.id,
          name: member.user.name,
          email: member.user.email,
          role: member.role || 'unknown',
          joinedAt: member.joinedAt || undefined,
        });
      }

      set({ members });
    } catch (error: any) {
      console.error('Fetch Members Error:', {
        message: error.message,
        response: error.response,
        status: error.response?.status,
        data: error.response?.data,
        config: error.config,
      });
      let errorMessage = 'Failed to fetch members';
      if (error.response?.data?.error?.message) {
        errorMessage = error.response.data.error.message;
      } else if (error.message) {
        errorMessage = error.message;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },
}));