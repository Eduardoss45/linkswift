// backend/src/queues/emailQueue.ts
import { getChannel } from '../rabbitmq/rabbitmq.js';
import { EmailData } from '../email/email.types.js';

const emailQueue = 'email_queue';

export const sendEmailToQueue = async (emailOptions: EmailData) => {
  const channel = getChannel();
  await channel.assertQueue(emailQueue, { durable: true });
  channel.sendToQueue(emailQueue, Buffer.from(JSON.stringify(emailOptions)), { persistent: true });
};