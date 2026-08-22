import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function inspectPortfolio() {
  try {
    await mongoose.connect(MONGODB_URI);
    const db = mongoose.connection.db;
    const portfolioDoc = await db.collection('portfolios').findOne();
    console.log('Portfolio Name:', portfolioDoc?.personalInfo?.name);
    console.log('Portfolio Email:', portfolioDoc?.personalInfo?.email);
    console.log('Projects count:', portfolioDoc?.projects?.length);
    console.log('Projects titles:', portfolioDoc?.projects?.map(p => p.title));
    console.log('Certifications count:', portfolioDoc?.certifications?.length);
    console.log('Certifications titles:', portfolioDoc?.certifications?.map(c => c.title));
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

inspectPortfolio();
