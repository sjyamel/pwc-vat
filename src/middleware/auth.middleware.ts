import { Injectable, NestMiddleware } from "@nestjs/common";
import { NextFunction, Request, Response } from "express";
import { JwtPayload, verify } from "jsonwebtoken";
import { UserType } from "src/@nest/usual";
import { PrismaService } from "src/prisma/prisma.service";

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) { }
  async use(req: Request & { user?: UserType }, res: Response, next: NextFunction) {
    try {
      const token = req.headers["authorization"];
      // console.log("Token: ", token);
      if (!token) {
        return res.status(401).json({ message: "Unauthorized", error: "No token provided" });
      }
      const [bearer, jwt] = token.split(" ");
      if (bearer !== "Bearer" || !jwt) {
        return res.status(401).json({ message: "Unauthorized", error: "Invalid token", token: token });
      }

      
      const decoded = verify(jwt.replace("\"", "").replace(" ", ""), process.env.JWT_SECRET as string);

      let email: string | JwtPayload | undefined;
      if (typeof decoded === "string") {
        email = decoded;
      } else if (
        typeof decoded === "object" &&
        decoded !== null &&
        "email" in decoded
      ) {
        email = (decoded as JwtPayload & { email?: string }).email;
      }
      if (!email) {
        return res.status(401).json({ message: "Unauthorized", email: email, decoded: decoded, secret: process.env.JWT_SECRET, token: token });
      }

      const user = await this.prisma.user.findFirst({
        where: {
          email: email as string,
        }
      });

      if (!user) {
        return res.status(401).json({ message: "Unauthorized", email: email, decoded: decoded, secret: process.env.JWT_SECRET, token: token });
      }

      req.user = user;
      next();
    } catch (_) {
      return res.status(401).json({ message: "Unauthorized", error: _.message });
    }
  }
}
