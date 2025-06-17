const express = require('express');
const router = express.Router();
const { sendWhatsAppMessage, getInstagramProfile } = require('../services/socialMediaService');

// Endpoint para enviar mensagem WhatsApp
router.post('/whatsapp/send', async (req, res) => {
  const { phoneNumber, message } = req.body;
  try {
    const result = await sendWhatsAppMessage(phoneNumber, message);
    res.json({ success: true, data: result });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// Endpoint para obter perfil Instagram
router.get('/instagram/profile/:id', async (req, res) => {
  const businessAccountId = req.params.id;
  try {
    const profile = await getInstagramProfile(businessAccountId);
    res.json({ success: true, data: profile });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

module.exports = router;
