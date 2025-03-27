import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    ManyToOne,
    CreateDateColumn,
    UpdateDateColumn,
    OneToMany,
    Index,
  } from 'typeorm';
  import { User } from '../user/user.entity';
  import { Favorite } from './favorite.entity';
  import { Save } from './save.entity';
  import { Rating } from './rating.entity';
  
  @Entity()
  @Index(['name', 'difficulty'])
  export class Exercise {
    @PrimaryGeneratedColumn()
    id: number;
  
    @Column({ unique: true })
    name: string;
  
    @Column()
    description: string;
  
    @Column({ type: 'int' })
    difficulty: number;
  
    @Column({ default: true })
    isPublic: boolean;
  
    @ManyToOne(() => User, (user) => user.exercises, { onDelete: 'CASCADE' })
    createdBy: User;
  
    @CreateDateColumn()
    createdAt: Date;
  
    @UpdateDateColumn()
    updatedAt: Date;
  
    @OneToMany(() => Favorite, (favorite) => favorite.exercise)
    favorites: Favorite[];
  
    @OneToMany(() => Save, (save) => save.exercise)
    saves: Save[];
  
    @OneToMany(() => Rating, (rating) => rating.exercise)
    ratings: Rating[];

    @Column({ nullable: true })
    duration: number;
  }
  