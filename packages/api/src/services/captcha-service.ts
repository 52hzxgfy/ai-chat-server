import { redis } from '../config/redis';
import { CaptchaData, CaptchaResult, CaptchaOptions } from '../types/captcha';

// 默认配置
const DEFAULT_OPTIONS: CaptchaOptions = {
  expiresIn: 300,    // 5分钟过期
  maxAttempts: 5,    // 最多5次尝试
};

// 验证码服务
export const captchaService = {
  // 生成验证码
  async generate(sessionId: string, options: CaptchaOptions = {}): Promise<string> {
    const { expiresIn, maxAttempts } = { ...DEFAULT_OPTIONS, ...options };
    const now = Date.now();
    
    // 生成6位随机数字验证码
    const code = Math.random().toString().slice(2, 8);
    
    // 创建验证码数据
    const captchaData: CaptchaData = {
      code,
      createdAt: now,
      expiresAt: now + (expiresIn * 1000),
      attempts: 0,
      maxAttempts
    };

    // 将验证码数据存储到 Redis
    await redis.set(
      `captcha:${sessionId}`,  // Redis 键名
      JSON.stringify(captchaData),  // 将数据转换为字符串
      'EX',  // 设置过期时间
      expiresIn  // 过期秒数
    );

    return code;
  },

  // 验证验证码
  async verify(sessionId: string, userInput: string): Promise<CaptchaResult> {
    const key = `captcha:${sessionId}`;
    // 从 Redis 获取验证码数据
    const data = await redis.get(key);

    if (!data) {
      return {
        success: false,
        message: '验证码已过期或不存在'
      };
    }

    // 将字符串转换回对象
    const captchaData: CaptchaData = JSON.parse(data);
    
    // 检查是否过期
    if (Date.now() > captchaData.expiresAt) {
      await redis.del(key);  // 删除过期的验证码
      return {
        success: false,
        message: '验证码已过期'
      };
    }

    // 检查尝试次数
    if (captchaData.attempts >= captchaData.maxAttempts) {
      await redis.del(key);  // 删除已达到最大尝试次数的验证码
      return {
        success: false,
        message: '验证码尝试次数已达上限'
      };
    }

    // 更新尝试次数
    captchaData.attempts++;
    await redis.set(
      key,
      JSON.stringify(captchaData),
      'EX',
      Math.ceil((captchaData.expiresAt - Date.now()) / 1000)
    );

    // 验证码匹配检查
    if (userInput !== captchaData.code) {
      return {
        success: false,
        message: '验证码错误',
        remainingAttempts: captchaData.maxAttempts - captchaData.attempts
      };
    }

    // 验证成功，删除验证码
    await redis.del(key);
    
    return {
      success: true,
      message: '验证成功'
    };
  }
};