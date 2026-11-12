import { prisma } from '../db.js';
import { env } from '../env.js';

export interface QuotaCheckResult {
  allowed: boolean;
  hourlyCount: number;
  dailyCount: number;
  hourlyLimit: number;
  dailyLimit: number;
  resetAt?: Date;
}

export async function checkUserScanQuota(userId: string): Promise<QuotaCheckResult> {
  const now = new Date();
  const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
  const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  const [hourlyCount, dailyCount] = await Promise.all([
    prisma.scan.count({
      where: {
        userId,
        createdAt: { gte: oneHourAgo },
      },
    }),
    prisma.scan.count({
      where: {
        userId,
        createdAt: { gte: oneDayAgo },
      },
    }),
  ]);

  const hourlyLimit = env.SCAN_HOURLY_LIMIT;
  const dailyLimit = env.SCAN_DAILY_LIMIT;

  if (hourlyCount >= hourlyLimit) {
    // Reset in 1 hour from the earliest scan in this window
    const resetAt = new Date(now.getTime() + 60 * 60 * 1000);
    return {
      allowed: false,
      hourlyCount,
      dailyCount,
      hourlyLimit,
      dailyLimit,
      resetAt,
    };
  }

  if (dailyCount >= dailyLimit) {
    const resetAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    return {
      allowed: false,
      hourlyCount,
      dailyCount,
      hourlyLimit,
      dailyLimit,
      resetAt,
    };
  }

  return {
    allowed: true,
    hourlyCount,
    dailyCount,
    hourlyLimit,
    dailyLimit,
  };
}
