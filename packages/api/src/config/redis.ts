import { Redis } from 'ioredis';

// 确保这些值与你之前设置的 Redis 配置匹配
const redis = new Redis({
  host: '127.0.0.1',        // Redis 服务器地址
  port: 6379,               // Redis 端口
  password: 'your_strong_password',  // 替换成你之前设置的 Redis 密码
});

// 添加连接事件监听
redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

redis.on('error', (error) => {
  console.error('Redis connection error:', error);
});

export { redis };