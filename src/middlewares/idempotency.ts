import { pool } from '../config';

export async function checkIdempotency(idempotencyKey: string): Promise<boolean> {
  const result = await pool.query(
    'SELECT id FROM notifications WHERE idempotency_key = $1',
    [idempotencyKey]
  );
  return result.rows.length > 0;
}