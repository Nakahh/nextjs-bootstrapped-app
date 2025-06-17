const webpush = require('web-push');

webpush.setVapidDetails(
  'mailto:seu-email@exemplo.com',
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);

async function sendPushNotification(subscription, payload) {
  try {
    await webpush.sendNotification(subscription, JSON.stringify(payload));
    console.log('Notificação push enviada com sucesso');
  } catch (error) {
    console.error('Erro ao enviar notificação push:', error);
  }
}

module.exports = {
  sendPushNotification,
};
