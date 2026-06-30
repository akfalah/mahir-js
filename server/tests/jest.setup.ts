import 'dotenv/config';

process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret';
process.env.REDIS_HOST = process.env.REDIS_HOST || 'localhost';
process.env.REDIS_PORT = process.env.REDIS_PORT || '6379';

jest.setTimeout(1000000);
