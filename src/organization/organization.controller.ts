import { Controller, Post, Body, Get, Param, Put, Delete, Query } from '@nestjs/common';
import { OrganizationService } from './organization.service';
import { User } from 'src/@nest/uncommon';
// import { UserType } from 'src/@nest/usual';

@Controller('organization')
export class OrganizationController {
    constructor(private readonly organizationService: OrganizationService) { }

    @Post()
    async createOrganization(@Body() body: any) {
        return this.organizationService.createOrganization(body.name, body.email, body.phone, body.address, body.tin, body.rc_number);
    }

    @Get(':id')
    async getOrganization(@Param('id') id: string, @User() user: any) {
        return this.organizationService.getOrganization(id, user);
    }

    @Put(':id')
    async updateOrganization(@Param('id') id: string, @Body() body: any, @User() user: any) {
        return this.organizationService.updateOrganization(id, body, user);
    }

    @Delete(':id')
    async deleteOrganization(@Param('id') id: string, @User() user: any) {
        return this.organizationService.deleteOrganization(id, user);
    }

    @Get()
    async getAllOrganizations(@Query() query: any, @User() user: any) {
        return this.organizationService.getAllOrganizations(query, user);
    }
}
