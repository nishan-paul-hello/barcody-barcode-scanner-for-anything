import { registerAs } from '@nestjs/config';

export default registerAs('redis', () => ({
  url: process.env.REDIS_URL,
  ttl: parseInt(process.env.REDIS_TTL as string, 10),
  max: parseInt(process.env.REDIS_MAX as string, 10),
}));
