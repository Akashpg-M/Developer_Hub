import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient();

export const createProjectService = async (
  userId: string,
  communityId: string,
  data: { name: string; description?: string; emoji?: string }
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Create the project
    const project = await tx.project.create({
      data: {
        name: data.name,
        description: data.description,
        emoji: data.emoji,
        communityId,
        createdById: userId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });

    // Add creator as project member
    await tx.projectMember.create({
      data: {
        projectId: project.id,
        userId: userId,
      },
    });

    return project;
  });
};

export const getProjectsInCommunityService = async (
  communityId: string,
  pageSize: number,
  pageNumber: number
) => {
  const skip = (pageNumber - 1) * pageSize;

  const [total, projects] = await Promise.all([
    prisma.project.count({
      where: { communityId },
    }),
    prisma.project.findMany({
      where: {
        communityId,
      },
      skip,
      take: pageSize,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  ]);

  return {
    projects,
    total,
    pageNumber,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const getProjectByIdAndCommunityIdService = async (
  communityId: string,
  projectId: string
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      communityId,
    },
    include: {
      createdBy: {
        select: {
          id: true,
          name: true,
          profilePicture: true,
        },
      },
      members: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return project;
};

export const getProjectAnalyticsService = async (
  communityId: string,
  projectId: string
) => {
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      communityId,
    },
    include: {
      members: {
        select: {
          id: true,
          user: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  return {
    totalMembers: project.members.length,
    members: project.members,
  };
};

export const joinProjectService = async (
  userId: string,
  communityId: string,
  projectId: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if project exists and belongs to the community
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is already a member
    const existingMember = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error('Already a member of this project');
    }

    // Add user as project member
    return tx.projectMember.create({
      data: {
        projectId,
        userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
    });
  });
};

export const leaveProjectService = async (
  userId: string,
  communityId: string,
  projectId: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if project exists and belongs to the community
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is a member
    const member = await tx.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (!member) {
      throw new Error('Not a member of this project');
    }

    // Remove user from project
    await tx.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    return { message: 'Successfully left the project' };
  });
};

export const getProjectMembersService = async (
  communityId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number
) => {
  const skip = (pageNumber - 1) * pageSize;

  // First check if project exists and belongs to the community
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      communityId,
    },
  });

  if (!project) {
    throw new Error('Project not found');
  }

  const [total, members] = await Promise.all([
    prisma.projectMember.count({
      where: { projectId },
    }),
    prisma.projectMember.findMany({
      where: { projectId },
      skip,
      take: pageSize,
      select: {
        id: true,
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: {
        joinedAt: 'desc',
      },
    }),
  ]);

  return {
    members,
    total,
    pageNumber,
    totalPages: Math.ceil(total / pageSize),
  };
};

export const updateProjectService = async (
  communityId: string,
  projectId: string,
  userId: string,
  data: {
    name?: string;
    description?: string;
  }
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if project exists and belongs to the community
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is the project creator
    if (project.createdById !== userId) {
      throw new Error('Only project creator can update project details');
    }

    // Update project
    return tx.project.update({
      where: { id: projectId },
      data,
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        members: {
          select: {
            id: true,
            user: {
              select: {
                id: true,
                name: true,
                profilePicture: true,
              },
            },
          },
        },
      },
    });
  });
};

export const deleteProjectService = async (
  communityId: string,
  projectId: string,
  userId: string
) => {
  return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
    // Check if project exists and belongs to the community
    const project = await tx.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new Error('Project not found');
    }

    // Check if user is the project creator
    if (project.createdById !== userId) {
      throw new Error('Only project creator can delete the project');
    }

    // Delete project
    await tx.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  });
};
