import {
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  // 🟩 CREATE CUSTOMER
  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    try {
      // Check if email already exists
      const existingCustomer = await this.customerRepository.findOne({
        where: { email: createCustomerDto.email },
      });

      if (existingCustomer) {
        throw new ConflictException('Customer with this email already exists');
      }

      const customer = this.customerRepository.create({
        first_name: createCustomerDto.first_name,
        last_name: createCustomerDto.last_name,
        email: createCustomerDto.email,
        phone_number: createCustomerDto.phone_number,
        address: createCustomerDto.address,
      });

      return await this.customerRepository.save(customer);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new HttpException(
        `Failed to create customer: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🟨 FIND ALL CUSTOMERS
  async findAll(): Promise<Customer[]> {
    try {
      return await this.customerRepository.find({
        select: {
          customer_id: true,
          first_name: true,
          last_name: true,
          email: true,
          phone_number: true,
          address: true,
        },
        relations: ['reservations', 'rentals'], // optional, if you want related data
      });
    } catch (error) {
      throw new HttpException(
        'Error finding customers',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🟦 FIND ONE CUSTOMER BY ID
  async findOne(customer_id: number): Promise<Customer> {
    try {
      const customer = await this.customerRepository.findOne({
        where: { customer_id },
        relations: ['reservations', 'rentals'], // optional
      });

      if (!customer) {
        throw new NotFoundException(
          `Customer with id ${customer_id} not found`,
        );
      }

      return customer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error while finding customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🟧 UPDATE CUSTOMER
  async update(
    customer_id: number,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<Customer> {
    try {
      const existingCustomer = await this.customerRepository.findOne({
        where: { customer_id },
      });

      if (!existingCustomer) {
        throw new NotFoundException(
          `Customer with id ${customer_id} not found`,
        );
      }

      await this.customerRepository.update(customer_id, updateCustomerDto);

      const updatedCustomer = await this.customerRepository.findOne({
        where: { customer_id },
      });

      if (!updatedCustomer) {
        throw new NotFoundException(
          `Customer with id ${customer_id} not found after update`,
        );
      }

      return updatedCustomer;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error while updating customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // 🟥 DELETE CUSTOMER
  async remove(customer_id: number): Promise<string> {
    try {
      const existingCustomer = await this.customerRepository.findOne({
        where: { customer_id },
      });

      if (!existingCustomer) {
        throw new NotFoundException(
          `Customer with id ${customer_id} not found`,
        );
      }

      const result = await this.customerRepository.delete(customer_id);

      if (result.affected === 0) {
        throw new NotFoundException(`Customer not found`);
      }

      return 'Customer deleted successfully';
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new HttpException(
        'Error deleting customer',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
