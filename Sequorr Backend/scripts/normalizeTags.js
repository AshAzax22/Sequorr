const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Blog } = require('../src/models/Blog');
const Tag = require('../src/models/Tag');

dotenv.config({ path: path.join(__dirname, '../.env') });

const normalizeTagName = (name) => {
  return name
    .trim()
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

const run = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    // 1. Normalize Tag Collection
    console.log('🔄 Normalizing Tag collection...');
    const tags = await Tag.find({});
    for (const tag of tags) {
      const normalizedName = normalizeTagName(tag.name);
      if (tag.name !== normalizedName) {
        // Check if a tag with the normalized name already exists
        const existingNormalized = await Tag.findOne({ name: normalizedName, _id: { $ne: tag._id } });
        
        if (existingNormalized) {
          console.log(`   - Merging duplicate tag: "${tag.name}" -> "${normalizedName}"`);
          // We'll delete this one and later update all blogs that used it (handled by the name-based update in step 2)
          await Tag.deleteOne({ _id: tag._id });
        } else {
          console.log(`   - Updating: "${tag.name}" -> "${normalizedName}"`);
          tag.name = normalizedName;
          // Re-generate slug
          tag.slug = normalizedName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          await tag.save();
        }
      }
    }

    // 2. Normalize Blog Tags
    console.log('🔄 Normalizing tags in Blog documents...');
    const blogs = await Blog.find({});
    for (const blog of blogs) {
      let changed = false;
      const normalizedTags = blog.tags.map(tag => {
        const norm = normalizeTagName(tag);
        if (tag !== norm) changed = true;
        return norm;
      });

      if (changed) {
        // Use Set to remove any duplicates created by normalization
        blog.tags = [...new Set(normalizedTags)];
        console.log(`   - Normalized tags for blog: "${blog.title}"`);
        await blog.save();
      }
    }

    console.log('✅ Normalization complete!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Error during normalization:', err);
    process.exit(1);
  }
};

run();
