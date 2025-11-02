import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User, UserRole } from '../users/entities/user.entity';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { LoginDto } from './dto/signin.dto';
import { Customer } from '../customer/entities/customer.entity';
import { RefreshTokenDto } from './dto/refresh-token.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {}

  // ✅ Hash data (password or token)
  private async hashData(data: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(data, salt);
  }

  // ✅ Verify hashed data
  private async verifyHash(data: string, hashedData: string): Promise<boolean> {
    return bcrypt.compare(data, hashedData);
  }

  // ✅ Save hashed refresh token
  private async saveRefreshToken(
    userId: number,
    refreshToken: string,
  ): Promise<void> {
    const hashedToken = await this.hashData(refreshToken);
    await this.userRepository.update(userId, {
      hashedRefreshedToken: hashedToken,
    });
  }

  // ✅ Generate access & refresh tokens
  private generateTokens(userId: number, email: string, role: UserRole) {
    const payload = {
      sub: userId,
      email,
      role,
      type: 'access',
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_ACCESS_TOKEN_SECRET',
      ) as string,
      expiresIn: (this.configService.get<string>(
        'JWT_ACCESS_TOKEN_EXPIRES_IN',
      ) || '2h') as unknown as JwtSignOptions['expiresIn'],
    } as JwtSignOptions);

    const refreshPayload = {
      sub: userId,
      email,
      role,
      type: 'refresh',
    };

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.getOrThrow<string>(
        'JWT_REFRESH_TOKEN_SECRET',
      ) as string,
      expiresIn: (this.configService.get<string>(
        'JWT_REFRESH_TOKEN_EXPIRES_IN',
      ) || '7d') as unknown as JwtSignOptions['expiresIn'],
    } as JwtSignOptions);

    return { accessToken, refreshToken };
  }

  // ✅ Validate and extract user from token
  async validateToken(
    token: string,
    isRefreshToken = false,
  ): Promise<{
    sub: number;
    email: string;
    role: UserRole;
    type: 'access' | 'refresh';
    iat?: number;
    exp?: number;
  }> {
    try {
      const secret = isRefreshToken
        ? this.configService.getOrThrow<string>('JWT_REFRESH_TOKEN_SECRET')
        : this.configService.getOrThrow<string>('JWT_ACCESS_TOKEN_SECRET');

      return await this.jwtService.verifyAsync(token, { secret });
    } catch {
      throw new UnauthorizedException(
        isRefreshToken ? 'Invalid refresh token' : 'Invalid access token',
      );
    }
  }

  // ✅ Register new user with optional customer data
  async signUp(createUserDto: CreateUserDto): Promise<{
    user: Omit<User, 'password' | 'hashedRefreshedToken'>;
    accessToken: string;
    refreshToken: string;
  }> {
    // Check if user already exists
    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Validate role
    const role = createUserDto.userrole || UserRole.CUSTOMER;

    // Validate customer data consistency
    if (
      role === UserRole.CUSTOMER &&
      createUserDto.customer_id &&
      createUserDto.customer
    ) {
      throw new BadRequestException(
        'Provide either customer_id or customer details, not both',
      );
    }

    // Hash password
    const hashedPassword = await this.hashData(createUserDto.password);

    // Handle customer creation if provided
    let customer: Customer | null = null;
    if (createUserDto.customer && role === UserRole.CUSTOMER) {
      try {
        customer = this.customerRepository.create(createUserDto.customer);
        customer = await this.customerRepository.save(customer);
      } catch (_e) {
        throw new InternalServerErrorException(
          'Failed to create customer profile',
        );
      }
    }

    // Use provided customer_id or created customer's ID
    const customerId =
      customer?.customer_id || createUserDto.customer_id || null;

    // For non-customer roles, ensure customer_id is null
    const finalCustomerId = role === UserRole.CUSTOMER ? customerId : null;

    try {
      // Create new user
      const newUser = this.userRepository.create({
        email: createUserDto.email,
        password: hashedPassword,
        role: role,
        is_active: createUserDto.is_active ?? true,
        hashedRefreshedToken: '',
        customer_id: finalCustomerId ?? undefined,
      });

      const savedUser: User = await this.userRepository.save(newUser);

      // Generate tokens
      const { accessToken, refreshToken } = this.generateTokens(
        savedUser.user_id,
        savedUser.email,
        savedUser.role,
      );

      // Save refresh token
      await this.saveRefreshToken(savedUser.user_id, refreshToken);

      // Remove sensitive data
      const userWithoutSensitiveData = { ...savedUser } as any;
      delete userWithoutSensitiveData.password;
      delete userWithoutSensitiveData.hashedRefreshedToken;

      return {
        user: userWithoutSensitiveData,
        accessToken,
        refreshToken,
      };
    } catch (_e) {
      // Clean up customer if user creation fails
      if (customer) {
        await this.customerRepository.delete(customer.customer_id);
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  // ✅ Sign in existing user
  async signIn(loginDto: LoginDto): Promise<{
    user: Omit<User, 'password' | 'hashedRefreshedToken'>;
    accessToken: string;
    refreshToken: string;
  }> {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: ['customer'],
      select: [
        'user_id',
        'email',
        'role',
        'password',
        'is_active',
        'customer_id',
      ],
    });

    if (!user) {
      throw new NotFoundException('Invalid credentials');
    }

    // Check if user is active
    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const passwordMatch = await this.verifyHash(
      loginDto.password,
      user.password,
    );

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Generate tokens
    const { accessToken, refreshToken } = this.generateTokens(
      user.user_id,
      user.email,
      user.role,
    );

    // Save refresh token
    await this.saveRefreshToken(user.user_id, refreshToken);

    // Remove sensitive data
    const userWithoutSensitiveData = { ...user } as any;
    delete userWithoutSensitiveData.password;
    delete userWithoutSensitiveData.hashedRefreshedToken;

    return {
      user: userWithoutSensitiveData,
      accessToken,
      refreshToken,
    };
  }

  // ✅ Refresh access token using refresh token
  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const { refreshToken } = refreshTokenDto;

    // Validate refresh token
    const payload = await this.validateToken(refreshToken, true);

    if (payload.type !== 'refresh') {
      throw new UnauthorizedException('Invalid token type');
    }

    const user = await this.userRepository.findOne({
      where: { user_id: payload.sub },
      select: ['user_id', 'email', 'role', 'hashedRefreshedToken', 'is_active'],
    });

    if (!user || !user.hashedRefreshedToken) {
      throw new UnauthorizedException('Access denied');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify refresh token matches stored token
    const tokenMatch = await this.verifyHash(
      refreshToken,
      user.hashedRefreshedToken,
    );

    if (!tokenMatch) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Generate new tokens
    const tokens = this.generateTokens(user.user_id, user.email, user.role);

    // Save new refresh token
    await this.saveRefreshToken(user.user_id, tokens.refreshToken);

    return tokens;
  }

  // ✅ Sign out user (invalidate refresh token)
  async signOut(userId: number): Promise<{ message: string }> {
    const result = await this.userRepository.update(userId, {
      hashedRefreshedToken: null,
    });

    if (result.affected === 0) {
      throw new NotFoundException('User not found');
    }

    return { message: 'Successfully signed out' };
  }

  // ✅ Get user profile
  async getProfile(
    userId: number,
  ): Promise<Omit<User, 'password' | 'hashedRefreshedToken'>> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId },
      relations: ['customer'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove sensitive data
    const userWithoutSensitiveData = { ...user } as any;
    delete userWithoutSensitiveData.password;
    delete userWithoutSensitiveData.hashedRefreshedToken;
    return userWithoutSensitiveData;
  }

  // ✅ Validate user for guards/strategies
  async validateUser(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { user_id: userId, is_active: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found or inactive');
    }

    return user;
  }
}
