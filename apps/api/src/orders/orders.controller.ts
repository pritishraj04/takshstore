import {
    Controller,
    Post,
    Get,
    Body,
    UseGuards,
    Req,
    Param,
} from '@nestjs/common';
import { OrdersService } from './orders.service';
import { CreateOrderDto } from './dto/create-order.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Orders')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('orders')
export class OrdersController {
    constructor(private readonly ordersService: OrdersService) { }

    @Post()
    @ApiOperation({ summary: 'Create a new physical or digital order' })
    async createOrder(@Req() req: any, @Body() dto: CreateOrderDto) {
        // Handling sub or userId since the auth payload varies
        const userId = req.user?.sub || req.user?.userId;
        return this.ordersService.createOrder(userId, dto);
    }

    @Get()
    async getOrders(@Req() req: any) {
        const userId = req.user?.sub || req.user?.userId;
        return this.ordersService.findAll(userId);
    }

    @Get(':id')
    async getOrder(@Req() req: any, @Param('id') id: string) {
        const userId = req.user?.sub || req.user?.userId;
        console.log(`[DEBUG] getOrder called with param id: ${id}, extracted userId: ${userId}`);
        return this.ordersService.findOne(id, userId);
    }
}
