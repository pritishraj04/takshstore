import { Controller, Get, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public products' })
  @ApiQuery({
    name: 'q',
    required: false,
    type: String,
    description: 'Search query for products',
  })
  async findAll(@Query('q') query?: string) {
    return this.productsService.findAll(query);
  }

  @Post('seed')
  async seed() {
    return this.productsService.seed();
  }
}
