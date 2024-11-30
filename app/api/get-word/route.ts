import { MongoClient } from 'mongodb';
import { NextResponse } from 'next/server';

const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri);

export async function GET() {
  try {
    await client.connect();
    const database = client.db('vowel_learner');
    const words = database.collection('words');

    const randomWord = await words.aggregate([{ $sample: { size: 1 } }]).toArray();

    if (randomWord.length === 0) {
      throw new Error('No word found');
    }

    return NextResponse.json({ word: randomWord[0].word });
  } catch (error) {
    console.error('Error fetching word:', error);
    return NextResponse.json({ error: 'Failed to fetch word' }, { status: 500 });
  } finally {
    await client.close();
  }
}

