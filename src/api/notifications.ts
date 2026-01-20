import { Request, Response } from 'express';
import Joi from 'joi';
import { pool } from '../config';
import { notificationQueue } from '../queue/notificationQueue';
import { checkIdempotency } from '../middlewares/idempotency';

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

  // Check idempotency
  const exists = await checkIdempotency(idempotency_key);
  if (exists) {
    return res.status(200).json({ message: 'Notification already processed' });
  }

  // Insert notification
  const insertResult = await pool.query(
    'INSERT INTO notifications (idempotency_key, user_id, channel, payload) VALUES ($1, $2, $3, $4) RETURNING id',
    [idempotency_key, user_id, channel, JSON.stringify(payload)]
  );

  const notificationId = insertResult.rows[0].id;

  // Enqueue job
  await notificationQueue.add('send-notification', { notificationId });

  // Return 202 Accepted
  res.status(202).json({ message: 'Notification queued for processing' });
}