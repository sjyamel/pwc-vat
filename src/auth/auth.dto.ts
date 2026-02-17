import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString, MinLength, ValidateIf } from "class-validator";
import { UserRole } from "../@nest/usual";

export class LoginDto {
  @IsEmail()
  email: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;
}

export class RegisterDto {
  @IsNotEmpty()
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsNotEmpty()
  @IsString()
  phone: string;

  @IsNotEmpty()
  @IsString()
  gender: string;

  @IsNotEmpty()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole, {
    message: "Invalid role"
  })
  role: UserRole;

  @IsNotEmpty()
  @IsString()
  rank: string;

  @IsOptional()
  @IsString()
  organizationId?: string;
}

export class VerifyEmailDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class RequestOTPDto {
  @IsEmail()
  email: string;
}

export class UpdatePasswordDto {
  @IsString()
  @IsNotEmpty()
  oldPassword: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(8)
  newPassword: string;
}

export class LoginResponseDto {
  message: string;
  token: string;
}

export class UpdatePasswordResponseDto {
  message: string;
}

export class ResetPasswordResponseDto {
  message: string;
}

export class VerifyOTPResponseDto {
  message: string;
}

export class RegisterResponseDto {
  message: string;
  token: string;
}

export class ExtraResponseDto {
  status: boolean;
  message: string;
}
export class VerifyOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  token: string;
}

export class UpdateResetPasswordDto {
  @IsString()
  @IsNotEmpty()
  newPassword: string;
}

export class ResendOTPDto {
  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  type: string;
}

export class UpdatePreferencesDto {
  @IsOptional()
  preferences: any
}