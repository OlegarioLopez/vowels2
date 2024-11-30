require('dotenv').config({ path: '.env.local' });
const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

const uri = process.env.MONGODB_URI;

if (!uri) {
  console.error('MONGODB_URI is not set in the environment variables');
  process.exit(1);
}

async function seedDatabase() {
  const client = new MongoClient(uri);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const database = client.db('vowel_learner');
    const words = database.collection('words');

    // Read words from the file
    const filePath = path.join(process.cwd(), 'words', 'words.txt');
    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const wordList = fileContent.split('\n').filter(word => word.trim() !== '');

    // Insert words into the database
    const result = await words.insertMany(wordList.map(word => ({ word: word.trim() })));
    console.log(`${result.insertedCount} words inserted into the database`);
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase().catch(console.error);

