import { DataSource } from 'typeorm';
import { User } from '../models/User';
import { Community } from '../models/Community';
import { Task } from '../models/Task';
import { Folder } from '../models/Folder';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'developer_hub',
  synchronize: process.env.NODE_ENV !== 'production',
  logging: process.env.NODE_ENV !== 'production',
  entities: [User, Community, Task, Folder],
  migrations: ['src/migrations/*.ts'],
  subscribers: ['src/subscribers/*.ts']
}); 