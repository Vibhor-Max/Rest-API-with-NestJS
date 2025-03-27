import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    CreateDateColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  import { Exercise } from './exercise.entity';
  
  @Entity()
  export class Save {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.saves, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToOne(() => Exercise, (exercise) => exercise.saves, { onDelete: 'CASCADE' })
    exercise: Exercise;
  
    @CreateDateColumn()
    createdAt: Date;
  }
  