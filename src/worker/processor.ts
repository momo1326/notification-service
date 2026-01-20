import { Worker } from 'bullmq';
import { notificationQueue, deadLetterQueue, NotificationJobData } from '../queue/notificationQueue';
import { pool } from '../config';
import { sendEmail } from '../providers/emailProvider';

const worker = new Worker('notifications', async (job) => {
  const { notificationId } = job.data as NotificationJobData;

  // Fetch notification
  const result = await pool.query(
    'SELECT * FROM notifications WHERE id = $1',
    [notificationId]
  );

  if (result.rows.length === 0) {
    throw new Error(`Notification ${notificationId} not found`);
  }

  const notification = result.rows[0];

  if (notification.status === 'sent') {
    return; // Already sent, skip
  }

  if (notification.status === 'processing') {
    // If already processing, perhaps another worker is handling, but to be safe, proceed or skip
    // For now, proceed to handle potential duplicate
  }

  // Mark as processing
  await pool.query(
    'UPDATE notifications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
    ['processing', notificationId]
  );

  try {
    // Send email
    await sendEmail(notification.payload);

    // Update status to sent
    await pool.query(
      'UPDATE notifications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['sent', notificationId]
    );
  } catch (error) {
    // Update status to failed
    await pool.query(
      'UPDATE notifications SET status = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2',
      ['failed', notificationId]
    );
    throw error;
  }
}, {
  connection: require('../config').redisConfig,
});

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed`);
});

worker.on('failed', async (job, err) => {
  console.error(`Job ${job?.id} failed:`, err);
  if (job && job.attemptsMade >= 5) {
    // Move to dead-letter queue
    await deadLetterQueue.add('dead-notification', job.data);
    console.log(`Job ${job.id} moved to dead-letter queue`);
  }
});

console.log('Worker started');