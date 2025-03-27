import { Test } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UserService } from '../user/user.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';

jest.mock('bcryptjs', () => ({
  compare: jest.fn(),
}));

describe('AuthService', () => {
  let authService: AuthService;
  let userService: UserService;
  let jwtService: JwtService;

  const mockUser = {
    id: 1,
    username: 'testuser',
    password: 'hashedpassword',
    refreshToken: 'oldrefreshtoken',
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UserService,
          useValue: {
            findByUsername: jest.fn().mockResolvedValue(mockUser),
            updateRefreshToken: jest.fn().mockResolvedValue(undefined),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockImplementation((payload, options) => {
              return options?.expiresIn ? 'mocked-refresh-token' : 'mocked-access-token';
            }),
          },
        },
      ],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    userService = moduleRef.get<UserService>(UserService);
    jwtService = moduleRef.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('validateUser', () => {
    it('should return user without password if correct credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.validateUser('testuser', 'correctpassword');
      expect(result).toEqual({ id: 1, username: 'testuser', refreshToken: 'oldrefreshtoken' });
      expect(bcrypt.compare).toHaveBeenCalledWith('correctpassword', 'hashedpassword');
    });

    it('should return null if incorrect credentials', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      const result = await authService.validateUser('testuser', 'wrongpassword');
      expect(result).toBeNull();
    });

    it('should return null if user not found', async () => {
      (userService.findByUsername as jest.Mock).mockResolvedValue(null);

      const result = await authService.validateUser('nonexistentuser', 'password');
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should return access and refresh tokens when credentials are valid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);

      const result = await authService.login('testuser', 'correctpassword');
      
      expect(result).toEqual({
        accessToken: 'mocked-access-token',
        refreshToken: 'mocked-refresh-token',
      });

      expect(jwtService.sign).toHaveBeenCalledTimes(2); 
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser', sub: 1 });
      expect(jwtService.sign).toHaveBeenCalledWith({ username: 'testuser', sub: 1 }, { expiresIn: '7d' });
      expect(userService.updateRefreshToken).toHaveBeenCalledWith(1, 'mocked_refresh_token');
    });

    it('should throw UnauthorizedException if credentials are invalid', async () => {
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      try {
        await authService.login('testuser', 'wrongpassword');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Invalid credentials');
      }
    });

    it('should throw UnauthorizedException if user does not exist', async () => {
      (userService.findByUsername as jest.Mock).mockResolvedValue(null);

      try {
        await authService.login('nonexistentuser', 'password');
      } catch (e) {
        expect(e).toBeInstanceOf(UnauthorizedException);
        expect(e.message).toBe('Invalid credentials');
      }
    });
  });
});
