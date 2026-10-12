import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection, ConnectionStates } from 'mongoose';

@Controller('health')
export class HealthController {
  constructor(@InjectConnection() private readonly connection: Connection) {}

  @Get()
  check() {
    return this.live();
  }

  @Get('live')
  live() {
    return {
      status: 'ok',
      service: 'kungacv-api',
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ready')
  ready() {
    if (this.connection.readyState !== ConnectionStates.connected) {
      throw new ServiceUnavailableException({
        status: 'unavailable',
        service: 'kungacv-api',
        dependency: 'mongodb',
      });
    }

    return this.live();
  }
}
