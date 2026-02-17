import { Test, TestingModule } from "@nestjs/testing";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { PrismaService } from "src/prisma/prisma.service";

describe("AuthController", () => {
  let controller: AuthController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [AuthService, PrismaService],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it("should log a user", async () => {
    const result = await controller.login({
      email: "test@example.com",
      password: "password",
    });
    expect(result).toEqual({
      status: true,
      message: "Login successful",
      token: expect.any(String),
    });
  });
});
