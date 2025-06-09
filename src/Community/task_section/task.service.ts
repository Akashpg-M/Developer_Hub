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
  projectId: string,
  userId: string,
  body: {
    title: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string | null;
    dueDate?: Date;
  }
) => {
  try {
    const { title, description, priority, status, assignedTo, dueDate } = body;

    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found or does not belong to this community");
    }

    if (assignedTo) {
      const isAssignedUserMember = await prisma.projectMember.findFirst({
        where: {
          userId: assignedTo,
          projectId,
        },
      });

      if (!isAssignedUserMember) {
        throw new NotFoundError("Assigned user is not a member of this project");
      }
    }

    const taskCode = `TASK-${Date.now()}`;

    const task = await prisma.task.create({
      data: {
        taskCode,
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
  projectId: string,
  taskId: string,
  body: {
    title?: string;
    description?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    assignedTo?: string | null;
    dueDate?: Date;
  }
) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found or does not belong to this community");
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        projectId,
      },
    });

    if (!task) {
      throw new NotFoundError("Task not found or does not belong to this project");
    }

    if (body.assignedTo) {
      const isAssignedUserMember = await prisma.projectMember.findFirst({
        where: {
          userId: body.assignedTo,
          projectId,
        },
      });

      if (!isAssignedUserMember) {
        throw new NotFoundError("Assigned user is not a member of this project");
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
        dueDate: body.dueDate
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

    if (filters.status?.length) {
      where.status = { in: filters.status };
    }

    if (filters.priority?.length) {
      where.priority = { in: filters.priority };
    }

    if (filters.assignedTo?.length) {
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

    const { pageSize, pageNumber } = pagination;
    const skip = (pageNumber - 1) * pageSize;

    const [tasks, totalCount] = await Promise.all([
      prisma.task.findMany({
        where,
        skip,
        take: pageSize,
        orderBy: { createdAt: 'desc' },
        include: {
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
      }),
      prisma.task.count({ where }),
    ]);

    const totalPages = Math.ceil(totalCount / pageSize);

    return {
      tasks,
      pagination: {
        pageSize,
        pageNumber,
        totalCount,
        totalPages,
        skip,
      },
    };
  } catch (error) {
    throw new Error('Failed to fetch tasks');
  }
};

export const getTaskByIdService = async (
  communityId: string,
  projectId: string,
  taskId: string
) => {
  try {
    const project = await prisma.project.findFirst({
      where: {
        id: projectId,
        communityId,
      },
    });

    if (!project) {
      throw new NotFoundError("Project not found or does not belong to this community");
    }

    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        communityId,
        projectId,
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
      throw new NotFoundError("Task not found");
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
