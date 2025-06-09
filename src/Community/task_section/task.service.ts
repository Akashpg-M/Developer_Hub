import { PrismaClient, TaskStatus, TaskPriority } from '@prisma/client';

// Custom error classes
class NotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

const prisma = new PrismaClient();

export const createTaskService = async (
  communityId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string | null;
    dueDate?: Date;
    projectId?: string | null;
  }
) => {
  try {
    const { title, description, priority, status, assignedTo, dueDate, projectId } = body;

    // If projectId is provided, verify it belongs to the community
    if (projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: projectId,
          communityId,
        },
      });

      if (!project) {
        throw new NotFoundError("Project not found or does not belong to this community");
      }

      // If assigning to someone, verify they are a community member
      if (assignedTo) {
        const isAssignedUserMember = await prisma.communityMember.findFirst({
          where: {
            userId: assignedTo,
            communityId,
          },
        });

        if (!isAssignedUserMember) {
          throw new NotFoundError("Assigned user is not a member of this community");
        }
      }
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        priority: priority || TaskPriority.MEDIUM,
        status: status || TaskStatus.TODO,
        assignedToId: assignedTo,
        createdById: userId,
        communityId,
        projectId,
        dueDate,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        project: projectId ? {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        } : undefined,
      },
    });

    return { task };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Failed to create task');
  }
};

export const updateTaskService = async (
  communityId: string,
  taskId: string,
  body: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string | null;
    dueDate?: Date;
    projectId?: string;
  }
) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        communityId,
      },
    });

    if (!task) {
      throw new NotFoundError("Task not found or does not belong to this community");
    }

    // If projectId is being updated, verify it belongs to the community
    if (body.projectId) {
      const project = await prisma.project.findFirst({
        where: {
          id: body.projectId,
          communityId,
        },
      });

      if (!project) {
        throw new NotFoundError("Project not found or does not belong to this community");
      }
    }

    // If assigning to someone, verify they are a community member
    if (body.assignedTo) {
      const isAssignedUserMember = await prisma.communityMember.findFirst({
        where: {
          userId: body.assignedTo,
          communityId,
        },
      });

      if (!isAssignedUserMember) {
        throw new NotFoundError("Assigned user is not a member of this community");
      }
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: {
        title: body.title,
        description: body.description,
        priority: body.priority,
        status: body.status,
        assignedToId: body.assignedTo,
        dueDate: body.dueDate,
        projectId: body.projectId,
      },
      include: {
        createdBy: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        assignedTo: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        },
      },
    });

    return { updatedTask };
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Failed to update task');
  }
};

export const getAllTasksService = async (
  communityId: string,
  filters: {
    projectId?: string;
    status?: TaskStatus[];
    priority?: TaskPriority[];
    assignedTo?: string[];
    keyword?: string;
    dueDate?: Date;
  },
  pagination: {
    pageSize: number;
    pageNumber: number;
  }
) => {
  try {
    const where: any = {
      communityId,
    };

    if (filters.projectId) {
      where.projectId = filters.projectId;
    }

    if (filters.status && filters.status.length > 0) {
      where.status = { in: filters.status };
    }

    if (filters.priority && filters.priority.length > 0) {
      where.priority = { in: filters.priority };
    }

    if (filters.assignedTo && filters.assignedTo.length > 0) {
      where.assignedToId = { in: filters.assignedTo };
    }

    if (filters.keyword) {
      where.OR = [
        { title: { contains: filters.keyword, mode: 'insensitive' } },
        { description: { contains: filters.keyword, mode: 'insensitive' } },
      ];
    }

    if (filters.dueDate) {
      where.dueDate = filters.dueDate;
    }

    const [total, tasks] = await Promise.all([
      prisma.task.count({ where }),
      prisma.task.findMany({
        where,
        skip: (pagination.pageNumber - 1) * pagination.pageSize,
        take: pagination.pageSize,
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          assignedTo: {
            select: {
              id: true,
              name: true,
              profilePicture: true,
            },
          },
          project: {
            select: {
              id: true,
              name: true,
              emoji: true,
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
      }),
    ]);

    return {
      tasks,
      total,
      pageNumber: pagination.pageNumber,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

export const getTaskByIdService = async (
  communityId: string,
  taskId: string
) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
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
        assignedTo: {
          select: {
            id: true,
            name: true,
            profilePicture: true,
          },
        },
        project: {
          select: {
            id: true,
            name: true,
            emoji: true,
          },
        },
      },
    });

    if (!task) {
      throw new NotFoundError("Task not found or does not belong to this community");
    }

    return task;
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Failed to fetch task');
  }
};

export const deleteTaskService = async (
  communityId: string,
  taskId: string
) => {
  try {
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        communityId,
      },
    });

    if (!task) {
      throw new NotFoundError("Task not found or does not belong to the specified community");
    }

    await prisma.task.delete({
      where: { id: taskId },
    });
  } catch (error) {
    if (error instanceof NotFoundError) {
      throw error;
    }
    throw new Error('Failed to delete task');
  }
};
