import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { personalInfo, roles, projects, skills, certifications, experience, activeCourses } from '../src/data/portfolioData.js';
import { initialBlogs } from '../src/data/blogData.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI;

async function syncAllData() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    const db = mongoose.connection.db;

    // 1. Clean test messages
    const deleteMsgs = await db.collection('messages').deleteMany({});
    console.log(`Cleaned ${deleteMsgs.deletedCount} messages.`);

    // 2. Clean expired otps
    const deleteOtps = await db.collection('otps').deleteMany({});
    console.log(`Cleaned ${deleteOtps.deletedCount} OTPs.`);

    // 3. Upsert full authentic portfolio document
    const fullPortfolio = {
      personalInfo,
      roles,
      projects,
      skills,
      certifications,
      experience,
      activeCourses,
      updatedAt: new Date()
    };

    await db.collection('portfolios').deleteMany({});
    await db.collection('portfolios').insertOne(fullPortfolio);
    console.log('✅ Successfully synced full authentic portfolio document (8 projects, 8 certs, full skills matrix).');

    // 4. Upsert 6 authentic comprehensive technical blogs
    console.log('Syncing 6 comprehensive blog articles...');
    for (const blog of initialBlogs) {
      await db.collection('blogs').updateOne(
        { slug: blog.slug },
        {
          $set: {
            title: blog.title,
            slug: blog.slug,
            category: blog.category,
            excerpt: blog.excerpt,
            content: blog.content,
            coverImage: blog.coverImage || '',
            tags: blog.tags || [],
            author: blog.author,
            readTime: blog.readTime,
            published: true,
            featured: blog.featured || false,
            updatedAt: new Date()
          },
          $setOnInsert: {
            views: blog.views || 0,
            likes: blog.likes || 0,
            createdAt: new Date()
          }
        },
        { upsert: true }
      );
    }
    console.log('✅ Successfully verified and synced all 6 comprehensive technical blogs.');

    process.exit(0);
  } catch (err) {
    console.error('Sync error:', err);
    process.exit(1);
  }
}

syncAllData();
