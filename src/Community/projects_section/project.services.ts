import { PrismaClient, Prisma } from '@prisma/client';
import { NotFoundException, UnauthorizedException, TaskStatusEnum } from '../utils/roleManagement';

const prisma = new PrismaClient() as any;

export const createProjectService = async (
  userId: string,
  communityId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  try {
    // Using transaction to ensure both project creation and member addition are atomic
    const result = await prisma.$transaction(async (tx: any) => {
      const project = await tx.project.create({
        data: {
          name: body.name,
          description: body.description,
          emoji: body.emoji || '📊',
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
        },
      });

      // Add creator as project leader
      await tx.projectMember.create({
        data: {
          projectId: project.id,
          userId: userId,
          role: 'LEADER',
        },
      });

      return project;
    });

    return { project: result };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('A project with this name already exists in this community');
      }
    }
    throw error;
  }
};

export const getProjectsInCommunityService = async (
  communityId: string,
  pageSize: number,
  pageNumber: number
) => {
  const skip = (pageNumber - 1) * pageSize;

  const [totalCount, projects] = await Promise.all([
    prisma.project.count({
      where: { communityId },
    }),
    prisma.project.findMany({
      where: { communityId },
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
            role: true,
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
      orderBy: { createdAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { projects, totalCount, totalPages, skip };
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
          role: true,
          joinedAt: true,
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
    throw new NotFoundException(
      'Project not found or does not belong to the specified community'
    );
  }

  return { project };
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
  });

  if (!project) {
    throw new NotFoundException(
      'Project not found or does not belong to this community'
    );
  }

  const currentDate = new Date();

  const [totalTasks, overdueTasks, completedTasks] = await Promise.all([
    prisma.task.count({
      where: { projectId },
    }),
    prisma.task.count({
      where: {
        projectId,
        dueDate: { lt: currentDate },
        status: { not: TaskStatusEnum.DONE },
      },
    }),
    prisma.task.count({
      where: {
        projectId,
        status: TaskStatusEnum.DONE,
      },
    }),
  ]);

  const analytics = {
    totalTasks,
    overdueTasks,
    completedTasks,
  };

  return { analytics };
};

export const joinProjectService = async (
  userId: string,
  communityId: string,
  projectId: string
) => {
  try {
    // Check if project exists and belongs to the community
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new NotFoundException(
        'Project not found or does not belong to the specified community'
      );
    }

    // Check if user is already a member
    const existingMember = await prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });

    if (existingMember) {
      throw new Error('You are already a member of this project');
    }

    // Add user as project member
    const member = await prisma.projectMember.create({
      data: {
        projectId,
        userId,
        role: 'MEMBER',
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

    return { member };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new Error('You are already a member of this project');
      }
    }
    throw error;
  }
};

export const leaveProjectService = async (
  userId: string,
  communityId: string,
  projectId: string
) => {
  // Check if project exists and belongs to the community
  const project = await prisma.project.findFirst({
    where: {
      id: projectId,
      communityId,
    },
    include: {
      members: {
        where: {
          userId,
        },
      },
    },
  });

  if (!project) {
    throw new NotFoundException(
      'Project not found or does not belong to the specified community'
    );
  }

  // Check if user is a member
  if (project.members.length === 0) {
    throw new Error('You are not a member of this project');
  }

  // Check if user is the project creator
  if (project.createdById === userId) {
    throw new UnauthorizedException(
      'Project creator cannot leave the project. Transfer ownership or delete the project instead.'
    );
  }

  // Remove user from project
  await prisma.projectMember.delete({
    where: {
      projectId_userId: {
        projectId,
        userId,
      },
    },
  });

  return { success: true };
};

export const getProjectMembersService = async (
  communityId: string,
  projectId: string,
  pageSize: number,
  pageNumber: number
) => {
  const skip = (pageNumber - 1) * pageSize;

  const [totalCount, members] = await Promise.all([
    prisma.projectMember.count({
      where: {
        project: {
          id: projectId,
          communityId,
        },
      },
    }),
    prisma.projectMember.findMany({
      where: {
        project: {
          id: projectId,
          communityId,
        },
      },
      skip,
      take: pageSize,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
      },
      orderBy: { joinedAt: 'desc' },
    }),
  ]);

  const totalPages = Math.ceil(totalCount / pageSize);

  return { members, totalCount, totalPages, skip };
};

export const updateProjectService = async (
  communityId: string,
  projectId: string,
  userId: string,
  body: {
    emoji?: string;
    name: string;
    description?: string;
  }
) => {
  try {
    // Check if user has permission to update (must be project leader or creator)
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        OR: [
          { role: 'LEADER' },
          {
            project: {
              createdById: userId,
            },
          },
        ],
      },
    });

    if (!member) {
      throw new UnauthorizedException(
        'You do not have permission to update this project'
      );
    }

    const project = await prisma.project.update({
      where: {
        id: projectId,
        communityId,
      },
      data: {
        name: body.name,
        emoji: body.emoji,
        description: body.description,
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
            role: true,
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

    return { project };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Project not found or does not belong to the specified community'
        );
      }
      if (error.code === 'P2002') {
        throw new Error('A project with this name already exists in this community');
      }
    }
    throw error;
  }
};

export const deleteProjectService = async (
  communityId: string,
  projectId: string,
  userId: string
) => {
  try {
    // Check if user has permission to delete (must be project leader or creator)
    const member = await prisma.projectMember.findFirst({
      where: {
        projectId,
        userId,
        OR: [
          { role: 'LEADER' },
          {
            project: {
              createdById: userId,
            },
          },
        ],
      },
    });

    if (!member) {
      throw new UnauthorizedException(
        'You do not have permission to delete this project'
      );
    }

    // Using transaction to ensure atomicity
    await prisma.$transaction(async (tx: any) => {
      // Delete all tasks associated with the project
      await tx.task.deleteMany({
        where: { projectId },
      });

      // Delete all project members
      await tx.projectMember.deleteMany({
        where: { projectId },
      });

      // Delete the project
      await tx.project.delete({
        where: {
          id: projectId,
          communityId,
        },
      });
    });

    return { success: true };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException(
          'Project not found or does not belong to the specified community'
        );
      }
    }
    throw error;
  }
};
