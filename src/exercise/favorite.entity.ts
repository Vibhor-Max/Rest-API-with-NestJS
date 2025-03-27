import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  import { Exercise } from './exercise.entity';
  
  @Entity()
  export class Favorite {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.favorites, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToOne(() => Exercise, (exercise) => exercise.favorites, { onDelete: 'CASCADE' })
    exercise: Exercise;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  