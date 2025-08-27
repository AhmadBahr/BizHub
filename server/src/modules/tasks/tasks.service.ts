import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateTaskDto, UpdateTaskDto } from './dto';
import { Task, TaskStatus, TaskPriority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskDto: CreateTaskDto, userId: string): Promise<Task> {
    const { assignedToId, ...taskData } = createTaskDto;

    // Validate that the assigned user exists
    if (assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedToId }
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    return this.prisma.task.create({
      data: {
        ...taskData,
        user: { connect: { id: userId } },
        assignedTo: assignedToId ? { connect: { id: assignedToId } } : undefined,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    status?: TaskStatus;
    priority?: TaskPriority;
    assignedToId?: string;
    search?: string;
  }): Promise<{ tasks: Task[]; total: number; page: number; limit: number }> {
    const { page = 1, limit = 10, status, priority, assignedToId, search } = query;
    const skip = (page - 1) * limit;

    const where: any = {
      isActive: true,
    };

    if (status) {
      where.status = status;
    }

    if (priority) {
      where.priority = priority;
    }

    if (assignedToId) {
      where.assignedToId = assignedToId;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [tasks, total] = await Promise.all([
      this.prisma.task.findMany({
        where,
        skip,
        take: limit,
        include: {
          assignedTo: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.task.count({ where }),
    ]);

    return { tasks, total, page, limit };
  }

  async findOne(id: string): Promise<Task> {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });

    if (!task || !task.isActive) {
      throw new NotFoundException('Task not found');
    }

    return task;
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task> {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || !existingTask.isActive) {
      throw new NotFoundException('Task not found');
    }

    const { assignedToId, ...taskData } = updateTaskDto;

    // Validate that the assigned user exists
    if (assignedToId) {
      const user = await this.prisma.user.findUnique({
        where: { id: assignedToId }
      });
      if (!user) {
        throw new BadRequestException('Assigned user not found');
      }
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        ...taskData,
        assignedToId: assignedToId || null,
        updatedAt: new Date(),
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async remove(id: string): Promise<void> {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || !existingTask.isActive) {
      throw new NotFoundException('Task not found');
    }

    await this.prisma.task.update({
      where: { id },
      data: { isActive: false },
    });
  }

  async updateStatus(id: string, status: TaskStatus): Promise<Task> {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || !existingTask.isActive) {
      throw new NotFoundException('Task not found');
    }

    const updateData: any = { status, updatedAt: new Date() };

    // If status is COMPLETED, set completedAt
    if (status === TaskStatus.COMPLETED) {
      updateData.completedAt = new Date();
    }

    return this.prisma.task.update({
      where: { id },
      data: updateData,
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async updatePriority(id: string, priority: TaskPriority): Promise<Task> {
    const existingTask = await this.prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask || !existingTask.isActive) {
      throw new NotFoundException('Task not found');
    }

    return this.prisma.task.update({
      where: { id },
      data: { priority, updatedAt: new Date() },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
    });
  }

  async getTasksByUser(userId: string): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        assignedToId: userId,
        isActive: true,
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.prisma.task.findMany({
      where: {
        isActive: true,
        status: {
          in: [TaskStatus.PENDING, TaskStatus.IN_PROGRESS],
        },
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        assignedTo: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      },
      orderBy: { dueDate: 'asc' },
    });
  }
}
