import { CommunityController } from '../../src/community_app/public-section/controllers/community.controller';
import { PrismaClient, CommunityRank } from '@prisma/client';

jest.mock('@prisma/client', () => {
  const actual = jest.requireActual('@prisma/client');
  return {
    ...actual,
    PrismaClient: jest.fn().mockImplementation(() => ({
      communityMember: {
        findMany: jest.fn(),
        count: jest.fn(),
        findFirst: jest.fn(),
      },
    })),
  };
});

describe('CommunityController', () => {
  let controller: CommunityController;
  let prisma: PrismaClient;
  let mockRequest: any;
  let mockResponse: any;
  let mockNext: jest.Mock;

  beforeEach(() => {
    prisma = new PrismaClient();
    controller = new CommunityController(prisma as any);
    mockRequest = {};
    mockResponse = {
      json: jest.fn(),
      status: jest.fn().mockReturnThis(),
    };
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  describe('listMembers', () => {
    it('should return paginated list of members with default pagination', async () => {
      const mockMembers = [{ id: 1, user: { name: 'Test' } }];
      (prisma.communityMember.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (prisma.communityMember.count as jest.Mock).mockResolvedValue(1);
      mockRequest.query = {};
      await controller.listMembers(mockRequest, mockResponse, mockNext);
      expect(prisma.communityMember.findMany).toHaveBeenCalledWith({
        include: { user: true },
        skip: 0,
        take: 10,
        orderBy: [
          { points: 'desc' },
          { joinedAt: 'desc' },
        ],
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        members: mockMembers,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
    it('should handle custom pagination parameters', async () => {
      const mockMembers = [{ id: 2, user: { name: 'Test2' } }];
      (prisma.communityMember.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (prisma.communityMember.count as jest.Mock).mockResolvedValue(6);
      mockRequest.query = { page: '2', limit: '5' };
      await controller.listMembers(mockRequest, mockResponse, mockNext);
      expect(prisma.communityMember.findMany).toHaveBeenCalledWith({
        include: { user: true },
        skip: 5,
        take: 5,
        orderBy: [
          { points: 'desc' },
          { joinedAt: 'desc' },
        ],
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        members: mockMembers,
        total: 6,
        page: 2,
        totalPages: 2,
      });
    });
    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.communityMember.findMany as jest.Mock).mockRejectedValue(error);
      mockRequest.query = {};
      await controller.listMembers(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });

  describe('searchMembers', () => {
    it('should return search results for valid query', async () => {
      const mockMembers = [{ id: 1, user: { name: 'Test' } }];
      (prisma.communityMember.findMany as jest.Mock).mockResolvedValue(mockMembers);
      (prisma.communityMember.count as jest.Mock).mockResolvedValue(1);
      mockRequest.query = { query: 'Test' };
      await controller.searchMembers(mockRequest, mockResponse, mockNext);
      expect(prisma.communityMember.findMany).toHaveBeenCalledWith({
        where: {
          OR: [
            { user: { name: { contains: 'Test', mode: 'insensitive' } } },
            { user: { email: { contains: 'Test', mode: 'insensitive' } } },
          ],
        },
        include: { user: true },
        skip: 0,
        take: 10,
        orderBy: [
          { points: 'desc' },
          { joinedAt: 'desc' },
        ],
      });
      expect(mockResponse.json).toHaveBeenCalledWith({
        members: mockMembers,
        total: 1,
        page: 1,
        totalPages: 1,
      });
    });
    it('should return 400 if query is missing', async () => {
      mockRequest.query = {};
      await controller.searchMembers(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Search query is required' });
    });
    it('should handle empty search results', async () => {
      (prisma.communityMember.findMany as jest.Mock).mockResolvedValue([]);
      (prisma.communityMember.count as jest.Mock).mockResolvedValue(0);
      mockRequest.query = { query: 'none' };
      await controller.searchMembers(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({
        members: [],
        total: 0,
        page: 1,
        totalPages: 0,
      });
    });
  });

  describe('getMemberRank', () => {
    it('should return member rank for valid userId', async () => {
      const mockMember = { id: 1, rank: CommunityRank.DEVELOPER };
      (prisma.communityMember.findFirst as jest.Mock).mockResolvedValue(mockMember);
      mockRequest.params = { userId: '1' };
      await controller.getMemberRank(mockRequest, mockResponse, mockNext);
      expect(mockResponse.json).toHaveBeenCalledWith({ rank: CommunityRank.DEVELOPER });
    });
    it('should return 404 if member not found', async () => {
      (prisma.communityMember.findFirst as jest.Mock).mockResolvedValue(null);
      mockRequest.params = { userId: '999' };
      await controller.getMemberRank(mockRequest, mockResponse, mockNext);
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith({ message: 'Member not found' });
    });
    it('should handle database errors', async () => {
      const error = new Error('Database error');
      (prisma.communityMember.findFirst as jest.Mock).mockRejectedValue(error);
      mockRequest.params = { userId: '1' };
      await controller.getMemberRank(mockRequest, mockResponse, mockNext);
      expect(mockNext).toHaveBeenCalledWith(error);
    });
  });
}); 