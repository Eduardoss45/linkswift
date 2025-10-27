// backend/src/workers/emailWorker.ts
import { connectRabbitMQ, getChannel } from '../rabbitmq/rabbitmq.js';
import { sendEmail as actualSendEmail } from '../email/email.js';
import { EmailData } from '../email/email.types.js';

const emailQueue = 'email_queue';

const startWorker = async () => {
  await connectRabbitMQ();
  const channel = getChannel();
  await channel.assertQueue(emailQueue, { durable: true });

  console.log(`[*] Aguardando mensagens em ${emailQueue}.`);

  channel.consume(
    emailQueue,
    async (msg) => {
      if (msg !== null) {
        try {
          const emailOptions: EmailData = JSON.parse(msg.content.toString());
          await actualSendEmail(emailOptions);
          channel.ack(msg);
        } catch (error) {
          console.error('Erro ao processar a mensagem de e-mail', error);
          channel.nack(msg, false, false);
        }
      }
    },
    { noAck: false }
  );
};

startWorker();