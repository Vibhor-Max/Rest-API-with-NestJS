import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ExerciseService } from './exercise.service';
import { Exercise } from './exercise.entity';
import { User } from '../user/user.entity';
import { Favorite } from './favorite.entity';
import { Save } from './save.entity';
import { Rating } from './rating.entity';
import { CreateExerciseDto } from './dto/createExercise.dto';
import { UpdateExerciseDto } from './dto/updateExercise.dto';
import { NotFoundException, ForbiddenException } from '@nestjs/common';

describe('ExerciseService', () => {
  let service: ExerciseService;
  let exerciseRepository: Repository<Exercise>;
  let favoriteRepository: Repository<Favorite>;
  let saveRepository: Repository<Save>;
  let ratingRepository: Repository<Rating>;

  const mockUser: User = {
    id: 1,
    username: 'testuser',
    password: 'password',
    refreshToken: 'refreshtoken',
    exercises: [],
    favorites: [],
    saves: [],
    ratings: [],
  };

  const mockExercise: Exercise = {
    id: 1,
    name: 'Test Exercise',
    description: 'Test Description',
    isPublic: true,
    createdBy: mockUser,
    favorites: [],
    saves: [],
    ratings: [],
    createdAt: new Date(),
    updatedAt: new Date(),
    difficulty: 1,
    duration: 5000
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExerciseService,
        {
          provide: getRepositoryToken(Exercise),
          useValue: {
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue(mockExercise),
            findOne: jest.fn().mockResolvedValue(mockExercise),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            createQueryBuilder: jest.fn(() => ({
              leftJoinAndSelect: jest.fn().mockReturnThis(),
              where: jest.fn().mockReturnThis(),
              orWhere: jest.fn().mockReturnThis(),
              andWhere: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              getMany: jest.fn().mockResolvedValue([mockExercise]),
            })),
          },
        },
        {
          provide: getRepositoryToken(Favorite),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue({}),
            find: jest.fn().mockResolvedValue([]),
          },
        },
        {
          provide: getRepositoryToken(Save),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            delete: jest.fn().mockResolvedValue({ affected: 1 }),
            create: jest.fn().mockImplementation((dto) => dto),
            save: jest.fn().mockResolvedValue({}),
          },
        },
        {
          provide: getRepositoryToken(Rating),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            save: jest.fn().mockResolvedValue({}),
          },
        },
      ],
    }).compile();

    service = module.get<ExerciseService>(ExerciseService);
    exerciseRepository = module.get<Repository<Exercise>>(getRepositoryToken(Exercise));
    favoriteRepository = module.get<Repository<Favorite>>(getRepositoryToken(Favorite));
    saveRepository = module.get<Repository<Save>>(getRepositoryToken(Save));
    ratingRepository = module.get<Repository<Rating>>(getRepositoryToken(Rating));
  });

  describe('create', () => {
    it('should create an exercise', async () => {
      const createExerciseDto: CreateExerciseDto = {
        name: 'Test Exercise',
        description: 'Test Description',
        difficulty: 1,
        isPublic: true,
      };

      const result = await service.create(createExerciseDto, mockUser);
      expect(exerciseRepository.create).toHaveBeenCalledWith({
        ...createExerciseDto,
        createdBy: mockUser,
      });
      expect(exerciseRepository.save).toHaveBeenCalled();
      expect(result).toEqual(mockExercise);
    });
  });

  describe('update', () => {
    it('should update an exercise', async () => {
      const updateExerciseDto: UpdateExerciseDto = {
        name: 'Updated Exercise',
      };

      const result = await service.update(1, updateExerciseDto, mockUser);
      expect(exerciseRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['createdBy'],
      });
      expect(result).toEqual(mockExercise);
    });

    it('should throw ForbiddenException if user is not creator of private exercise', async () => {
        const otherUser: User = {
          id: 2,
          username: 'otheruser',
          password: 'password',
          refreshToken: 'refreshtoken',
          exercises: [],
          favorites: [],
          saves: [],
          ratings: [],
        };
        
        const privateExercise: Exercise = { 
          ...mockExercise, 
          isPublic: false, 
          createdBy: otherUser 
        };
        
        jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(privateExercise);
        await expect(service.update(1, {} as UpdateExerciseDto, mockUser))
          .rejects.toThrow(ForbiddenException);
      });
  });

  describe('delete', () => {
    it('should delete an exercise', async () => {
      await service.delete(1, mockUser);
      expect(exerciseRepository.delete).toHaveBeenCalledWith(1);
    });

    it('should throw NotFoundException if exercise not found', async () => {
      jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.delete(999, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the creator of that private exercise', async () => {
        const otherUser: User = {
          id: 2,
          username: 'otheruser',
          password: 'password',
          refreshToken: 'refreshtoken',
          exercises: [],
          favorites: [],
          saves: [],
          ratings: [],
        };
        
        const privateExercise: Exercise = { 
          ...mockExercise, 
          isPublic: false, 
          createdBy: otherUser 
        };
        
        jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(privateExercise);
        await expect(service.delete(1, mockUser)).rejects.toThrow(ForbiddenException);
      });
  });

  describe('findAll', () => {
    it('should return exercises with counts', async () => {
      const filters = { name: 'test', sortBy: 'name', order: 'ASC' };
      const result = await service.findAll(mockUser, filters);
      expect(result).toEqual([{
        ...mockExercise,
        favoriteCount: 0,
        saveCount: 0,
      }]);
    });
  });

  describe('findOne', () => {
    it('should return an exercise with counts', async () => {
      const result = await service.findOne(1, mockUser);
      expect(result).toEqual({
        id: mockExercise.id,
        name: mockExercise.name,
        description: mockExercise.description,
        favoriteCount: 0,
        saveCount: 0,
        createdBy: mockUser,
      });
    });

    it('should throw NotFoundException if the exercise is not found', async () => {
      jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.findOne(999, mockUser)).rejects.toThrow(NotFoundException);
    });

    it('should throw ForbiddenException if user is not the creator of private exercise', async () => {
        const otherUser: User = {
          id: 2,
          username: 'otheruser',
          password: 'password',
          refreshToken: 'refreshtoken',
          exercises: [],
          favorites: [],
          saves: [],
          ratings: [],
        };
        
        const privateExercise: Exercise = { 
          ...mockExercise, 
          isPublic: false, 
          createdBy: otherUser 
        };
        
        jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(privateExercise);
        await expect(service.findOne(1, mockUser)).rejects.toThrow(ForbiddenException);
      });
  });

  describe('favoriteExercise', () => {
    it('should favorite an exercise', async () => {
      const result = await service.favoriteExercise(1, mockUser);
      expect(result).toEqual({ message: 'Exercise favorited' });
    });

    it('should unfavorite an exercise if already favorited', async () => {
      jest.spyOn(favoriteRepository, 'findOne').mockResolvedValue({ id: 1 } as Favorite);
      const result = await service.favoriteExercise(1, mockUser);
      expect(result).toEqual({ message: 'Exercise unfavorited' });
    });

    it('should throw NotFoundException if exercise not found', async () => {
      jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.favoriteExercise(999, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('saveExercise', () => {
    it('should save an exercise', async () => {
      const result = await service.saveExercise(1, mockUser);
      expect(result).toEqual({ message: 'Exercise saved' });
    });

    it('should unsave an exercise if already saved', async () => {
      jest.spyOn(saveRepository, 'findOne').mockResolvedValue({ id: 1 } as Save);
      const result = await service.saveExercise(1, mockUser);
      expect(result).toEqual({ message: 'Exercise unsaved' });
    });

    it('should throw NotFoundException if exercise not found', async () => {
      jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.saveExercise(999, mockUser)).rejects.toThrow(NotFoundException);
    });
  });

  describe('rateExercise', () => {
    it('should rate an exercise', async () => {
      const result = await service.rateExercise(1, mockUser, 5);
      expect(result).toEqual({ message: 'Exercise rated' });
    });

    it('should update rating if already rated', async () => {
      jest.spyOn(ratingRepository, 'findOne').mockResolvedValue({ id: 1, value: 3 } as Rating);
      const result = await service.rateExercise(1, mockUser, 5);
      expect(result).toEqual({ message: 'Exercise rated' });
    });

    it('should throw NotFoundException if exercise not found', async () => {
      jest.spyOn(exerciseRepository, 'findOne').mockResolvedValue(null);
      await expect(service.rateExercise(999, mockUser, 5)).rejects.toThrow(NotFoundException);
    });

    it('should throw error if rating is invalid', async () => {
      await expect(service.rateExercise(1, mockUser, 6)).rejects.toThrow('Rating must be between 1 and 5');
      await expect(service.rateExercise(1, mockUser, 0)).rejects.toThrow('Rating must be between 1 and 5');
    });
  });

  describe('getUsersWhoFavoritedExercise', () => {
    it('should return users who favorited an exercise', async () => {
      const mockFavorite = { id: 1, user: mockUser };
      jest.spyOn(favoriteRepository, 'find').mockResolvedValue([mockFavorite as Favorite]);
      const result = await service.getUsersWhoFavoritedExercise(1);
      expect(result).toEqual([mockUser]);
    });
  });
});