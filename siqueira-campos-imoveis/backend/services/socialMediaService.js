const axios = require('axios');

async function sendWhatsAppMessage(phoneNumber, message) {
  // Exemplo básico usando API do WhatsApp Business Cloud (requer token e configuração)
  const token = process.env.WHATSAPP_API_TOKEN;
  const url = `https://graph.facebook.com/v15.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const data = {
    messaging_product: 'whatsapp',
    to: phoneNumber,
    text: { body: message },
  };

  try {
    const response = await axios.post(url, data, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    console.log('Mensagem WhatsApp enviada:', response.data);
    return response.data;
  } catch (error) {
    console.error('Erro ao enviar mensagem WhatsApp:', error.response?.data || error.message);
    throw error;
  }
}

async function getInstagramProfile(businessAccountId) {
  // Exemplo básico para obter dados do Instagram Business via Graph API
  const token = process.env.INSTAGRAM_API_TOKEN;
  const url = `https://graph.facebook.com/v15.0/${businessAccountId}?fields=name,username,followers_count,media_count&access_token=${token}`;

  try {
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    console.error('Erro ao obter perfil Instagram:', error.response?.data || error.message);
    throw error;
  }
}

module.exports = {
  sendWhatsAppMessage,
  getInstagramProfile,
};
