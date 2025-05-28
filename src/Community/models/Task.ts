import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, ManyToMany, JoinTable } from 'typeorm';
import { Community } from './Community';
import { User } from './User';

export enum TaskStatus {
  BACKLOG = 'BACKLOG',
  PENDING_ASSIGN = 'PENDING_ASSIGN',
  ASSIGNED = 'ASSIGNED',
  IN_PROGRESS = 'IN_PROGRESS',
  TESTING = 'TESTING',
  MAINTAINING = 'MAINTAINING',
  DONE = 'DONE'
}

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  title!: string;

  @Column('text')
  description!: string;

  @Column({
    type: 'enum',
    enum: TaskStatus,
    default: TaskStatus.BACKLOG
  })
  status!: TaskStatus;

  @ManyToOne(() => Community, community => community.tasks)
  community!: Community;

  @Column('uuid')
  communityId!: string;

  @ManyToOne(() => User)
  assignee?: User;

  @Column('uuid', { nullable: true })
  assigneeId?: string;

  @ManyToOne(() => User)
  createdBy!: User;

  @Column('uuid')
  createdById!: string;

  @Column('simple-array', { default: '' })
  tags!: string[];

  @Column({ nullable: true })
  dueDate?: Date;

  @Column({ default: 0 })
  priority!: number;

  @Column('jsonb', { default: [] })
  comments!: {
    userId: string;
    content: string;
    createdAt: Date;
  }[];

  @ManyToMany(() => User)
  @JoinTable({
    name: 'task_watchers',
    joinColumn: { name: 'task_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  watchers!: User[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper methods
  addComment(userId: string, content: string): void {
    this.comments.push({
      userId,
      content,
      createdAt: new Date()
    });
  }

  updateStatus(status: TaskStatus): void {
    this.status = status;
  }

  assignTo(userId: string): void {
    this.assigneeId = userId;
    this.status = TaskStatus.ASSIGNED;
  }

  unassign(): void {
    this.assigneeId = undefined;
    this.status = TaskStatus.PENDING_ASSIGN;
  }
} 