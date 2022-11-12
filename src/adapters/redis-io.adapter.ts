import { IoAdapter } from '@nestjs/platform-socket.io';
import { ServerOptions } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { createClient, RedisClientType } from 'redis';
import { ConfigService } from '@nestjs/config';
import { INestApplication } from '@nestjs/common';

export class RedisIoAdapter extends IoAdapter {
  protected redisAdapter;

  private pubClient: RedisClientType;

  private subClient: RedisClientType;

  constructor(app: INestApplication, private configService: ConfigService) {
    super(app);
  }

  async connectToRedis(): Promise<void> {
    const host = this.configService.get<string>('REDIS_HOST');
    const port = this.configService.get<number>('REDIS_PORT');
    this.pubClient = createClient({ url: `redis://${host}:${port}` });
    this.subClient = this.pubClient.duplicate();
    await Promise.all([this.pubClient.connect(), this.subClient.connect()]);
    this.redisAdapter = createAdapter(this.pubClient, this.subClient);
  }

  createIOServer(port: number, options?: ServerOptions): any {
    const server = super.createIOServer(port, options);
    server.adapter(this.redisAdapter);
    return server;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async close(server: any): Promise<void> {
    await Promise.all([this.pubClient.disconnect(), this.subClient.disconnect()]);
  }
}
