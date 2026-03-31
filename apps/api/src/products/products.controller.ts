import { Controller, Get, Param, Post, Query } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ApiOperation, ApiTags, ApiQuery } from '@nestjs/swagger';

@ApiTags('Products')
@Controller('products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all public products' })
  @ApiQuery({ name: 'q', required: false, type: String, description: 'Search term' })
  @ApiQuery({ name: 'tags', required: false, type: String, description: 'Comma-separated tag slugs' })
  async findAll(@Query('q') query?: string, @Query('tags') tags?: string) {
    const tagsArray = tags ? tags.split(',') : [];
    return this.productsService.findAll(query, tagsArray);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific product by ID' })
  async findOne(@Param('id') id: string) {
    return this.productsService.findOne(id);
  }

  @Post('seed')
  async seed() {
    return this.productsService.seed();
  }
}
