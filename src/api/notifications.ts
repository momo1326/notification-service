import { Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config';
import { notificationQueue } from '../queue/notificationQueue';

const notificationSchema = Joi.object({
  idempotency_key: Joi.string().uuid().required(),
  user_id: Joi.number().integer().required(),
  channel: Joi.string().valid('email').required(), // For now, only email
  payload: Joi.object({
    to: Joi.string().email().required(),
    subject: Joi.string().required(),
    body: Joi.string().required(),
  }).required(),
});

export async function createNotification(req: Request, res: Response) {
  // Validate input
  const { error, value } = notificationSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { idempotency_key, user_id, channel, payload } = value;

  let notificationId: string;

  try {
    // Attempt INSERT notification
    const insertResult = await pool.query(
      'INSERT INTO notifications (idempotency_key, user_id, channel, payload) VALUES ($1, $2, $3, $4) RETURNING id',
      [idempotency_key, user_id, channel, JSON.stringify(payload)]
    );
    notificationId = insertResult.rows[0].id;
  } catch (error: any) {
    if (error.code === '23505') { // unique_violation
      // Fetch existing notification
      const fetchResult = await pool.query(
        'SELECT id FROM notifications WHERE idempotency_key = $1',
        [idempotency_key]
      );
      if (fetchResult.rows.length === 0) {
        throw new Error('Unexpected: no row found after unique violation');
      }
      notificationId = fetchResult.rows[0].id;
    } else {
      throw error;
    }
  }

  // Enqueue job
  await notificationQueue.add('send-notification', { notificationId });

  // Return 202 Accepted
  res.status(202).json({ message: 'Notification queued for processing' });
}