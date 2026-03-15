const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Blog } = require('../src/models/Blog');
const Tag = require('../src/models/Tag');
const Waitlist = require('../src/models/Waitlist');

dotenv.config({ path: path.join(__dirname, '../.env') });

async function cleanup() {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    // 1. Empty Waitlist
    console.log('🧹 Emptying Waitlist data...');
    const waitlistResult = await Waitlist.deleteMany({});
    console.log(`   - Deleted ${waitlistResult.deletedCount} waitlist entries.`);

    // 2. Identify Idle Tags
    console.log('🔍 Checking for idle tags...');
    
    // Get all unique tags from Blogs
    const blogs = await Blog.find({}, 'tags');
    const usedTags = new Set();
    blogs.forEach(blog => {
      if (blog.tags && Array.isArray(blog.tags)) {
        blog.tags.forEach(tag => usedTags.add(tag));
      }
    });
    
    console.log(`   - Found ${usedTags.size} unique tags currently in use by blogs.`);

    // Find all tags in Tag collection
    const allTags = await Tag.find({});
    let idleCount = 0;

    for (const tag of allTags) {
      if (!usedTags.has(tag.name)) {
        console.log(`   - Removing idle tag: "${tag.name}"`);
        await Tag.deleteOne({ _id: tag._id });
        idleCount++;
      }
    }

    console.log(`✅ Cleanup complete! Removed ${idleCount} idle tags.`);
    process.exit(0);
  } catch (error) {
    console.error('❌ Cleanup failed:', error);
    process.exit(1);
  }
}

cleanup();
