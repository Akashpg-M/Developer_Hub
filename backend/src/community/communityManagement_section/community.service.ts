import { PrismaClient, Community, CommunityRole, Prisma } from '@prisma/client';
import crypto from 'crypto';

interface CreateCommunityInput {
  name: string;
  description: string;
  isPrivate: boolean;
  creatorId: string;
}

interface GetCommunitiesInput {
  page: number;
  limit: number;
  search?: string;
  sortBy?: 'name' | 'createdAt' | 'memberCount';
  sortOrder?: 'asc' | 'desc';
  userId?: string;
}

export class CommunityService {
  private prisma: PrismaClient;

  constructor(prisma: PrismaClient) {
    this.prisma = prisma;
  }

  async createCommunity(input: CreateCommunityInput): Promise<Community> {
    return this.prisma.$transaction(async (tx) => {
      const community = await tx.community.create({
        data: {
          name: input.name,
          description: input.description,
          isPrivate: input.isPrivate,
          createdBy: input.creatorId,
          communityMembers: {
            create: {
              userId: input.creatorId,
              role: 'OWNER',
            },
          },
        },
        include: {
          communityMembers: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePicture: true,
                },
              },
            },
          },
        },
      });

      return community;
    });
  }

  async getCommunities({ page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' }: GetCommunitiesInput) {
    const skip = (page - 1) * limit;
    const where = search
      ? {
          OR: [
            { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
            { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
          ],
        }
      : {};

    const order = {
      [sortBy]: sortOrder,
    };

    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        include: {
          _count: {
            select: { communityMembers: true },
          },
        },
      }),
      this.prisma.community.count({ where }),
    ]);

    return {
      communities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getCommunityById(id: string) {
    const community = await this.prisma.community.findUnique({
      where: { id },
      include: {
        communityMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },

        _count: {
          select: {
            communityMembers: true
          }
        }
      },
    });

    if (!community) {
      throw new Error('Community not found');
    }

    return {
      ...community,
      memberCount: community._count.communityMembers
    };
  }

  async updateCommunity(id: string, updates: Partial<CreateCommunityInput>) {
    return this.prisma.community.update({
      where: { id },
      data: updates,
      include: {
        communityMembers: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  }

  async deleteCommunity(id: string) {
    try {
      await this.prisma.$transaction([
        this.prisma.communityMember.deleteMany({
          where: { communityId: id }
        }),
        this.prisma.communityInvite.deleteMany({
          where: { communityId: id }
        }),
        this.prisma.community.delete({
          where: { id }
        })
      ]);
    } catch (error) {
      console.error('Error in deleteCommunity service:', {
        error: error,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async joinCommunity(communityId: string, userId: string) {
    const community = await this.getCommunityById(communityId);

    if (community.isPrivate) {
      throw new Error('Cannot join private community without invite');
    }

    return this.prisma.communityMember.create({
      data: {
        communityId,
        userId,
        role: 'VIEWER',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            profilePicture: true,
          },
        },
      },
    });
  }

  async leaveCommunity(communityId: string, userId: string) {
    try {
      const member = await this.prisma.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
      });

      if (!member) {
        throw new Error('Not a member of this community');
      }

      if (member.role === 'ADMIN') {
        const adminCount = await this.prisma.communityMember.count({
          where: {
            communityId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          throw new Error('Cannot leave community as the last admin. Please assign another admin first.');
        }
      }

      await this.prisma.communityMember.delete({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
      });

      const remainingMembers = await this.prisma.communityMember.count({
        where: { communityId }
      });

      if (remainingMembers === 0) {
        await this.prisma.$transaction([
          this.prisma.communityInvite.deleteMany({
            where: { communityId }
          }),
          this.prisma.community.delete({
            where: { id: communityId }
          })
        ]);
      }

      return { message: 'Successfully left the community' };
    } catch (error) {
      console.error('Error in leaveCommunity service:', {
        error: error,
        stack: error instanceof Error ? error.stack : 'No stack trace',
        message: error instanceof Error ? error.message : 'Unknown error'
      });
      throw error;
    }
  }

  async updateMemberRole(communityId: string, userId: string, role: CommunityRole) {
    return this.prisma.$transaction(async (tx) => {
      const member = await tx.communityMember.findUnique({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
      });

      if (!member) {
        throw new Error('User is not a member of this community');
      }

      if (member.role === 'ADMIN' && role !== 'ADMIN') {
        const adminCount = await tx.communityMember.count({
          where: {
            communityId,
            role: 'ADMIN',
          },
        });

        if (adminCount <= 1) {
          throw new Error('Cannot demote the last admin. Please assign another admin first.');
        }
      }

      const updatedMember = await tx.communityMember.update({
        where: {
          communityId_userId: {
            communityId,
            userId,
          },
        },
        data: {
          role,
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePicture: true,
            },
          },
        },
      });

      return updatedMember;
    });
  }

  async isUserAdmin(communityId: string, userId: string) {
    const member = await this.prisma.communityMember.findUnique({
      where: {
        communityId_userId: {
          communityId,
          userId,
        },
      },
    });

    return member?.role === 'ADMIN' || member?.role === 'OWNER';
  }

  async generateInviteLink(communityId: string, userId: string): Promise<string> {
    const code = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // Link expires in 7 days

    await this.prisma.communityInvite.create({
      data: {
        code,
        communityId,
        userId,
        expiresAt,
      },
    });

    return `${process.env.FRONTEND_URL}/join-community/${code}`;
  }

  async getUserCommunities(userId: string, { page, limit, search, sortBy = 'createdAt', sortOrder = 'desc' }: GetCommunitiesInput) {
    const skip = (page - 1) * limit;
    const where = {
      communityMembers: {
        some: {
          userId: userId
        }
      },
      ...(search ? {
        OR: [
          { name: { contains: search, mode: Prisma.QueryMode.insensitive } },
          { description: { contains: search, mode: Prisma.QueryMode.insensitive } },
        ],
      } : {})
    };

    const order = {
      [sortBy]: sortOrder,
    };

    const [communities, total] = await Promise.all([
      this.prisma.community.findMany({
        where,
        skip,
        take: limit,
        orderBy: order,
        include: {
          _count: {
            select: { communityMembers: true },
          },
          communityMembers: {
            where: { userId },
            select: {
              role: true
            }
          }
        },
      }),
      this.prisma.community.count({ where }),
    ]);

    return {
      communities,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }
}
