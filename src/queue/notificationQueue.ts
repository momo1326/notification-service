import { Queue } from 'bullmq';
import { redisConfig } from '../config';

export const notificationQueue = new Queue('notifications', {
  connection: redisConfig,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 2000, // 2 seconds initial
    },
    removeOnComplete: 50,
    removeOnFail: 50,
  },
});

export const deadLetterQueue = new Queue('dead-notifications', {
  connection: redisConfig,
});

export interface NotificationJobData {
  notificationId: string;
}