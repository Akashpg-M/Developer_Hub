import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, ManyToOne, OneToMany } from 'typeorm';
import { Community } from './Community';
import { User } from './User';

@Entity()
export class Folder {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column('text', { nullable: true })
  description?: string;

  @ManyToOne(() => Community, community => community.folders)
  community!: Community;

  @Column('uuid')
  communityId!: string;

  @ManyToOne(() => Folder, folder => folder.subFolders, { nullable: true })
  parentFolder?: Folder;

  @Column('uuid', { nullable: true })
  parentFolderId?: string;

  @OneToMany(() => Folder, folder => folder.parentFolder)
  subFolders!: Folder[];

  @Column('jsonb', { default: [] })
  files!: {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedBy: string;
    uploadedAt: Date;
    permissions: {
      roles: string[];
      users: string[];
    };
  }[];

  @ManyToOne(() => User)
  createdBy!: User;

  @Column('uuid')
  createdById!: string;

  @Column('jsonb', { default: {} })
  permissions!: {
    roles: string[];
    users: string[];
  };

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  // Helper methods
  hasAccess(userId: string, userRole: string): boolean {
    if (this.permissions.users.includes(userId)) return true;
    return this.permissions.roles.includes(userRole);
  }

  addFile(file: {
    id: string;
    name: string;
    originalName: string;
    mimeType: string;
    size: number;
    path: string;
    uploadedBy: string;
  }): void {
    this.files.push({
      ...file,
      uploadedAt: new Date(),
      permissions: {
        roles: [],
        users: [file.uploadedBy]
      }
    });
  }

  removeFile(fileId: string): void {
    this.files = this.files.filter(file => file.id !== fileId);
  }

  addPermission(userId: string): void {
    if (!this.permissions.users.includes(userId)) {
      this.permissions.users.push(userId);
    }
  }

  addRolePermission(role: string): void {
    if (!this.permissions.roles.includes(role)) {
      this.permissions.roles.push(role);
    }
  }
} 