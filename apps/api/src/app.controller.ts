import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getRoot() {
    return { status: 'OK', message: 'Taksh Store API is running' };
  }

  @Get('health')
  getHealth() {
    return { status: 'OK', timestamp: new Date().toISOString() };
  }
}
