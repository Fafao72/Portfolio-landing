document.getElementById('telegramForm').addEventListener('submit', async function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value;
    const phone = document.getElementById('phone').value;
    const statusDiv = document.getElementById('statusMessage');

    // Базовый сброс стилей статуса
    statusDiv.classList.remove('hidden', 'text-red-400', 'text-green-400');
    statusDiv.textContent = 'Отправка...';

    try {
        // Делаем запрос к нашей собственной серверной функции
        const response = await fetch('/api/send-telegram', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, phone })
        });

        const data = await response.json();

        if (response.ok && data.success) {
            statusDiv.textContent = '✅ Заявка успешно отправлена! Скоро свяжемся.';
            statusDiv.classList.add('text-green-400');
            document.getElementById('telegramForm').reset();
        } else {
            throw new Error(data.error || 'Произошла непредвиденная ошибка');
        }
    } catch (error) {
        statusDiv.textContent = `❌ Ошибка: ${error.message}`;
        statusDiv.classList.add('text-red-400');
    }
});