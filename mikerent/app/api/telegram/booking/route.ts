import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  console.log('🚀 Telegram Booking API Called');
  
  try {
    // 1. Получаем данные
    const bookingData = await request.json();
    console.log('📦 Получены данные:', {
      phone: bookingData.phone,
      apartment: bookingData.apartmentTitle,
      price: bookingData.totalPrice
    });

    // 2. Получаем конфигурацию
    const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;
    
    console.log('🔐 Конфигурация:', {
      hasToken: !!TELEGRAM_BOT_TOKEN,
      hasChatId: !!TELEGRAM_CHAT_ID,
      chatId: TELEGRAM_CHAT_ID
    });

    // 3. Проверяем конфигурацию
    if (!TELEGRAM_BOT_TOKEN) {
      console.error('❌ Нет токена бота');
      return NextResponse.json(
        { 
          success: false,
          error: 'Токен бота не настроен. Проверьте .env.local'
        },
        { status: 500 }
      );
    }

    if (!TELEGRAM_CHAT_ID) {
      console.error('❌ Нет chat_id');
      return NextResponse.json(
        { 
          success: false,
          error: 'Chat ID не настроен. Проверьте .env.local'
        },
        { status: 500 }
      );
    }

    // 4. Формируем ПРОСТОЕ сообщение (без Markdown и кнопок)
    const message = `
📞 НОВА ЗАЯВКА НА БРОНЮВАННЯ

🏢 Апартаменти: ${bookingData.apartmentTitle}
📋 ID бронювання: ${bookingData.bookingId}

📱 Телефон: ${bookingData.phone}
💬 Коментар: ${bookingData.comment || "Без коментаря"}

📅 Дати:
Заїзд: ${bookingData.checkIn}
Виїзд: ${bookingData.checkOut}
Ночей: ${bookingData.nights || "1"}

👥 Гостей: ${bookingData.guests}

💰 Сума: ${bookingData.totalPrice} ₴

⏰ Час: ${new Date().toLocaleString('uk-UA')}
    `.trim();

    console.log('📝 Сообщение (длина:', message.length, '):', message);

    // 5. Отправляем в Telegram (УПРОЩЕННАЯ версия)
    const telegramUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
    
    console.log('🔄 Отправляем запрос на:', telegramUrl.replace(TELEGRAM_BOT_TOKEN, 'TOKEN_HIDDEN'));
    
    const response = await fetch(telegramUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text: message
        // Без parse_mode, без reply_markup - максимально просто!
      }),
    });

    const data = await response.json();
    console.log('📨 Ответ от Telegram:', data);

    // 6. Обрабатываем ответ
    if (!response.ok) {
      console.error('❌ Telegram API error:', {
        status: response.status,
        description: data.description,
        error_code: data.error_code
      });
      
      throw new Error(`Telegram: ${data.description || 'Неизвестная ошибка'}`);
    }

    // 7. Успех!
    console.log('✅ Сообщение успешно отправлено! ID:', data.result?.message_id);
    
    return NextResponse.json({ 
      success: true, 
      bookingId: bookingData.bookingId,
      message: "✅ Заявка успішно відправлена в Telegram",
      telegramMessageId: data.result?.message_id,
      debug: {
        chatId: TELEGRAM_CHAT_ID,
        messageLength: message.length
      }
    });
    
  } catch (error: any) {
    console.error('💥 Ошибка в API:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: error.message || 'Не вдалося відправити заявку',
        suggestion: 'Попробуйте позвонить нам напрямую'
      },
      { status: 500 }
    );
  }
}