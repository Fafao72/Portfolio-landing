// Этот код выполняется на сервере Vercel и скрывает твои токены
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Method Not Allowed' });
  }

  const { name, contact, message } = req.body;

  // Берем секретные ключи из настроек Vercel (ты их уже добавил)
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, message: 'Server configuration error.' });
  }

  // Оформляем сообщение на английском (Markdown)
  const text = `🔔 *New Project Inquiry!*\n\n` +
               `👤 *Name:* ${name}\n` +
               `📞 *Contact:* ${contact}\n` +
               `💬 *Message:* ${message || 'No message'}`;

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });

    if (response.ok) {
      return res.status(200).json({ success: true, message: 'Message sent!' });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ success: false, details: errorData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}