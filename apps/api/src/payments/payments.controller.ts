import { Controller, Post, Body, HttpCode, HttpStatus, Headers } from '@nestjs/common';
import { PaymentsService } from './payments.service';

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
}
