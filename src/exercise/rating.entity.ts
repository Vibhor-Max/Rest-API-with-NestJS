import {
    Entity,
    PrimaryGeneratedColumn,
    ManyToOne,
    Column,
    Unique,
    CreateDateColumn,
    UpdateDateColumn,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  import { Exercise } from './exercise.entity';
  
  @Entity()
  @Unique(['user', 'exercise'])
  export class Rating {
    @PrimaryGeneratedColumn()
    id: number;
  
    @ManyToOne(() => User, (user) => user.ratings, { onDelete: 'CASCADE' })
    user: User;
  
    @ManyToOne(() => Exercise, (exercise) => exercise.ratings, { onDelete: 'CASCADE' })
    exercise: Exercise;
  
    @Column({ type: 'int' })
    rating: number;

    @Column({ type: 'int' })
    value: number;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  }
  