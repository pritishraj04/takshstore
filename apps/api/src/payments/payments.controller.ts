import { Controller, Post, Body, HttpCode, HttpStatus, Headers, Param, UseGuards, Req } from '@nestjs/common';
import type { Request } from 'express';
import { PaymentsService } from './payments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('payments')
export class PaymentsController {
    constructor(private readonly paymentsService: PaymentsService) { }

    @Post(['callback', 'webhook'])
    @HttpCode(HttpStatus.OK)
    async handlePhonePeCallback(
        @Headers('x-verify') xVerifyHeader: string,
        @Body() body: any,
    ) {
        await this.paymentsService.verifyPhonePeCallback(body, xVerifyHeader);
        return { status: 'ok' };
    }

    @Post('verify-local')
    async verifyLocalPayment(
        @Body('transactionId') transactionId: string,
        @Body('status') status: string,
    ) {
        return this.paymentsService.verifyLocalPayment(transactionId, status);
    }

    @UseGuards(JwtAuthGuard)
    @Post('retry/:id')
    async retryPhonePePayment(
        @Param('id') orderId: string,
        @Req() req: Request,
    ) {
        // Handle varying JWT payloads standardly
        const user = req.user as any;
        const userId = user?.sub || user?.userId;
        return this.paymentsService.retryPhonePePayment(orderId, userId);
    }
}
