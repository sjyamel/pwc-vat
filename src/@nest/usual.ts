import { Prisma } from "@prisma/client";

export interface UserType {
  email: string;
  id: string;
  name: string | null;
  createdAt: Date;
  updatedAt: Date;
  role: string;
  status: string;
  gender: string | null;
  phone: string | null;
  profilePicture: string | null;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  USER = 'USER',
}


export const VatCategory = {
  STANDARD: 'STANDARD',
  ZERO_RATED: 'ZERO_RATED',
  EXEMPT: 'EXEMPT',
}

export const vatRate = {
  STANDARD: 7.5,
  ZERO_RATED: 0.0,
  EXEMPT: 0.0,
}