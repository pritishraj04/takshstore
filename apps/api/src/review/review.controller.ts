import { Controller, Post, Get, Body, Param, UseGuards, Req } from '@nestjs/common';
import { ReviewService } from './review.service';
import { CreateReviewDto } from './dto/review.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';

@ApiTags('Reviews')
@Controller('reviews')
export class ReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiOperation({ summary: 'Submit a new review for an order product' })
  async createReview(@Req() req: any, @Body() dto: CreateReviewDto) {
    const userId = req.user?.sub || req.user?.userId;
    return this.reviewService.createReview(userId, dto);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('order/:orderId')
  @ApiOperation({ summary: 'Get user reviews for a specific order' })
  async getOrderReviews(@Req() req: any, @Param('orderId') orderId: string) {
    const userId = req.user?.sub || req.user?.userId;
    return this.reviewService.getOrderReviews(userId, orderId);
  }
}

// Another controller for the public route /products/:id/reviews
@ApiTags('Products')
@Controller('products')
export class ProductReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get(':id/reviews')
  @ApiOperation({ summary: 'Get approved reviews for a product' })
  async getProductReviews(@Param('id') productId: string) {
    return this.reviewService.getProductReviews(productId);
  }
}
