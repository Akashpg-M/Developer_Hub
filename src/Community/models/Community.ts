import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { User } from './User';
import { Task } from './Task';
import { Folder } from './Folder';

export enum CommunityType {
  PUBLIC = 'PUBLIC',
  PROTECTED = 'PROTECTED',
  PRIVATE = 'PRIVATE'
}

export enum CommunityRole {
  ADMIN = 'ADMIN',
  MANAGER = 'MANAGER',
  TEAM_HEAD = 'TEAM_HEAD',
  MEMBER = 'MEMBER'
}

@Entity()
export class Community {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column('text')
  description: string;

  @Column({
    type: 'enum',
    enum: CommunityType,
    default: CommunityType.PUBLIC
  })
  type: CommunityType;

  @ManyToOne(() => Community, community => community.subCommunities, { nullable: true })
  parentCommunity: Community;

  @OneToMany(() => Community, community => community.parentCommunity)
  subCommunities: Community[];

  @Column('uuid', { nullable: true })
  parentCommunityId: string;

  @ManyToMany(() => User)
  @JoinTable({
    name: 'community_members',
    joinColumn: { name: 'community_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'user_id', referencedColumnName: 'id' }
  })
  members: User[];

  @Column('jsonb', { default: {} })
  roles: {
    [userId: string]: CommunityRole;
  };

  @OneToMany(() => Task, task => task.community)
  tasks: Task[];

  @OneToMany(() => Folder, folder => folder.community)
  folders: Folder[];

  @Column('jsonb', { default: [] })
  joinRequests: {
    userId: string;
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    requestedAt: Date;
    processedAt?: Date;
    processedBy?: string;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Helper methods
  hasRole(userId: string, role: CommunityRole): boolean {
    return this.roles[userId] === role;
  }

  isAdminOrManager(userId: string): boolean {
    const role = this.roles[userId];
    return role === CommunityRole.ADMIN || role === CommunityRole.MANAGER;
  }

  canAccess(userId: string): boolean {
    if (this.type === CommunityType.PUBLIC) return true;
    if (this.type === CommunityType.PRIVATE) return false;
    return this.members.some(member => member.id === userId);
  }

  addMember(userId: string, role: CommunityRole = CommunityRole.MEMBER): void {
    this.roles[userId] = role;
  }

  removeMember(userId: string): void {
    delete this.roles[userId];
  }

  addJoinRequest(userId: string): void {
    this.joinRequests.push({
      userId,
      status: 'PENDING',
      requestedAt: new Date()
    });
  }

  processJoinRequest(userId: string, status: 'APPROVED' | 'REJECTED', processedBy: string): void {
    const request = this.joinRequests.find(r => r.userId === userId && r.status === 'PENDING');
    if (request) {
      request.status = status;
      request.processedAt = new Date();
      request.processedBy = processedBy;
    }
  }
} 