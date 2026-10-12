import { ServiceUnavailableException } from '@nestjs/common';
import { ConnectionStates } from 'mongoose';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  const connection = { readyState: ConnectionStates.connected } as any;
  const controller = new HealthController(connection);

  it('reports an operational API', () => {
    const result = controller.check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('kungacv-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });

  it('reports readiness when MongoDB is connected', () => {
    expect(controller.ready().status).toBe('ok');
  });

  it('fails readiness when MongoDB is disconnected', () => {
    connection.readyState = ConnectionStates.disconnected;
    expect(() => controller.ready()).toThrow(ServiceUnavailableException);
    connection.readyState = ConnectionStates.connected;
  });
});
