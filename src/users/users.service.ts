import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserRole } from './entities/user.entity';
import { Customer } from '../customer/entities/customer.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,

    @InjectRepository(Customer)
    private customerRepository: Repository<Customer>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    try {
      // Check if user with email already exists
      const existingUser = await this.userRepository.findOne({
        where: { email: createUserDto.email },
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }


			// Create new user
			const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
			const user = this.userRepository.create({
				email: createUserDto.email,
				password: hashedPassword,
				role: createUserDto.userrole ?? UserRole.CUSTOMER,
				is_active: true,
			});

      // If role is 'customer', create linked customer record
      // If role is 'customer', create linked customer record
			if (createUserDto.userrole === UserRole.CUSTOMER || !createUserDto.userrole) {
        if (createUserDto.customer) {
          const customer = this.customerRepository.create({
            first_name: createUserDto.customer.first_name,
            last_name: createUserDto.customer.last_name,
            phone_number: createUserDto.customer.phone_number,
            email: createUserDto.email, // optionally sync
            address: createUserDto.customer.address,
          });
          await this.customerRepository.save(customer);
          user.customer = customer; // Link them
        }
      }

      const savedUser = await this.userRepository.save(user);
      return savedUser;
    } catch (error) {
      if (error instanceof ConflictException) throw error;
      throw new HttpException(
        `Failed to create user: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findAll() {
    try {
      return await this.userRepository.find({
        relations: ['customer'],
        select: {
          user_id: true,
          email: true,
          role: true,
          is_active: true,
        },
      });
    } catch {
      throw new HttpException(
        'Error finding users',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async findOne(user_id: number) {
    try {
      const user = await this.userRepository.findOne({
        where: { user_id },
        relations: ['customer'],
      });
      if (!user) {
        throw new NotFoundException(`User with id ${user_id} not found`);
      }
      return user;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error while finding user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async update(user_id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const existingUser = await this.userRepository.findOne({
      where: { user_id },
    });

    if (!existingUser) {
      throw new NotFoundException(`User with id ${user_id} not found`);
    }

    await this.userRepository.update(user_id, updateUserDto);

    const updatedUser = await this.userRepository.findOne({
      where: { user_id },
    });
    if (!updatedUser) {
      throw new NotFoundException(
        `User with id ${user_id} not found after update`,
      );
    }

    return updatedUser;
  }

  async remove(user_id: number): Promise<string> {
    try {
      const result = await this.userRepository.delete(user_id);
      if (result.affected === 0) {
        throw new NotFoundException(`User not found`);
      }
      return 'User deleted successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting the user',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
