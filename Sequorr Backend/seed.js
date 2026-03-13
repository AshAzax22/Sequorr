require('dotenv').config();
const mongoose = require('mongoose');
const Waitlist = require('./src/models/Waitlist');
const { Blog } = require('./src/models/Blog');
const Tag = require('./src/models/Tag');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/sequorr';

const seedData = async () => {
  try {
    console.log(`📡 Connecting to MongoDB at ${MONGODB_URI}...`);
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected.');

    console.log('🧹 Clearing existing collections...');
    await Waitlist.deleteMany({});
    await Blog.deleteMany({});
    await Tag.deleteMany({});

    console.log('🌱 Seeding Waitlist entries...');
    const descriptions = [
      "Just Starting out",
      "staying consistent",
      "Training seriously",
      "moving for fun"
    ];
    const moveTimes = [
      "morning",
      "noon",
      "evening"
    ];

    const waitlistEntries = [];
    for (let i = 1; i <= 25; i++) {
        const date = new Date();
        date.setDate(date.getDate() - Math.floor(Math.random() * 60)); // Random date in last 60 days
        
        waitlistEntries.push({
            email: `runner_${i}_${Math.random().toString(36).substring(7)}@example.com`,
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            usualMoveTime: moveTimes[Math.floor(Math.random() * moveTimes.length)],
            createdAt: date,
            updatedAt: date
        });
    }
    await Waitlist.insertMany(waitlistEntries);
    console.log(`✅ Seeded ${waitlistEntries.length} Waitlist entries.`);

    console.log('🌱 Seeding Tags...');
    const defaultTags = [
      { name: "cardio" },
      { name: "strength" },
      { name: "flexibility" },
      { name: "nutrition" },
      { name: "motivation" },
      { name: "real-life-fitness" },
      { name: "recovery" }
    ];
    await Tag.insertMany(defaultTags);
    console.log(`✅ Seeded ${defaultTags.length} Tags.`);

    console.log('🌱 Seeding Blog posts...');
    const blogs = [
        {
            title: "5 Essential Tips for Your First Marathon",
            slug: "5-essential-tips-first-marathon",
            published: true,
            tags: ["cardio", "motivation"],
            sections: [
                {
                    subHeading: "Building Base Mileage",
                    content: "The most important part of marathon training is consistently increasing your weekly mileage. Start slow and add no more than 10% volume per week to avoid injury."
                },
                {
                    subHeading: "Nutrition is Key",
                    content: "You cannot out-train a bad diet. Focus on complex carbohydrates in the days leading up to your long runs, and practice your race-day fueling strategy during training."
                }
            ],
            readCount: 145,
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Understanding Zone 2 Heart Rate Training",
            slug: "understanding-zone-2-heart-rate-training",
            published: true,
            tags: ["cardio", "real-life-fitness"],
            sections: [
                {
                    subHeading: "What is Zone 2?",
                    content: "Zone 2 training involves exercising at an intensity where your body primarily uses fat for fuel instead of carbohydrates. It typically corresponds to 60-70% of your maximum heart rate."
                },
                {
                    subHeading: "The Benefits of Going Slow",
                    content: "By spending 80% of your training time in Zone 2, you build a massive aerobic engine. This base allows you to sustain faster paces for longer durations when it matters."
                }
            ],
            readCount: 382,
            createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000)
        },
        {
            title: "Draft: Upcoming App Features Announcement",
            slug: "draft-upcoming-app-features-announcement",
            published: false,
            tags: ["motivation"],
            sections: [
                {
                    subHeading: "New Race Finder Interface",
                    content: "We are radically redesigning how you search for local races. The new interface will support deep filtering by terrain type and elevation gain."
                }
            ],
            readCount: 0,
            createdAt: new Date()
        },
        {
            title: "The Ultimate Guide to Triathlon Transitions",
            slug: "ultimate-guide-triathlon-transitions",
            published: true,
            tags: ["cardio", "real-life-fitness", "motivation"],
            sections: [
                {
                    subHeading: "T1: Swim to Bike",
                    content: "Efficiency in T1 starts in the water. Begin mentally preparing for the transition during your final 100 meters of the swim. Practice running with your bike shoes attached to the pedals."
                },
                {
                    subHeading: "T2: Bike to Run",
                    content: "Your legs will feel like lead. The key to T2 is a quick shoe swap and immediately settling into a high cadence with a shorter stride until your legs adjust."
                }
            ],
            readCount: 89,
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
    ];

    // Mongoose middleware for pre('save') calculates averageReadTime, but insertMany bypasses it.
    // So we calculate a rough read time manually for the seed or use create()
    let seededBlogsCount = 0;
    for (const blog of blogs) {
        // Calculate rough read time (1 min per 200 words)
        const totalWords = blog.sections.reduce((count, sec) => count + sec.content.split(' ').length, 0);
        const calcTime = Math.max(1, Math.ceil(totalWords / 200));
        blog.averageReadTime = calcTime;
        
        await Blog.create(blog);
        seededBlogsCount++;
    }
    
    console.log(`✅ Seeded ${seededBlogsCount} Blog posts.`);

    console.log('\n🎉 Database seeding completed successfully!');
    process.exit(0);

  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  }
};

seedData();
