import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient } from 'redis';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  protected redisAdapter;

  constructor(app: INestApplication, private configService: ConfigService) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    const pubClient = createClient({ url: `redis://${host}:${port}` });
    const subClient = pubClient.duplicate();

    pubClient.connect();
    subClient.connect();

    pubClient.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.log('Error pubClient =', err);
    });

    pubClient.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('db connect pubClient');
    });

    subClient.on('error', (err) => {
      // eslint-disable-next-line no-console
      console.log('Error subClient =', err);
    });

    pubClient.on('connect', () => {
      // eslint-disable-next-line no-console
      console.log('db connect subClient');
    });

    this.redisAdapter = createAdapter(pubClient, subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }
}
