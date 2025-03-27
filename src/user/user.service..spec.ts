import { Test } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from './user.entity';
import { Repository } from 'typeorm';
import { ConflictException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from '../auth/dto/createUser.dto';

jest.mock('bcryptjs', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

describe('UserService', () => {
  let userService: UserService;
  let userRepository: Repository<User>;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    refreshToken: 'oldrefreshtoken',
  };

  const createUserDto: CreateUserDto = {
    username: 'newuser',
    password: 'password',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn().mockResolvedValue(null),
            create: jest.fn().mockReturnValue(mockUser),
            save: jest.fn().mockResolvedValue(mockUser),
            update: jest.fn().mockResolvedValue(undefined),
          },
        },
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    userRepository = moduleRef.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedpassword'); 

      const result = await userService.create(createUserDto);

      expect(result).toEqual(mockUser);
      expect(userRepository.create).toHaveBeenCalledWith({
        ...createUserDto,
        password: 'hashedpassword',
      });
      expect(userRepository.save).toHaveBeenCalledWith(mockUser);
      expect(bcrypt.hash).toHaveBeenCalledWith('password', 10);
    });

    it('should throw a ConflictException if the username already exists', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      try {
        await userService.create(createUserDto);
      } catch (e) {
        expect(e).toBeInstanceOf(ConflictException);
        expect(e.message).toBe('Username already exists');
      }
    });
  });

  describe('findByUsername', () => {
    it('should return a user if found by username', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(mockUser);

      const result = await userService.findByUsername('testuser');

      expect(result).toEqual(mockUser);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'testuser' },
      });
    });

    it('should return null if user is not found', async () => {
      (userRepository.findOne as jest.Mock).mockResolvedValue(null);

      const result = await userService.findByUsername('nonexistentuser');

      expect(result).toBeNull();
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { username: 'nonexistentuser' },
      });
    });
  });

  describe('updateRefreshToken', () => {
    it('should update the refresh token successfully', async () => {
      (bcrypt.hash as jest.Mock).mockResolvedValue('hashedrefreshtoken');

      await userService.updateRefreshToken(1, 'newrefreshtoken');

      expect(bcrypt.hash).toHaveBeenCalledWith('newrefreshtoken', 10);
      expect(userRepository.update).toHaveBeenCalledWith(1, { refreshToken: 'hashedrefreshtoken' });
    });
  });
});
