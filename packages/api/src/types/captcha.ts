// 验证码数据结构
export interface CaptchaData {
    code: string;           // 验证码
    createdAt: number;      // 创建时间
    expiresAt: number;      // 过期时间
    attempts: number;       // 已尝试次数
    maxAttempts: number;    // 最大尝试次数
  }
  
  // 验证结果
  export interface CaptchaResult {
    success: boolean;       // 是否成功
    message?: string;       // 提示消息
    remainingAttempts?: number;  // 剩余尝试次数
  }
  
  // 验证码配置选项
  export interface CaptchaOptions {
    expiresIn?: number;     // 过期时间(秒)
    maxAttempts?: number;   // 最大尝试次数
  }