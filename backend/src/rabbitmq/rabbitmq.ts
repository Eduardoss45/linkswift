// backend/src/rabbitmq/rabbitmq.ts
import amqp from 'amqplib';

let channel: amqp.Channel;

export const connectRabbitMQ = async () => {
  try {
    const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://localhost');
    channel = await connection.createChannel();
    console.log('Conectado ao RabbitMQ');
  } catch (error) {
    console.error('Falha ao conectar ao RabbitMQ', error);
  }
};

export const getChannel = () => {
  if (!channel) {
    throw new Error('O canal do RabbitMQ não está disponível.');
  }
  return channel;
};