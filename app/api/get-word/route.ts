import OpenAI from 'openai';
import { NextResponse } from 'next/server';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function GET() {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a helpful assistant that provides single, random English words." },
        { role: "user", content: "Give me a random English word." }
      ],
      max_tokens: 10,
    });

    const word = completion.choices[0].message.content?.trim();

    if (!word) {
      throw new Error('No word generated');
    }

    return NextResponse.json({ word });
  } catch (error) {
    console.error('Error generating word:', error);
    return NextResponse.json({ error: 'Failed to generate word' }, { status: 500 });
  }
}

