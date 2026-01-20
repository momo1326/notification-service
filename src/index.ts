import express from 'express';
import { createNotification } from './api/notifications';

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

app.post('/notifications', createNotification);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});