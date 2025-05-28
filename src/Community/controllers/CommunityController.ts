import { Request, Response } from 'express';
import { AppDataSource } from '../config/database';
import { Community, CommunityType, CommunityRole } from '../models/Community';
import { User } from '../models/User';

const communityRepository = AppDataSource.getRepository(Community);
const userRepository = AppDataSource.getRepository(User);

export class CommunityController {
  // Create a new community
  async create(req: Request, res: Response) {
    try {
      const { name, description, type, parentCommunityId } = req.body;
      const userId = req.user.id;

      const community = new Community();
      community.name = name;
      community.description = description;
      community.type = type || CommunityType.PUBLIC;
      community.parentCommunityId = parentCommunityId;
      community.addMember(userId, CommunityRole.ADMIN);

      await communityRepository.save(community);

      res.status(201).json(community);
    } catch (error) {
      res.status(500).json({ message: 'Error creating community', error });
    }
  }

  // Get community details
  async getDetails(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const community = await communityRepository.findOne({
        where: { id },
        relations: ['members', 'subCommunities', 'tasks', 'folders']
      });

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      res.json(community);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching community details', error });
    }
  }

  // Update community
  async update(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { name, description, type } = req.body;
      const userId = req.user.id;

      const community = await communityRepository.findOne({
        where: { id },
        relations: ['members']
      });

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (!community.isAdminOrManager(userId)) {
        return res.status(403).json({ message: 'Not authorized to update community' });
      }

      if (name) community.name = name;
      if (description) community.description = description;
      if (type) community.type = type;

      await communityRepository.save(community);

      res.json(community);
    } catch (error) {
      res.status(500).json({ message: 'Error updating community', error });
    }
  }

  // Request to join community
  async requestJoin(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const community = await communityRepository.findOne({
        where: { id }
      });

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (community.type === CommunityType.PRIVATE) {
        return res.status(403).json({ message: 'Cannot join private community' });
      }

      if (community.type === CommunityType.PROTECTED) {
        community.addJoinRequest(userId);
        await communityRepository.save(community);
        return res.json({ message: 'Join request sent' });
      }

      // For public communities, add member directly
      community.addMember(userId);
      await communityRepository.save(community);

      res.json({ message: 'Successfully joined community' });
    } catch (error) {
      res.status(500).json({ message: 'Error joining community', error });
    }
  }

  // Process join request
  async processJoinRequest(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { userId, status } = req.body;
      const adminId = req.user.id;

      const community = await communityRepository.findOne({
        where: { id }
      });

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (!community.isAdminOrManager(adminId)) {
        return res.status(403).json({ message: 'Not authorized to process join requests' });
      }

      community.processJoinRequest(userId, status, adminId);

      if (status === 'APPROVED') {
        community.addMember(userId);
      }

      await communityRepository.save(community);

      res.json({ message: `Join request ${status.toLowerCase()}` });
    } catch (error) {
      res.status(500).json({ message: 'Error processing join request', error });
    }
  }

  // Create sub-community
  async createSubCommunity(req: Request, res: Response) {
    try {
      const { parentId } = req.params;
      const { name, description, type } = req.body;
      const userId = req.user.id;

      const parentCommunity = await communityRepository.findOne({
        where: { id: parentId }
      });

      if (!parentCommunity) {
        return res.status(404).json({ message: 'Parent community not found' });
      }

      if (!parentCommunity.isAdminOrManager(userId)) {
        return res.status(403).json({ message: 'Not authorized to create sub-community' });
      }

      const subCommunity = new Community();
      subCommunity.name = name;
      subCommunity.description = description;
      subCommunity.type = type || CommunityType.PUBLIC;
      subCommunity.parentCommunityId = parentId;
      subCommunity.addMember(userId, CommunityRole.ADMIN);

      await communityRepository.save(subCommunity);

      res.status(201).json(subCommunity);
    } catch (error) {
      res.status(500).json({ message: 'Error creating sub-community', error });
    }
  }

  // Get community statistics
  async getStatistics(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const userId = req.user.id;

      const community = await communityRepository.findOne({
        where: { id },
        relations: ['members', 'subCommunities', 'tasks']
      });

      if (!community) {
        return res.status(404).json({ message: 'Community not found' });
      }

      if (!community.canAccess(userId)) {
        return res.status(403).json({ message: 'Not authorized to view community statistics' });
      }

      const statistics = {
        totalMembers: community.members.length,
        totalSubCommunities: community.subCommunities.length,
        tasksByStatus: community.tasks.reduce((acc, task) => {
          acc[task.status] = (acc[task.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>)
      };

      res.json(statistics);
    } catch (error) {
      res.status(500).json({ message: 'Error fetching community statistics', error });
    }
  }
} 