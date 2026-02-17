import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from "@nestjs/common";
import { compareSync, hashSync } from "bcryptjs";
import { PrismaService } from "src/prisma/prisma.service";
import {
  RegisterDto,
} from "./auth.dto";
import { sign } from "jsonwebtoken";
// import axios from "axios";



@Injectable()
export class AuthService {
  constructor(private prisma: PrismaService) { }

  async login(email: string, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      throw new BadRequestException("Account does not exist");
    }
    if (!compareSync(password, user.password))
      throw new BadRequestException("Invalid credentials");



    return {
      status: true,
      message: "Login successful",
      token: sign({ email }, process.env.JWT_SECRET as string, {
        expiresIn: "6h",
      }),
      role: user.role,
    };
  }

  async register(body: RegisterDto) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (user?.email === body.email)
      throw new BadRequestException("Account already exists");

    if (body.role !== 'ADMIN' && !body.organizationId)
      throw new BadRequestException("Organization is required");

    if (body.role !== 'ADMIN' && body.organizationId) {
      const organization = await this.prisma.organization.findUnique({
        where: {
          id: body.organizationId,
        },
      });
      if (!organization)
        throw new BadRequestException("Organization does not exist");
    }


    await this.prisma.user.create({
      data: {
        name: body.name,
        email: body.email,
        phone: body.phone,
        gender: body.gender,
        role: body.role,
        organizationId: body.organizationId,
        password: hashSync(body.password, 10),


      },
    });

    await this.sendOTP(body.email, "welcome", true, { username: body.name });

    return {
      status: true,
      message: "Account created",
      token: sign({ email: body.email }, process.env.JWT_SECRET as string, {
        expiresIn: "6h",
      }),
    };
  }

  async sendOTP(
    email: string,
    type: "reset" | "welcome" | "update" | "mention" | "suspend",
    optional = false,
    data: {
      username?: string;
      actionType?: string;
      actorName?: string;
      resourceTitle?: string;
      resourceNumber?: string;
      resourceId?: string;
      resourceCategory?: string;
      resourcePriority?: string;
      case?: boolean;
    },
  ) {
    const token = String(Math.floor(Math.random() * 899999) + 100000);
    if (["registration", "reset", "suspend"].includes(type)) {
      await this.prisma.authToken.deleteMany({
        where: {
          email,
        },
      });

      await this.prisma.authToken.create({
        data: {
          token,
          type,
          email,
          expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        },
      });
    }



    const emailSplit = email.split("@");

    return {
      status: true,
      message: "Verification code sent",
      email: `${email[0]}******${emailSplit[0][emailSplit[0].length - 1]}@${emailSplit[1]
        }`,
    };
  }



  async getProfile(user: any) {
    try {
      return {
        status: true,
        message: "Profile fetched",
        data: user,
      };
    } catch (_) {
      throw new InternalServerErrorException("Something went wrong");
    }
  }

}