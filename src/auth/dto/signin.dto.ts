// import { ApiProperty } from '@nestjs/swagger';
// import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

// export class LoginDto {
//   @ApiProperty({ example: 'user@example.com' })
//   @IsNotEmpty()
//   @IsEmail()
//   email: string;

//   @ApiProperty({ example: 'password123' })
//   @IsNotEmpty()
//   @IsString()
//   password: string;
// }
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @IsString()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;
}
