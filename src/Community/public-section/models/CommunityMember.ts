import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { User } from '../../../auth-system/models/user.model';

export enum CommunityRank {
  MEMBER = 'member',
  DEVELOPER = 'developer',
  MANAGER = 'manager',
  ADMIN = 'admin'
}

@Entity('community_members')
export class CommunityMember {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, { eager: true })
  user: User;

  @Column({
    type: 'enum',
    enum: CommunityRank,
    default: CommunityRank.MEMBER
  })
  rank: CommunityRank;

  @Column({ default: 0 })
  points: number;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  joinedAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
} 