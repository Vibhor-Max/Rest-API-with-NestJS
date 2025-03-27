import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { Exercise } from 'src/exercise/exercise.entity';
import { Favorite } from 'src/exercise/favorite.entity';
import { Rating } from 'src/exercise/rating.entity';
import { Save } from 'src/exercise/save.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  username: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  refreshToken: string;

  @OneToMany(() => Exercise, (exercise) => exercise.createdBy)
  exercises: Exercise[];

  @OneToMany(() => Favorite, (favorite) => favorite.user)
  favorites: Favorite[];

  @OneToMany(() => Save, (save) => save.user)
  saves: Save[];

  @OneToMany(() => Rating, (rating) => rating.user)
  ratings: Rating[];
}
