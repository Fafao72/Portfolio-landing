export default async function handler(req, res) {
  // Разрешаем только POST-запросы
  if (req.method !== 'POST') {
    return res.status(405).json({ success: false, message: 'Метод не поддерживается' });
  }

  const { name, contact, message } = req.body;

  // Берем наши секретные ключи из настроек Vercel
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;

  if (!token || !chatId) {
    return res.status(500).json({ success: false, message: 'Ошибка настройки сервера (нет ключей)' });
  }

  // Красиво оформляем сообщение для Telegram (используем Markdown)
  const text = `🔔 *Новая заявка с сайта!*\n\n` +
               `👤 *Имя:* ${name}\n` +
               `📞 *Контакт:* ${contact}\n` +
               `💬 *Сообщение:* ${message || 'Без сообщения'}`;

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
      return res.status(200).json({ success: true, message: 'Сообщение успешно отправлено!' });
    } else {
      const errorData = await response.json();
      return res.status(500).json({ success: false, details: errorData });
    }
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
}