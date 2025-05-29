import { AppDataSource } from '../config/db';
import { User, AuthProvider } from '../models/user.model';
import { compare } from '../utils/hash';
import { generateAccessToken, generateRefreshToken } from '../utils/token';
import { ValidationError } from '../middlewares/validate';

export class AuthService {
  private userRepository = AppDataSource.getRepository(User);

  async signup(name: string, email: string, password: string) {
    const existingUser = await this.userRepository.findOne({
      where: { email }
    });

    if (existingUser) {
      throw new ValidationError([{ msg: 'Email already registered' }]);
    }

    const user = this.userRepository.create({
      name,
      email,
      password,
      provider: AuthProvider.LOCAL
    });

    await this.userRepository.save(user);
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { user, accessToken, refreshToken };
  }

  async login(email: string, password: string) {
    const user = await this.userRepository.findOne({
      where: { email }
    });

    if (!user || !user.password) {
      throw new ValidationError([{ msg: 'Invalid credentials' }]);
    }

    const isValidPassword = await compare(password, user.password);
    if (!isValidPassword) {
      throw new ValidationError([{ msg: 'Invalid credentials' }]);
    }

    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    user.refreshToken = refreshToken;
    await this.userRepository.save(user);

    return { user, accessToken, refreshToken };
  }

  async refreshToken(refreshToken: string) {
    const user = await this.userRepository.findOne({
      where: { refreshToken }
    });

    if (!user) {
      throw new ValidationError([{ msg: 'Invalid refresh token' }]);
    }

    const accessToken = generateAccessToken(user);
    const newRefreshToken = generateRefreshToken(user);

    user.refreshToken = newRefreshToken;
    await this.userRepository.save(user);

    return { accessToken, refreshToken: newRefreshToken };
  }

  async logout(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (user) {
      user.refreshToken = undefined;
      await this.userRepository.save(user);
    }
  }

  async getCurrentUser(userId: string) {
    const user = await this.userRepository.findOne({
      where: { id: userId }
    });

    if (!user) {
      throw new ValidationError([{ msg: 'User not found' }]);
    }

    return user;
  }
} 