import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    message: 'Debug API is working',
    timestamp: new Date().toISOString(),
    env: {
      node: process.env.NODE_ENV,
      hasTelegramToken: !!process.env.TELEGRAM_BOT_TOKEN,
      hasTelegramChatId: !!process.env.TELEGRAM_CHAT_ID,
    }
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    return NextResponse.json({
      success: true,
      message: 'Debug POST received',
      data: body,
      serverTime: new Date().toISOString()
    });
  } catch (error) {
    return NextResponse.json({
      error: 'Parse error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 400 });
  }
}