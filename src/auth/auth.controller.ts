import { Body, Controller, Get, Param, Patch, Post, UploadedFile, UploadedFiles, UseInterceptors } from "@nestjs/common";
import { AuthService } from "./auth.service";
import {
  LoginDto,
  RegisterDto,
  RequestOTPDto,
  ResendOTPDto,
  UpdatePasswordDto,
  UpdatePreferencesDto,
  UpdateResetPasswordDto,
  VerifyEmailDto,
} from "./auth.dto";
import { User } from "../@nest/uncommon";
import type { UserType } from "../@nest/usual";
import { FileFieldsInterceptor, FileInterceptor } from "@nestjs/platform-express";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post("login")
  async login(@Body() body: LoginDto) {
    return this.authService.login(body.email, body.password);
  }





  @Post("register")
  async register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }







  @Get("profile")
  async getProfile(@User() user: any) {
    return this.authService.getProfile(user);
  }

}