import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { User } from '../user/user.entity';
import { Favorite } from './favorite.entity';
import { Save } from './save.entity';
import { Rating } from './rating.entity';
import { CreateExerciseDto } from './dto/createExercise.dto';
import { UpdateExerciseDto } from './dto/updateExercise.dto';
import { ExerciseWithCountsDto } from './exerciseWithCounts.dto';

@Injectable()
export class ExerciseService {
  constructor(
    @InjectRepository(Exercise)
    private readonly exerciseRepository: Repository<Exercise>,

    @InjectRepository(Favorite)
    private favoriteRepository: Repository<Favorite>,

    @InjectRepository(Save)
    private saveRepository: Repository<Save>,

    @InjectRepository(Rating)
    private ratingRepository: Repository<Rating>,

  ) {}

  async create(createExerciseDto: CreateExerciseDto, user: User): Promise<Exercise> {
    const exercise = this.exerciseRepository.create({
      ...createExerciseDto,
      createdBy: user,
    });
    return this.exerciseRepository.save(exercise);
  }

  async update(id: number, updateExerciseDto: UpdateExerciseDto, user: User): Promise<Exercise> {
    const exercise = await this.exerciseRepository.findOne({ where: { id }, relations: ['createdBy'] });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Public exercises can be modified by anyone, non-public only by the creator
    if (!exercise.isPublic && exercise.createdBy.id !== user.id) {
      throw new ForbiddenException('You do not have permission to modify this exercise');
    }

    Object.assign(exercise, updateExerciseDto);
    return this.exerciseRepository.save(exercise);
  }

  async delete(id: number, user: User): Promise<void> {
    const exercise = await this.exerciseRepository.findOne({ where: { id }, relations: ['createdBy'] });

    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }

    // Public exercises can be deleted by anyone, non-public only by the creator
    if (!exercise.isPublic && exercise.createdBy.id !== user.id) {
      throw new ForbiddenException('You do not have permission to delete this exercise');
    }

    await this.exerciseRepository.delete(id);
  }

  async findAll(user: User, filters: any): Promise<Exercise[]> {
    const query = this.exerciseRepository.createQueryBuilder('exercise')
      .leftJoinAndSelect('exercise.favorites', 'favorite')
      .leftJoinAndSelect('exercise.saves', 'save')       
      .leftJoinAndSelect('exercise.ratings', 'rating');    
  
    // Filter public exercises or non-public ones created by the user
    query.where('exercise.isPublic = :isPublic', { isPublic: true });
    query.orWhere('exercise.createdById = :userId', { userId: user.id });
  
    if (filters.name) {
      query.andWhere('LOWER(exercise.name) LIKE :name', { name: `%${filters.name.toLowerCase()}%` });
    }
    if (filters.description) {
      query.andWhere('LOWER(exercise.description) LIKE :description', { description: `%${filters.description.toLowerCase()}%` });
    }
    if (filters.difficulty) {
      query.andWhere('exercise.difficulty = :difficulty', { difficulty: filters.difficulty });
    }
  
    if (filters.sortBy) {
      query.orderBy(`exercise.${filters.sortBy}`, filters.order === 'DESC' ? 'DESC' : 'ASC');
    }
  
    const exercises = await query.getMany();
  
    // Add favoriteCount and saveCount to each exercise
    return exercises.map((exercise) => ({
      ...exercise,
      favoriteCount: exercise.favorites.length,
      saveCount: exercise.saves.length,
    }));
  }

  async findOne(id: number, user: User): Promise<ExerciseWithCountsDto> {
    const exercise = await this.exerciseRepository.findOne({
      where: { id },
      relations: ['createdBy', 'favorites', 'saves', 'ratings'],
    });
  
    if (!exercise) {
      throw new NotFoundException('Exercise not found');
    }
  
    // Only the creator can view non-public exercises
    if (!exercise.isPublic && exercise.createdBy.id !== user.id) {
      throw new ForbiddenException('You do not have permission to view this exercise');
    }
  
    // Returns a DTO with favoriteCount and saveCount
    return {
      id: exercise.id,
      name: exercise.name,
      description: exercise.description,
      favoriteCount: exercise.favorites.length,
      saveCount: exercise.saves.length,
      createdBy: exercise.createdBy,
    };
  }

  async favoriteExercise(exerciseId: number, user: User) {
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Exercise not found');

    const existingFavorite = await this.favoriteRepository.findOne({ where: { exercise, user } });
    if (existingFavorite) {
      await this.favoriteRepository.delete(existingFavorite.id);
      return { message: 'Exercise unfavorited' };
    }

    const favorite = this.favoriteRepository.create({ exercise, user });
    await this.favoriteRepository.save(favorite);
    return { message: 'Exercise favorited' };
  }

  async saveExercise(exerciseId: number, user: User) {
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Exercise not found');

    const existingSave = await this.saveRepository.findOne({ where: { exercise, user } });
    if (existingSave) {
      await this.saveRepository.delete(existingSave.id);
      return { message: 'Exercise unsaved' };
    }

    const save = this.saveRepository.create({ exercise, user });
    await this.saveRepository.save(save);
    return { message: 'Exercise saved' };
  }

  async rateExercise(exerciseId: number, user: User, value: number) {
    if (value < 1 || value > 5) {
      throw new Error('Rating must be between 1 and 5');
    }
  
    const exercise = await this.exerciseRepository.findOne({ where: { id: exerciseId } });
    if (!exercise) throw new NotFoundException('Exercise not found');
  
    const existingRating = await this.ratingRepository.findOne({ where: { exercise, user } });
  
    if (existingRating) {
      existingRating.value = value;
      await this.ratingRepository.save(existingRating);
    } else {
      const rating = new Rating();
      rating.exercise = exercise;
      rating.user = user;
      rating.value = value;
      await this.ratingRepository.save(rating);
    }
  
    return { message: 'Exercise rated' };
  }

  async getUsersWhoFavoritedExercise(exerciseId: number) {
    const users = await this.favoriteRepository.find({
      where: { exercise: { id: exerciseId } },
      relations: ['user'],
    });
    return users.map((f) => f.user);
  }
}
