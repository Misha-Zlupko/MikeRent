export async function GET() {
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    console.log('Токен:', TELEGRAM_BOT_TOKEN ? `Есть (${TELEGRAM_BOT_TOKEN.length} символов)` : 'Нет');
    console.log('Chat ID:', TELEGRAM_CHAT_ID || 'Нет');
    
    if (!TELEGRAM_BOT_TOKEN || !TELEGRAM_CHAT_ID) {
      return Response.json({
        error: 'Не настроены переменные окружения',
        token: TELEGRAM_BOT_TOKEN ? 'Есть' : 'Нет',
        chatId: TELEGRAM_CHAT_ID ? 'Есть' : 'Нет'
      }, { status: 500 });
    }
    
    try {
      // Пробуем отправить простое сообщение
      const message = '✅ Тестовое сообщение от бота mikerent_bot';
      
      const response = await fetch(
        `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: TELEGRAM_CHAT_ID,
            text: message
          })
        }
      );
      
      const data = await response.json();
      
      console.log('Ответ Telegram:', data);
      
      return Response.json({
        success: data.ok,
        message: data.ok ? 'Сообщение отправлено!' : 'Ошибка отправки',
        telegramResponse: data
      });
      
    } catch (error: any) {
      console.error('Ошибка:', error);
      return Response.json({
        error: error.message,
        stack: error.stack
      }, { status: 500 });
    }
  }