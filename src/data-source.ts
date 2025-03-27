import { DataSource } from 'typeorm';
import { User } from './user/user.entity';
import { Exercise } from './exercise/exercise.entity';
import { Favorite } from './exercise/favorite.entity';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: 'Password123',
  database: 'prehabguys_test',
  entities: [User, Exercise, Favorite],
  synchronize: true, 
  logging: true,
  migrations: ['./src/migrations/*.ts'],
});
