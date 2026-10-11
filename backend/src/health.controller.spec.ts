import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('reports an operational API', () => {
    const result = new HealthController().check();

    expect(result.status).toBe('ok');
    expect(result.service).toBe('kungacv-api');
    expect(Number.isNaN(Date.parse(result.timestamp))).toBe(false);
  });
});
