import {
  Controller,
  Post,
  Body,
  UseGuards,
  Req,
  BadRequestException,
} from '@nestjs/common';
import type { Request } from 'express';
import { CheckoutService } from './checkout.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('checkout')
export class CheckoutController {
  constructor(private readonly checkoutService: CheckoutService) {}

  @UseGuards(JwtAuthGuard)
  @Post('initiate')
  async initiateCheckout(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    const userId = user?.sub || user?.userId;

    if (!userId) {
      throw new BadRequestException('User not authenticated properly');
    }

    const { totalAmount, items, shippingAddress, developerNotes } = body;

    if (!totalAmount || !items || !items.length) {
      throw new BadRequestException('Invalid checkout block');
    }

    return this.checkoutService.initiateCheckout(
      userId,
      totalAmount,
      items,
      shippingAddress,
      developerNotes,
    );
  }

  @Post('verify')
  async verifyCheckout(
    @Body('razorpayPaymentId') razorpayPaymentId: string,
    @Body('razorpayOrderId') razorpayOrderId: string,
    @Body('razorpaySignature') razorpaySignature: string,
  ) {
    if (!razorpayPaymentId || !razorpayOrderId || !razorpaySignature) {
      throw new BadRequestException('Missing Razorpay signature fields');
    }

    return this.checkoutService.verifyCheckout(
      razorpayPaymentId,
      razorpayOrderId,
      razorpaySignature,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Post('retry')
  async retryCheckout(@Req() req: Request, @Body('orderId') orderId: string) {
    const user = req.user as any;
    const userId = user?.sub || user?.userId;

    if (!userId) {
      throw new BadRequestException('User not authenticated properly');
    }

    if (!orderId) {
      throw new BadRequestException('Missing orderId');
    }

    return this.checkoutService.retryCheckout(orderId, userId);
  }
}
