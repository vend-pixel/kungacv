import { BadRequestException, HttpException } from '@nestjs/common';
import { HttpExceptionFilter } from './http-exception.filter';

describe('HttpExceptionFilter', () => {
  const makeHost = (exception: unknown) => {
    const json = jest.fn();
    const response = { status: jest.fn().mockReturnValue({ json }) };
    const request = {
      id: 'req-123',
      method: 'POST',
      originalUrl: '/auth/login',
      url: '/auth/login',
    };
    return {
      host: {
        switchToHttp: () => ({
          getRequest: () => request,
          getResponse: () => response,
        }),
      } as any,
      response,
      json,
      exception,
    };
  };

  it('preserves safe client errors and adds the request ID', () => {
    const filter = new HttpExceptionFilter();
    const context = makeHost(new BadRequestException('invalid payload'));

    filter.catch(context.exception, context.host);

    expect(context.response.status).toHaveBeenCalledWith(400);
    expect(context.json).toHaveBeenCalledWith({
      statusCode: 400,
      message: 'invalid payload',
      requestId: 'req-123',
    });
  });

  it('hides unexpected internal exception details', () => {
    const filter = new HttpExceptionFilter();
    const context = makeHost(new Error('database password leaked'));

    filter.catch(context.exception, context.host);

    expect(context.response.status).toHaveBeenCalledWith(500);
    expect(context.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'internal server error',
      requestId: 'req-123',
    });
  });

  it('does not expose arbitrary exception payloads for unknown status errors', () => {
    const filter = new HttpExceptionFilter();
    const context = makeHost(new HttpException({ detail: 'private' }, 500));

    filter.catch(context.exception, context.host);

    expect(context.json).toHaveBeenCalledWith({
      statusCode: 500,
      message: 'internal server error',
      requestId: 'req-123',
    });
  });
});
