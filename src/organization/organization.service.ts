import { Injectable } from '@nestjs/common';
import { hashSync } from 'bcryptjs';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class OrganizationService {

    constructor(private prisma: PrismaService) { }

    async createOrganization(name: string, email: string, phone: string, address: string, tin: string, rc_number: string) {
        const organization = await this.prisma.organization.create({
            data: {
                name,
                email,
                phone,
                address,
                tin,
                rc_number,

            },
        });
        const manager = await this.prisma.user.create({
            data: {
                name,
                email,
                phone,
                organizationId: organization.id,
                role: 'ADMIN',
                status: 'ACTIVE',
                gender: 'MALE',
                password: hashSync('password', 10),

            },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                // organizationId: true,
                role: true,
                status: true,
                gender: true,
                // password: true,
            }
        });
        return { organization, manager, message: 'Organization created successfully' };
    }

    async getOrganization(id: string, user: any) {

        const organization = await this.prisma.organization.findUnique({
            where: {
                id,
            },
        });
        if (!organization) {
            return { message: 'Organization not found' };
        }
        if (user.role !== 'ADMIN' && user.organizationId !== organization.id) {
            return { message: 'Unauthorized' };
        }
        return organization;
    }

    async updateOrganization(id: string, data: any, user: any) {
        const organization = await this.prisma.organization.findUnique({
            where: {
                id,
            },
        });
        if (!organization) {
            return { message: 'Organization not found' };
        }
        if (user.role !== 'ADMIN' && (user.organizationId !== organization.id && user.rank !== 'MANAGER')) {
            return { message: 'Unauthorized' };
        }
        return this.prisma.organization.update({
            where: {
                id,
            },
            data,
        });
    }

    async deleteOrganization(id: string, user: any) {
        const organization = await this.prisma.organization.findUnique({
            where: {
                id,
            },
        });
        if (!organization) {
            return { message: 'Organization not found' };
        }
        if (user.role !== 'ADMIN' && (user.organizationId !== organization.id && user.rank !== 'MANAGER')) {
            return { message: 'Unauthorized' };
        }
        return this.prisma.organization.delete({
            where: {
                id,
            },
        });
    }

    async getAllOrganizations(filters: any, user: any) {
        if (user.role !== 'ADMIN') {
            return { message: 'Unauthorized' };
        }
        return this.prisma.organization.findMany(
            { where: filters }
        );
    }


}
