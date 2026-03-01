import { Controller, Get, Post } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
    constructor(private readonly productsService: ProductsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all public products' })
    async findAll() {
        return this.productsService.findAll();
    }

    @Post('seed')
    async seed() {
        return this.productsService.seed();
    }
}
