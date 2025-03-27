import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Exercise } from './exercise.entity';
import { ExerciseService } from './exercise.service';
import { Favorite } from './favorite.entity';
import { Save } from './save.entity';
import { Rating } from './rating.entity';
import { ExerciseController } from './exercise.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Exercise, Favorite, Save, Rating])],
  providers: [ExerciseService],
  controllers: [ExerciseController],
  exports: [ExerciseService],
})

export class ExerciseModule {}
