import { Controller, Get, Patch, Body, Param, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { ReviewService } from './review.service';
import { UpdateReviewStatusDto } from './dto/review.dto';
import { AdminPermissionsGuard, RequirePermission } from '../admin-auth/guards/rbac.guard';

@ApiTags('Admin Reviews')
@ApiBearerAuth()
@UseGuards(AdminPermissionsGuard)
@Controller('admin/reviews')
export class AdminReviewController {
  constructor(private readonly reviewService: ReviewService) {}

  @Get()
  @RequirePermission('orders', 'READ')
  @ApiOperation({ summary: 'Get all reviews for moderation' })
  async getAllReviews() {
    return this.reviewService.getAdminReviews();
  }

  @Patch(':id/status')
  @RequirePermission('orders', 'WRITE')
  @ApiOperation({ summary: 'Update the status of a review (Approve/Reject)' })
  async updateReviewStatus(@Param('id') id: string, @Body() dto: UpdateReviewStatusDto) {
    return this.reviewService.updateReviewStatus(id, dto);
  }
}
