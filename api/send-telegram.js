export default async function handler(req, res) {
    // Разрешаем только POST запросы
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Метод не поддерживается' });
    }

    const { name, phone } = req.body;

    // Проверяем, что поля не пустые
    if (!name || !phone) {
        return res.status(400).json({ error: 'Имя и контактные данные обязательны' });
    }

    // Достаем скрытые ключи из переменных окружения сервера
    const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!BOT_TOKEN || !CHAT_ID) {
        return res.status(500).json({ error: 'Ошибка конфигурации сервера (не найдены ключи)' });
    }

    // Функция экранирования HTML-символов, чтобы код не ломался от спецсимволов вроде <, > или &
    const safeHTML = (str) => str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');

    const safeName = safeHTML(name);
    const safePhone = safeHTML(phone);

    // Красивая разметка сообщения для Telegram
    const message = `<b>🔥 Новая заявка с сайта!</b>\n\n` +
                    `<b>👤 Имя:</b> ${safeName}\n` +
                    `<b>📞 Контакт:</b> ${safePhone}`;

    const telegramUrl = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;

    try {
        const response = await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message,
                parse_mode: 'HTML'
            })
        });

        if (response.ok) {
            return res.status(200).json({ success: true });
        } else {
            const errorData = await response.json();
            return res.status(500).json({ error: 'Telegram API вернул ошибку', details: errorData });
        }
    } catch (error) {
        return res.status(500).json({ error: 'Не удалось отправить запрос в Telegram', message: error.message });
    }
}