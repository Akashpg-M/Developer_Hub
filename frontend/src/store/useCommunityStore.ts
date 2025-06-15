// useCommunityStore.ts
import { create } from 'zustand';
import axios from '../lib/axios';
import { toast } from 'react-hot-toast';

interface Community {
  id: string;
  name: string;
  description: string;
  isPrivate: boolean;
  createdAt: string;
  updatedAt: string;
  memberCount?: number;
  isMember?: boolean;
  _count?: {
    communityMembers: number;
  };
}

interface CommunityState {
  userCommunities: Community[];
  allCommunities: Community[];
  loading: boolean;
  error: string | null;
  fetchUserCommunities: () => Promise<void>;
  fetchAllCommunities: (search?: string) => Promise<void>;
  joinCommunity: (communityId: string) => Promise<boolean>;
  leaveCommunity: (communityId: string) => Promise<boolean>;
  createCommunity: (data: { name: string; description: string; isPrivate?: boolean }) => Promise<Community | null>;
  getCommunity: (communityId: string) => Promise<Community | null>;
}

export const useCommunityStore = create<CommunityState>((set, get) => ({
  userCommunities: [],
  allCommunities: [],
  loading: false,
  error: null,

  fetchUserCommunities: async () => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get('/community/user/communities', {
        params: { limit: 50 },
      });
      // Transform the backend response to match our frontend interface
      const transformed = data.communities.map((community: any) => ({
        ...community,
        memberCount: community._count?.communityMembers || 0,
        isMember: true,
      }));
      set({ userCommunities: transformed });
    } catch (error: any) {
      let errorMessage = 'Failed to fetch your communities';
      if (error.response?.status === 401) {
        errorMessage = 'Please log in to view your communities';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  fetchAllCommunities: async (search = '') => {
    set({ loading: true, error: null });
    try {
      const { data } = await axios.get('/community', {
        params: { search, limit: 50, page: 1 },
      });
      
      // Transform the backend response to match our frontend interface
      const transformed = data.communities.map((community: any) => ({
        ...community,
        memberCount: community._count?.communityMembers || 0,
        isMember: get().userCommunities.some(uc => uc.id === community.id),
      }));
      
      set({ allCommunities: transformed });
    } catch (error: any) {
      let errorMessage = 'Failed to fetch communities';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      set({ error: errorMessage });
      toast.error(errorMessage);
    } finally {
      set({ loading: false });
    }
  },

  getCommunity: async (communityId: string) => {
    try {
      const { data } = await axios.get(`/community/${communityId}`);
      if (!data) {
        throw new Error('Community not found');
      }
      return {
        ...data,
        memberCount: data._count?.communityMembers || 0,
        isMember: get().userCommunities.some(uc => uc.id === data.id),
      };
    } catch (error: any) {
      let errorMessage = 'Failed to fetch community details';
      if (error.response?.status === 404) {
        errorMessage = 'Community not found';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return null;
    }
  },

  joinCommunity: async (communityId: string) => {
    try {
      await axios.post(`/community/${communityId}/join`);
      
      // Refresh both user communities and all communities
      const [userCommunities, allCommunities] = await Promise.all([
        axios.get('/community/user/communities', { params: { limit: 50 } }),
        axios.get('/community', { params: { limit: 50, page: 1 } }),
      ]);
      
      set({
        userCommunities: userCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: true,
        })),
        allCommunities: allCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: userCommunities.data.communities.some((uc: any) => uc.id === c.id),
        })),
      });
      
      toast.success('Successfully joined the community!');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to join community';
      if (error.response?.status === 403) {
        errorMessage = 'Cannot join private community without an invite';
      } else if (error.response?.status === 400 && error.response?.data?.error?.includes('Already a member')) {
        errorMessage = 'You are already a member of this community';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  leaveCommunity: async (communityId: string) => {
    try {
      await axios.post(`/community/${communityId}/leave`);
      
      // Refresh both user communities and all communities
      const [userCommunities, allCommunities] = await Promise.all([
        axios.get('/community/user/communities', { params: { limit: 50 } }),
        axios.get('/community', { params: { limit: 50, page: 1 } }),
      ]);
      
      set({
        userCommunities: userCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: true,
        })),
        allCommunities: allCommunities.data.communities.map((c: any) => ({
          ...c,
          memberCount: c._count?.communityMembers || 0,
          isMember: userCommunities.data.communities.some((uc: any) => uc.id === c.id),
        })),
      });
      
      toast.success('Successfully left the community');
      return true;
    } catch (error: any) {
      let errorMessage = 'Failed to leave community';
      if (error.response?.status === 400 && error.response?.data?.error?.includes('last admin')) {
        errorMessage = 'Cannot leave as the last admin';
      } else if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      }
      toast.error(errorMessage);
      return false;
    }
  },

  createCommunity: async (data: { name: string; description: string; isPrivate?: boolean }) => {
    try {
      const response = await axios.post('/community', data);
      const newCommunity = response.data;
      
      // Add the new community to user's communities and refresh the list
      await get().fetchUserCommunities();
      
      toast.success('Community created successfully!');
      return {
        ...newCommunity,
        memberCount: 1,
        isMember: true,
      };
    } catch (error: any) {
      let errorMessage = 'Failed to create community';
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.response?.status === 400 && error.response?.data?.errors) {
        errorMessage = error.response.data.errors.map((e: any) => e.message).join(', ');
      }
      toast.error(errorMessage);
      return null;
    }
  },
}));