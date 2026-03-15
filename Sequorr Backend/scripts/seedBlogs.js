const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const { Blog } = require('../src/models/Blog');
const Tag = require('../src/models/Tag');

dotenv.config({ path: path.join(__dirname, '../.env') });

const blogs = [
  {
    title: "10 Simple Fitness Tips for Beginners That Actually Work",
    description: "Starting a fitness journey can feel confusing. There’s too much advice online — strict diets, intense workout plans, complicated routines. For beginners, this overload often leads to doing nothing at all. The truth is, fitness doesn’t need to be extreme. It needs to be consistent, realistic, and sustainable. If you focus on the basics and build slowly, results will follow naturally. Here are simple fitness tips that actually work — especially if you’re just getting started.",
    tags: ["Fitness Tips", "Healthy Lifestyle", "Beginner Workout"],
    published: false,
    sections: [
      { subHeading: "1. Start Smaller Than You Think You Should", content: "Most beginners try to change everything at once. They plan daily workouts, cut out entire food groups, and expect instant results. This usually leads to burnout. Instead, begin with manageable steps. Three workouts a week is enough. Even 20–30 minutes of movement can create momentum. Fitness becomes sustainable when it fits your life, not when it overwhelms it." },
      { subHeading: "2. Focus on Consistency Over Intensity", content: "Doing moderate workouts regularly is far more effective than doing extreme workouts occasionally. Your body responds to repeated effort over time. Consistency builds strength, endurance, and discipline. Intensity without consistency leads to exhaustion and quitting." },
      { subHeading: "3. Don’t Ignore Rest Days", content: "Rest is not laziness. It is part of progress. Muscles recover and grow when you allow them time to repair. Beginners often feel guilty about taking days off, but proper recovery prevents injury and improves long-term results. A balanced routine always includes rest." },
      { subHeading: "4. Track Your Activity", content: "Many people underestimate how helpful tracking can be. When you log workouts, steps, or active minutes, you become more aware of your habits. Tracking helps you: Notice patterns, Stay accountable, See improvement over time, Avoid long breaks. Progress feels more motivating when it’s visible." },
      { subHeading: "5. Improve One Habit at a Time", content: "Instead of changing your entire lifestyle overnight, focus on one improvement. Drink more water. Walk daily. Add protein to meals. Sleep earlier. Small changes compound. Over months, these small habits create major transformation." },
      { subHeading: "6. Strength Training Is Important for Everyone", content: "You don’t need to lift heavy weights, but building muscle helps improve metabolism, posture, and overall strength. Even basic bodyweight exercises like squats, push-ups, and lunges can make a big difference when done consistently." },
      { subHeading: "7. Cardio Doesn’t Have to Be Extreme", content: "You don’t need intense cardio sessions to get healthier. Walking, cycling, or light jogging are effective ways to improve heart health and burn calories. Choose activities you enjoy. Enjoyment increases consistency." },
      { subHeading: "8. Sleep Affects Your Fitness More Than You Think", content: "Poor sleep affects energy, hunger levels, and recovery. If workouts feel harder than usual, lack of sleep might be the reason. Improving sleep can improve workout performance without changing anything else." },
      { subHeading: "9. Stop Comparing Your Progress to Others", content: "Everyone starts at a different level. Comparing your journey to someone further ahead often leads to discouragement. Focus on becoming slightly better than you were last week. Progress is personal." },
      { subHeading: "10. Make Fitness Part of Your Identity", content: "Instead of chasing quick results, aim to become someone who values movement and health. When fitness becomes part of who you are, consistency becomes easier. Results follow habits. Habits follow identity." },
      { subHeading: "Conclusion", content: "Fitness doesn’t require perfection. It requires repetition. Small, manageable actions done consistently will always outperform extreme efforts done temporarily. Start simple. Track your progress. Stay patient. Improvement will come." }
    ]
  },
  {
    title: "How to Create a Workout Routine You Can Actually Stick To",
    description: "Starting a workout routine is easy. Sticking to it for more than a few weeks is where most people struggle. Many beginners quit not because fitness is too hard, but because their routine is unrealistic, confusing, or disconnected from their lifestyle. A good workout routine should feel manageable, repeatable, and flexible — not overwhelming.",
    tags: ["Workout Routine", "Beginner Fitness", "Gym Tips"],
    published: false,
    sections: [
      { subHeading: "Why Most Workout Routines Fail", content: "Most beginners follow routines that are too intense or too complicated. Online workouts often promise fast results, but they don’t account for personal schedules, energy levels, or recovery needs. When workouts feel like pressure instead of progress, consistency breaks down. Missed days turn into guilt, and guilt turns into quitting." },
      { subHeading: "What a Beginner-Friendly Workout Routine Looks Like", content: "A sustainable routine focuses on showing up regularly, not doing everything perfectly. Instead of training every day, beginners benefit more from 3–4 consistent sessions per week. The goal is to build a habit first. Strength, endurance, and visible results come later when consistency is established." },
      { subHeading: "How Long Your Workouts Should Be", content: "One of the biggest mistakes beginners make is assuming longer workouts are better. In reality, shorter workouts done consistently produce better results than long sessions done occasionally. For most beginners, 30–45 minutes is enough to: Build strength, Improve fitness, Avoid burnout. Keeping workouts shorter also makes them easier to fit into daily life." },
      { subHeading: "Why Tracking Your Workouts Makes a Difference", content: "Tracking workouts helps beginners stay aware of their progress. When you can see how often you’re training, what exercises you’re doing, and how consistent you’ve been, motivation feels more natural. Tracking removes guesswork and makes progress feel real — even before physical changes are visible." },
      { subHeading: "How Community Helps Beginners Stay Consistent", content: "Fitness becomes easier when you know others are on the same path. Seeing people start small, miss days, and still continue makes the journey feel normal. Community support turns fitness from a solo challenge into a shared experience, which is especially important in the early stages." },
      { subHeading: "Conclusion", content: "The best workout routine is not the hardest one — it’s the one you can repeat week after week. Start small, stay consistent, and let progress build naturally over time." }
    ]
  },
  {
    title: "How to Lose Weight Without Going to the Gym (Beginner’s Guide)",
    description: "Not everyone wants a gym membership. Some people feel intimidated. Others don’t have time. And many beginners simply don’t know where to start. The good news is this: weight loss does not require a gym. What it requires is consistency, awareness, and small daily habits that compound over time. If you understand the basics and track your progress properly, you can lose weight effectively from home.",
    tags: ["weight loss", "home workout", "healthy habits"],
    published: false,
    sections: [
      { subHeading: "Understanding How Weight Loss Actually Works", content: "Before workouts, before diets, before trends — weight loss comes down to one principle: burning more energy than you consume over time. This doesn’t mean starving yourself. It means becoming more aware of your daily habits. Many beginners fail because they try extreme methods instead of sustainable ones." },
      { subHeading: "Why Most Home Weight Loss Attempts Fail", content: "Many people start strong but quit within weeks. The common reasons include lack of structure, unrealistic expectations, and no visible progress tracking. At home, there’s no trainer, no accountability, and no environment pushing you. That’s why building a system matters more than motivation." },
      { subHeading: "Simple Ways to Lose Weight at Home", content: "You don’t need complex routines. You need consistency in movement and awareness in eating. Start with daily movement: Brisk walking, Bodyweight exercises, Short home workouts, Increasing daily step count. Even increasing your daily activity level gradually can create meaningful change over time." },
      { subHeading: "Dietary Focus", content: "Instead of overcomplicating diet plans, focus on: Eating regular meals, Reducing processed snacks, Drinking enough water, Avoiding extreme calorie cuts. Sustainable changes outperform extreme ones every time." },
      { subHeading: "Why Tracking Makes Weight Loss Easier", content: "Tracking daily activity, steps, or workouts gives you clarity. When you can see your weekly movement levels, you stop guessing whether you're “doing enough.” Tracking helps you: Notice inactive days, Stay consistent even on low-energy days, Celebrate small progress, Avoid long gaps in activity. Data builds discipline." },
      { subHeading: "The Role of Community in Staying Motivated", content: "Losing weight alone can feel isolating. A supportive community normalizes slow progress and removes the pressure of perfection. Seeing others: Start from zero, Improve gradually, Share struggles honestly, makes the journey feel realistic and achievable. When progress feels shared, quitting feels harder." },
      { subHeading: "Conclusion", content: "You don’t need a gym to lose weight. You need a clear system, consistent movement, and awareness of your habits. Small improvements done daily will outperform intense short-term efforts. Start simple, track your activity, and focus on progress — not perfection." }
    ]
  },
  {
    title: "How to Start Your Fitness Journey (A Simple Guide for Beginners)",
    description: "Starting a fitness journey can feel overwhelming, especially when you see intense workout plans and strict diets online. Many people want to get fitter but don’t know where to begin or worry about doing things wrong. The truth is, starting fitness doesn’t require perfection or extreme effort. It requires clarity, patience, and small steps that you can maintain over time.",
    tags: ["fitness", "long-term", "healthy habits", "beginner fitness"],
    published: false,
    sections: [
      { subHeading: "Understand Your Reason for Starting", content: "Before choosing workouts or meal plans, it’s important to understand why you want to start. Some people want more energy, others want weight loss, strength, or better mental health. Having a clear reason helps you stay focused when motivation drops. Your goal doesn’t need to be dramatic — it just needs to matter to you." },
      { subHeading: "Start With Simple Movement", content: "You don’t need a complicated routine on day one. Begin with activities that feel natural and manageable. Walking, light stretching, or short home workouts are enough to start building momentum. The aim is not to exhaust yourself, but to create a habit of moving regularly. Once movement becomes part of your routine, intensity can increase naturally." },
      { subHeading: "Create a Realistic Workout Schedule", content: "Many beginners fail because they plan workouts that don’t fit their lifestyle. A realistic schedule is one you can follow even on busy weeks. Training three times a week is a good starting point. Consistency matters far more than frequency in the early stages." },
      { subHeading: "Focus on Progress, Not Perfection", content: "It’s normal to miss workouts or feel low on energy some days. Progress isn’t about being perfect — it’s about continuing even after setbacks. Tracking your workouts or activity can help you stay aware of how often you’re moving, which builds confidence and keeps you engaged." },
      { subHeading: "Pay Attention to Recovery and Rest", content: "Rest is essential, especially for beginners. Your body needs time to adapt to new activity levels. Ignoring recovery often leads to soreness, fatigue, or injury. Listening to your body and allowing rest days helps you stay consistent long-term." },
      { subHeading: "Build Healthy Habits Outside Workouts", content: "Fitness isn’t just about exercise. Sleep, hydration, and daily movement play a big role in how you feel and perform. Improving one habit at a time — such as drinking more water or sleeping earlier — supports your fitness journey without adding pressure." },
      { subHeading: "Stay Patient With Your Results", content: "Results take time, and that’s normal. Physical changes often come after weeks of consistency, not days. Focusing on how you feel — better energy, improved mood, stronger body — helps you stay motivated. Fitness is a long-term commitment, not a short challenge." },
      { subHeading: "Conclusion", content: "Starting your fitness journey doesn’t require extreme discipline or complex plans. It requires small, consistent actions that fit your life. Begin with simple movement, stay patient, and focus on building habits you can maintain. Over time, those habits will transform your health and confidence." }
    ]
  },
  {
    title: "How to get an Hourglass figure in 3 weeks",
    description: "The hourglass figure is one of the most searched body goals online. Many women want a smaller waist with more defined hips and glutes, but there’s a lot of confusion about what actually works. The truth is, you cannot “reshape” your bones — but you can build muscle strategically and reduce body fat in a way that enhances natural curves. With the right combination of strength training, fat management, and consistency, visible changes are absolutely possible.",
    tags: ["hourglass figure", "body shaping", "home workout"],
    published: false,
    sections: [
      { subHeading: "What Creates an Hourglass Shape?", content: "An hourglass appearance usually comes from two main factors: a defined waist and developed lower-body muscles. This means focusing on: Reducing overall body fat (if needed), Building glutes and hips, Strengthening core muscles. Many people waste time doing only waist exercises, expecting fat to disappear from one area. Fat loss does not work that way. Instead, shaping comes from overall body fat reduction combined with muscle building in specific areas." },
      { subHeading: "Best Workouts for an Hourglass Figure", content: "If your goal is to enhance curves, lower-body strength training is essential. Glute-focused exercises help create width at the hips, while core exercises help define the waist. Effective exercises include: Squats and sumo squats, Hip thrusts and glute bridges, Bulgarian split squats, Side leg raises, Plank variations. Training your lower body 2–3 times per week can gradually improve muscle tone and shape. Consistency matters more than intensity." },
      { subHeading: "How to Reduce Waist Fat Safely", content: "Many women search for “how to lose waist fat fast,” but quick fixes rarely last. Waist definition improves when overall body fat decreases through sustainable habits. Focus on: Regular strength training, Moderate cardio (walking, cycling, etc.), Balanced meals with enough protein, Avoiding extreme crash diets. When fat reduces gradually, muscle definition becomes more visible." },
      { subHeading: "Should You Do Waist Trainers or Extreme Diets?", content: "Waist trainers and extreme calorie cutting may create temporary visual changes, but they do not create lasting results. In some cases, they can even slow metabolism or cause discomfort. Real transformation comes from: Strength training, Consistent movement, Patience. There are no shortcuts that replace structure." },
      { subHeading: "Why Tracking Your Workouts Matters", content: "When working toward a body goal, tracking helps you stay realistic. Visible changes take time, often weeks or months. Logging workouts, measuring consistency, and seeing your weekly effort prevents discouragement. When progress feels slow, data reminds you that you are still moving forward." },
      { subHeading: "Conclusion", content: "Getting an hourglass figure naturally is not about extreme methods. It’s about building muscle strategically, reducing body fat gradually, and staying consistent. With the right balance of training and patience, your natural shape can become more defined over time." }
    ]
  },
  {
    title: "How to Lose Belly Fat Naturally",
    description: "Belly fat is one of the most frustrating areas to lose. Many people try endless sit-ups, strict diets, or “quick fat-burning workouts,” only to feel disappointed when nothing changes. The truth is simple: you cannot spot-reduce belly fat. You lose belly fat the same way you lose fat anywhere else — by reducing overall body fat consistently over time. Once you understand this, your approach becomes clearer and far more effective.",
    tags: ["Belly Fat", "Weight Loss", "Fat Loss Tips"],
    published: false,
    sections: [
      { subHeading: "Why Belly Fat Is So Hard to Lose", content: "The stomach area tends to store fat due to a mix of lifestyle habits, stress, sleep quality, and overall calorie balance. For many people, it’s also the last place fat reduces. This leads to frustration. You might feel stronger, lighter, or more active, but your stomach doesn’t seem to change immediately. Fat loss is gradual. Visible changes in the belly usually appear after consistent full-body fat reduction — not from targeting the stomach alone." },
      { subHeading: "The Biggest Mistake: Doing Only Ab Exercises", content: "Crunches and sit-ups strengthen your core muscles, but they do not directly burn belly fat. You can have strong abs hidden under body fat. To reveal them, you need: Full-body strength training, Regular movement (like walking or cardio), Sustainable eating habits. Ab workouts help with muscle definition, but overall fat loss reveals the results." },
      { subHeading: "Focus on Strength Training First", content: "Strength training increases muscle mass, which helps improve metabolism over time. It also shapes your body while fat decreases. Effective exercises include: Squats, Deadlifts, Push-ups, Lunges, Planks. Training 3–4 times per week is enough for most beginners. Consistency matters more than intensity." },
      { subHeading: "Increase Daily Movement", content: "Many people underestimate how powerful simple movement can be. Increasing your daily step count, walking more, and staying active throughout the day helps create a calorie deficit without extreme dieting. Small increases in daily activity often make a bigger difference than occasional intense workouts." },
      { subHeading: "Pay Attention to Eating Habits", content: "You don’t need a crash diet to lose belly fat. In fact, extreme calorie cuts usually lead to rebound weight gain. Instead focus on: Eating balanced meals, Including protein in each meal, Reducing ultra-processed snacks, Drinking enough water. Sustainable eating beats short-term restriction every time." },
      { subHeading: "Sleep and Stress Matter More Than You Think", content: "Poor sleep and high stress levels can make fat loss harder. Lack of rest affects hunger hormones and recovery, which can slow progress. Improving sleep quality and managing stress supports your workouts and makes fat loss more efficient." },
      { subHeading: "Why Tracking Helps With Fat Loss", content: "Fat loss feels slow because changes happen gradually. Tracking workouts, steps, and consistency helps you stay motivated even when physical changes aren’t obvious yet. When you can see your effort increasing week after week, you’re less likely to quit." },
      { subHeading: "Conclusion", content: "Losing belly fat naturally isn’t about extreme diets or endless ab exercises. It’s about reducing overall body fat through consistent training, smart movement, and balanced habits. Stay patient. Stay consistent. Focus on full-body progress — your stomach will follow." }
    ]
  },
  {
    title: "Simple Healthy Diet Plan for Weight Loss",
    description: "When people think about dieting, they imagine strict restrictions, cutting out favorite foods, or following complicated meal plans. That’s why most diets fail — they feel impossible to maintain. A healthy diet for weight loss doesn’t need to be extreme. It needs to be balanced, realistic, and consistent. If you focus on simple structure instead of perfection, weight loss becomes much easier to manage.",
    tags: ["Healthy Diet", "Weight Loss Diet", "Nutrition Tips"],
    published: false,
    sections: [
      { subHeading: "How Weight Loss Through Diet Actually Works", content: "Weight loss happens when you consume slightly fewer calories than your body burns over time. But this doesn’t mean starving yourself. Crash dieting slows metabolism, increases cravings, and often leads to binge eating. A sustainable diet focuses on improving food quality while keeping meals satisfying. The goal isn’t eating less food — it’s eating smarter." },
      { subHeading: "Build Your Meals Around Protein", content: "Protein is one of the most important nutrients when trying to lose weight. It helps you feel full longer and supports muscle retention while you lose fat. Good protein sources include: Eggs, Chicken or fish, Greek yogurt, Lentils and beans, Tofu or paneer. Adding protein to each meal naturally reduces overeating without strict calorie counting." },
      { subHeading: "Don’t Remove Carbs Completely", content: "Many people think cutting carbs is the fastest way to lose weight. While reducing refined carbs can help, removing all carbohydrates is rarely sustainable. Instead of eliminating carbs, focus on better choices: Whole grains instead of white bread, Fruits instead of sugary snacks, Oats or brown rice instead of processed options. Balanced meals are easier to maintain long term." },
      { subHeading: "Control Portions Without Obsessing", content: "Portion control matters, but you don’t need to measure every gram of food. A simple approach is: Half your plate: vegetables, One quarter: protein, One quarter: carbs. This structure keeps meals balanced without making dieting stressful." },
      { subHeading: "Stay Hydrated Throughout the Day", content: "Sometimes hunger is actually dehydration. Drinking enough water helps control appetite and improves energy levels. Many people see improvements just by increasing water intake and reducing sugary drinks." },
      { subHeading: "Avoid Extreme Restrictions", content: "Completely banning certain foods often backfires. When you restrict too much, cravings become stronger and harder to control. Instead, allow flexibility. If you enjoy certain treats, include them in moderation. Sustainable diets include balance, not punishment." },
      { subHeading: "Why Tracking Food Intake Helps", content: "Tracking meals — even casually — increases awareness. When you log what you eat, patterns become visible. You may notice late-night snacking, emotional eating, or inconsistent meal timing. Awareness leads to better decisions without drastic rules." },
      { subHeading: "Conclusion", content: "A simple healthy diet plan for weight loss focuses on balance, not extremes. Prioritize protein, choose whole foods, stay hydrated, and maintain portion awareness. Consistency beats perfection. When your diet feels sustainable, results become sustainable too." }
    ]
  },
  {
    title: "Why Protein Is Important for Your Body and how much is the right amount",
    description: "Protein is one of the most talked-about nutrients in fitness and health, yet many people still don’t understand why it matters so much. Whether your goal is weight loss, muscle building, or simply staying healthy, protein plays a key role in how your body functions. If you often feel tired, struggle with hunger, or don’t see progress from workouts, low protein intake could be one of the reasons.",
    tags: ["Protein Diet", "Muscle Building", "Healthy Eating"],
    published: false,
    sections: [
      { subHeading: "What Is Protein and What Does It Do?", content: "Protein is a macronutrient made up of amino acids, which are the building blocks of your body. These amino acids help repair tissues, build muscles, support immune function, and maintain healthy skin, hair, and nails. Every time you move, exercise, or even go through daily activities, your body relies on protein to repair and rebuild itself." },
      { subHeading: "Why Protein Is Important for Weight Loss", content: "Protein helps with weight loss by increasing fullness and reducing cravings. When meals contain enough protein, you feel satisfied for longer, which naturally reduces overeating. It also helps preserve muscle while losing fat. This is important because losing muscle can slow down metabolism, making weight loss harder over time." },
      { subHeading: "Why Protein Matters for Muscle Building", content: "Muscle growth happens when muscle fibers are broken down during exercise and repaired afterward. Protein provides the raw material needed for this repair process. Without enough protein, workouts feel harder, recovery takes longer, and muscle growth slows down — even if you train regularly." },
      { subHeading: "How Much Protein Do You Really Need?", content: "Protein needs vary depending on activity level, body weight, and goals. Most active individuals benefit from higher protein intake than sedentary people. Instead of focusing on exact numbers, a practical approach is including a good protein source in every meal. This keeps intake consistent without complicated tracking." },
      { subHeading: "Best Sources of Protein", content: "Protein can come from both animal and plant-based foods. Choosing a variety helps ensure balanced nutrition. Common protein-rich foods include: Eggs, Chicken and fish, Dairy products like yogurt or paneer, Lentils, beans, and chickpeas, Tofu and soy products. The key is consistency, not perfection." },
      { subHeading: "Is Too Much Protein Bad for You?", content: "For most healthy people, high-protein diets are safe when paired with enough water and balanced meals. Problems usually arise when protein replaces fruits, vegetables, or carbohydrates entirely. A balanced diet that includes protein, carbs, and fats is always more sustainable than extremes." },
      { subHeading: "Why Tracking Protein Intake Can Help", content: "Many people underestimate how little protein they eat. Tracking meals for a few days can reveal gaps and help you adjust portions naturally. Once awareness improves, you often don’t need to track forever." },
      { subHeading: "Conclusion", content: "Protein is essential for health, strength, and long-term fitness results. Whether your goal is weight loss, muscle gain, or better energy levels, adequate protein intake makes everything easier. Focus on balanced meals, include protein consistently, and let progress build over time." }
    ]
  },
  {
    title: "How Many Calories Should You Burn in a Day?",
    description: "One of the most common fitness questions online is: “How many calories should I burn daily?” Some people believe they need to burn 1,000+ calories every day. Others think 200 is enough. The confusion usually comes from not understanding how calorie burn actually works. The truth is: you are already burning calories — even if you don’t exercise. What matters is how many extra calories you burn depending on your goal.",
    tags: ["Calorie Burn", "Weight Loss", "Daily Activity"],
    published: false,
    sections: [
      { subHeading: "First: You’re Always Burning Calories", content: "Your body burns calories 24/7 just to: Breathe, Pump blood, Digest food, Maintain body temperature. This is called your baseline calorie burn (or metabolism). For most adults, this is already between 1,500–2,200 calories per day, depending on body size, age, and gender. Exercise adds to this number — it doesn’t replace it." },
      { subHeading: "If Your Goal Is Weight Loss", content: "To lose weight, you generally need to burn slightly more calories than you consume. But that does NOT mean extreme cardio sessions daily. For most people, aiming to burn an extra 300–500 calories per day through activity is enough to create steady, sustainable fat loss. This could come from: A brisk 45-minute walk, A strength workout, Cycling or swimming, A mix of steps + workout. Consistency matters more than intensity." },
      { subHeading: "If Your Goal Is Muscle Gain", content: "If you’re trying to build muscle, your focus shouldn’t be burning maximum calories. In fact, burning too many calories can slow muscle growth. Instead, aim for: Moderate calorie burn, Strength-focused workouts, Recovery days. The goal is stimulus and recovery — not exhausting yourself daily." },
      { subHeading: "If Your Goal Is General Fitness", content: "For overall health and staying in shape, most people benefit from burning: 200–400 extra calories daily through movement. This supports heart health, stamina, and energy levels without overtraining. Even 8,000–10,000 steps per day can put you in this range depending on your body weight." },
      { subHeading: "Why Trying to Burn 1,000 Calories Daily Can Backfire", content: "Many people think “more sweat = more results.” But burning extremely high calories every day can lead to: Burnout, Increased hunger, Muscle loss, Fatigue, Higher injury risk. Sustainable fitness is about balance, not punishment." },
      { subHeading: "Factors That Change How Many Calories You Should Burn", content: "There is no universal number because it depends on: Your body weight, Age, Gender, Fitness level, Daily activity, Fitness goal. Heavier individuals naturally burn more calories during the same activity compared to lighter individuals." }
    ]
  },
  {
    title: "How Long Does It Take to Lose Weight?",
    description: "One of the most searched fitness questions is: “How long will it take to lose weight?” Whether someone wants to lose 3 kg, 5 kg, or 10 kg, the biggest frustration is not knowing what’s realistic. Social media shows dramatic transformations in 30 days, but real progress usually works differently. The honest answer? It depends — but there is a realistic timeline you can follow.",
    tags: ["Weight Loss", "Fat Loss", "Workout Plan"],
    published: false,
    sections: [
      { subHeading: "What Is Healthy Weight Loss Per Week?", content: "For most people, healthy fat loss happens at a rate of: 0.5 to 1 kg per week (Or about 0.5–1% of body weight per week). This may sound slow, but this pace: Preserves muscle, Reduces fatigue, Is easier to maintain, Lowers the risk of rebound weight gain. Fast weight loss often means water loss — not actual fat loss." },
      { subHeading: "How Long to Lose 5 kg?", content: "If you’re losing around 0.5–1 kg per week, 5 kg can realistically take 5–10 weeks. It may be slightly faster in the beginning because the body drops water weight first. But after that, progress becomes gradual — and that’s normal." },
      { subHeading: "Why Weight Loss Slows Down After a Few Weeks", content: "Many people panic when progress slows after the first 2–3 weeks. This happens because: Initial water weight drops quickly, The body adapts to new activity levels, Metabolism slightly adjusts. This doesn’t mean it stopped working. It means your body is adjusting. Consistency becomes more important than speed at this stage." },
      { subHeading: "What Affects How Fast You Lose Weight?", content: "Weight loss speed depends on: Starting weight, Activity level, Sleep quality, Stress levels, Workout consistency, Daily movement. People with more weight to lose may see faster early results. Leaner individuals usually lose weight more slowly." },
      { subHeading: "Why Rapid Weight Loss Isn’t Always Better", content: "Losing 3–4 kg in a week usually means water loss, glycogen depletion, and muscle breakdown. It often leads to: Extreme hunger, Low energy, Hormonal imbalance, Quick regain. Sustainable results beat fast results every time." },
      { subHeading: "Signs You’re Losing Fat (Even If the Scale Doesn’T Move)", content: "Sometimes the scale stays the same but fat loss is still happening. Look for: Clothes fitting looser, Improved muscle tone, Increased stamina, Reduced bloating, Better sleep. The scale is just one measurement." },
      { subHeading: "The Real Timeline Truth", content: "If your goal is long-term fat loss: 3 months = noticeable change, 6 months = major transformation, 1 year = lifestyle shift. The people who succeed aren’t the fastest — they’re the most consistent." },
      { subHeading: "Final Thought", content: "Instead of asking, “How fast can I lose weight?” Ask, “Can I maintain this routine for the next 3 months?” Because sustainable progress always wins." }
    ]
  },
  {
    title: "Realistic Timelines for Fitness Progress",
    description: "Starting a new fitness routine is exciting, but many people quickly begin to wonder when they will start seeing noticeable results. Whether the goal is weight loss, muscle gain, or improved endurance, understanding realistic timelines can help people stay motivated and committed to their workouts. The truth is that fitness results take time, consistency, and patience.",
    tags: ["Fitness Results", "Workout Progress", "Weight Loss", "Muscle Gain", "Fitness Motivation", "Beginner Fitness"],
    published: false,
    sections: [
      { subHeading: "Early Changes: The First Few Weeks", content: "During the first two to three weeks of regular exercise, most of the changes happen internally rather than visibly. The body begins adapting to increased physical activity, improving circulation, and strengthening the connection between muscles and the nervous system. Many people notice that they feel more energetic, sleep better, and experience improved mood during this early phase." },
      { subHeading: "Visible Changes: Around 4 to 8 Weeks", content: "For many individuals, visible changes start appearing after about four to eight weeks of consistent training. This may include slight muscle definition, improved posture, or gradual fat loss. However, results can vary depending on factors such as workout intensity, nutrition, sleep, and individual body composition." },
      { subHeading: "Significant Transformation: 3 to 6 Months", content: "Major physical changes typically take three to six months of consistent effort. By this time, the body has had enough time to build muscle, reduce body fat, and improve overall strength and endurance. This stage often brings the most noticeable transformation. Clothes may start fitting differently, strength levels increase, and overall confidence improves." },
      { subHeading: "Factors That Affect Fitness Results", content: "Several factors influence how quickly someone sees results from working out: Consistency: Regular workouts are essential for progress. Nutrition: A balanced diet supports muscle growth and fat loss. Sleep and recovery: The body repairs and builds muscle during rest. Workout intensity: Challenging workouts encourage the body to adapt and improve." },
      { subHeading: "Staying Motivated During the Process", content: "One of the biggest challenges in fitness is staying motivated when results are not immediately visible. Tracking small improvements such as increased strength, better endurance, or improved energy levels can help maintain motivation. Progress photos, workout logs, and measurable goals can also make it easier to see how far you have come." },
      { subHeading: "Conclusion", content: "Seeing results from working out takes time, but the benefits go far beyond physical appearance. Improved health, increased energy, and better mental well-being are all important outcomes of regular exercise. The key is to stay consistent, focus on long-term progress, and remember that lasting results are built through patience and dedication." }
    ]
  },
  {
    title: "How to Stay Fit with a Busy Schedule",
    description: "Many people believe that staying fit requires hours in the gym every day. However, for those with demanding jobs, studies, or family responsibilities, finding large blocks of time for exercise can be difficult. The good news is that maintaining fitness does not always require long workouts. With the right approach, it is possible to stay active even with a busy schedule.",
    tags: ["Busy Lifestyle", "Fitness Tips", "Healthy Habits", "Time Management", "Daily Exercise", "Lifestyle Fitness"],
    published: false,
    sections: [
      { subHeading: "Focus on Short but Effective Workouts", content: "Not every workout needs to last an hour. Short sessions of 20 to 30 minutes can still provide significant health benefits. Quick workouts such as bodyweight exercises, brisk walking, or short cardio sessions can help maintain fitness levels when done consistently. The key is to make the most of the time available rather than skipping exercise altogether." },
      { subHeading: "Make Physical Activity Part of Your Daily Routine", content: "One of the easiest ways to stay active is to include movement in everyday activities. Taking the stairs instead of the elevator, walking during phone calls, or doing light stretching during breaks can add more physical activity to the day. Small movements throughout the day can accumulate and contribute to overall fitness." },
      { subHeading: "Plan Workouts in Advance", content: "When schedules become busy, exercise is often the first thing people skip. Planning workouts in advance can help prevent this. Setting a specific time for exercise—just like any other appointment—can make it easier to stay consistent. Even scheduling three or four short workouts per week can make a difference." },
      { subHeading: "Prioritize Consistency Over Perfection", content: "Many people give up on fitness because they feel they cannot follow a perfect routine. In reality, consistency matters far more than perfection. Even small efforts, such as a quick workout or a short walk, can contribute to long-term health if done regularly." },
      { subHeading: "Use Weekends or Free Time Wisely", content: "If weekdays are extremely busy, weekends can be a good opportunity for longer workouts. Activities like cycling, hiking, or sports can make exercise feel more enjoyable while helping improve fitness. This approach allows people to stay active without feeling overwhelmed during the workweek." },
      { subHeading: "Conclusion", content: "A busy schedule does not have to prevent someone from staying fit. By focusing on shorter workouts, incorporating movement into daily activities, and maintaining consistency, it is possible to stay healthy even with limited time. Fitness is not about having unlimited free time—it is about making small, sustainable choices that support a healthy lifestyle." }
    ]
  },
  {
    title: "Why You’re Always Tired Even If You Exercise",
    description: "Exercise is often associated with increased energy and better health. However, some people feel constantly tired even when they maintain a regular workout routine. If you find yourself feeling exhausted despite exercising, there may be several factors affecting your energy levels. Understanding the reasons behind workout-related fatigue can help you adjust your routine and improve how your body responds to exercise.",
    tags: ["Fatigue", "Fitness Recovery", "Workout Mistakes", "Healthy Lifestyle", "Energy Levels", "Exercise Recovery"],
    published: false,
    sections: [
      { subHeading: "Not Getting Enough Sleep", content: "Sleep plays a crucial role in recovery. During sleep, the body repairs muscle tissue and restores energy levels. Without enough quality sleep, the body cannot fully recover from workouts. Adults generally need around seven to nine hours of sleep per night. Consistently getting less sleep can lead to fatigue, poor performance, and slower progress in fitness." },
      { subHeading: "Overtraining the Body", content: "Exercising too frequently without enough rest can lead to overtraining. This happens when the body does not have enough time to recover between workouts. Signs of overtraining may include constant tiredness, decreased performance, muscle soreness that lasts for several days, and lack of motivation to exercise." },
      { subHeading: "Poor Nutrition", content: "Food provides the fuel that the body needs for physical activity. If your diet lacks essential nutrients such as protein, healthy fats, and carbohydrates, your energy levels may drop. Balanced meals help support muscle recovery and maintain stable energy throughout the day." },
      { subHeading: "Dehydration", content: "Even mild dehydration can cause fatigue and reduced physical performance. When the body does not receive enough water, blood circulation and oxygen delivery to muscles can be affected. Drinking enough water before, during, and after exercise can help maintain proper energy levels." },
      { subHeading: "Workouts That Are Too Intense", content: "High-intensity workouts can be effective, but doing them too often can leave the body feeling drained. Mixing intense sessions with lighter activities such as walking, stretching, or yoga can help maintain balance. Variety in workouts also prevents burnout and supports long-term fitness." },
      { subHeading: "Conclusion", content: "Feeling tired while maintaining a workout routine can be frustrating, but it is often a sign that the body needs adjustments in rest, nutrition, or training intensity. Paying attention to recovery, sleep, hydration, and balanced exercise can help restore energy levels and make workouts more effective." }
    ]
  },
  {
    title: "10,000 Steps a Day: Does It Actually Work?",
    description: "Many people have heard about the goal of walking 10,000 steps per day. Fitness trackers and mobile apps often encourage users to reach this number daily. But where did this idea come from, and is it really necessary to walk 10,000 steps to stay healthy? Understanding the benefits of daily walking can help determine whether this popular target is the right goal for everyone.",
    tags: ["Walking", "Daily Steps", "Fitness Habits", "Healthy Lifestyle", "Weight Loss", "Beginner Fitness"],
    published: false,
    sections: [
      { subHeading: "Where the 10,000 Steps Idea Came From", content: "The concept of walking 10,000 steps a day became popular after a Japanese pedometer was introduced in the 1960s. The device was marketed with the goal of reaching 10,000 steps daily as a way to encourage people to stay active. Over time, the number became widely accepted as a general guideline for maintaining an active lifestyle." },
      { subHeading: "Benefits of Walking Daily", content: "Walking regularly can improve cardiovascular health, increase calorie expenditure, and support weight management. It also strengthens muscles in the legs and improves joint mobility. In addition to physical benefits, walking can help reduce stress and improve mental well-being. Many people find that a daily walk helps clear their mind and boosts overall mood." },
      { subHeading: "Is 10,000 Steps Necessary for Everyone?", content: "While 10,000 steps is a helpful target, it is not a strict requirement for good health. For people who are currently inactive, even increasing daily steps to 6,000 or 7,000 can provide significant health benefits. The most important factor is consistency. Regular movement throughout the day is more beneficial than remaining sedentary for long periods." },
      { subHeading: "Ways to Increase Daily Steps", content: "There are many simple ways to increase daily movement: Taking short walking breaks during work, Using stairs instead of elevators, Walking while talking on the phone, Parking slightly farther away from destinations, Taking evening walks after dinner. Small lifestyle changes can gradually help increase daily activity levels." },
      { subHeading: "Conclusion", content: "The goal of walking 10,000 steps per day can be a useful motivation for staying active. However, the exact number is less important than maintaining regular physical activity. Building the habit of moving more throughout the day can support both physical health and overall well-being." }
    ]
  },
  {
    title: "Simple Daily Habits That Keep People Fit",
    description: "Many people believe staying fit requires strict diets and intense workouts. In reality, small daily habits often play a major role in maintaining long-term health and fitness. These habits may seem simple, but when practiced consistently they can make a big difference.",
    tags: ["Healthy Habits", "Lifestyle Fitness", "Daily Routine", "Wellness", "Active Lifestyle"],
    published: false,
    sections: [
      { subHeading: "Staying Physically Active Throughout the Day", content: "Movement does not always have to come from structured workouts. Walking, stretching, and staying active during daily tasks help keep the body moving. Even small activities contribute to overall fitness." },
      { subHeading: "Maintaining a Balanced Diet", content: "Healthy eating habits support energy levels and overall health. Including fruits, vegetables, proteins, and whole grains in meals can help the body function properly. Balanced nutrition also supports muscle recovery and physical performance." },
      { subHeading: "Getting Enough Sleep", content: "Sleep is essential for recovery and maintaining energy levels. Quality sleep helps the body repair itself and supports mental and physical health. People who sleep well often feel more motivated to stay active." },
      { subHeading: "Managing Stress", content: "High stress levels can affect both mental and physical health. Activities like walking, meditation, or spending time outdoors can help reduce stress and improve well-being." },
      { subHeading: "Conclusion", content: "Fitness is not only about workouts. Small daily habits such as staying active, eating well, sleeping properly, and managing stress all contribute to a healthy lifestyle." }
    ]
  },
  {
    title: "What Happens If You Work Out Every Day?",
    description: "Many people believe that working out every day will lead to faster fitness results. While regular exercise is important for health, the body also needs time to recover between intense workouts. Understanding how daily exercise affects the body can help create a balanced fitness routine.",
    tags: ["Daily Exercise", "Workout Routine", "Fitness Recovery", "Healthy Lifestyle"],
    published: false,
    sections: [
      { subHeading: "Possible Benefits", content: "Exercising daily can improve cardiovascular health, strengthen muscles, and help maintain an active lifestyle. For people who enjoy physical activity, daily movement can also improve mood and reduce stress. However, not all workouts need to be intense." },
      { subHeading: "Importance of Recovery", content: "Muscles grow and repair during rest periods. Without adequate recovery time, the body may struggle to rebuild muscle tissue properly. Rest days or lighter workout sessions can help prevent fatigue and reduce the risk of injury." },
      { subHeading: "Mixing Different Types of Exercise", content: "If someone wants to stay active every day, alternating between different types of exercise can help maintain balance. For example: Strength training on some days, Cardio workouts on others, Light activities such as walking or stretching. This variety allows the body to recover while still staying active." },
      { subHeading: "Conclusion", content: "Working out every day can be beneficial if the routine includes proper recovery and balanced exercise intensity. Listening to the body and allowing time for rest helps maintain long-term fitness and prevents burnout." }
    ]
  },
  {
    title: "Does Working Out During Your Period Help?",
    description: "Many people wonder whether it is safe or beneficial to exercise during their period. While some prefer to rest during this time, others continue their workouts as usual. The good news is that exercising during your period is generally safe for most people and can even provide certain benefits.",
    tags: ["Periods and Exercise", "Women's Health", "Menstrual Cycle", "Workout During Periods", "Fitness Tips", "Healthy Lifestyle"],
    published: false,
    sections: [
      { subHeading: "Exercise May Help Reduce Period Symptoms", content: "One of the biggest advantages of working out during your period is that it can help relieve common symptoms such as cramps, bloating, and mood swings. Physical activity helps improve blood circulation and releases endorphins, which are natural chemicals that can improve mood and reduce pain. Light to moderate exercise can sometimes make period discomfort feel more manageable." },
      { subHeading: "Energy Levels May Vary", content: "During the menstrual cycle, hormone levels change, which can affect energy levels. Some people may feel more tired or less motivated to exercise during their period. It is important to listen to your body and adjust workout intensity if needed. Lighter activities such as walking, stretching, or yoga may feel more comfortable during this time." },
      { subHeading: "Certain Workouts May Feel Better Than Others", content: "While intense workouts may feel difficult for some people during their period, gentler forms of exercise can be helpful. Activities such as light cardio, yoga, or stretching can support circulation and help relieve muscle tension. Choosing workouts that feel comfortable is often the best approach." },
      { subHeading: "Exercise Can Improve Mood", content: "Hormonal changes during periods can sometimes lead to mood changes or irritability. Physical activity helps release endorphins, which can improve mood and reduce stress. Even a short workout or walk can help boost mental well-being during this time." },
      { subHeading: "Listen to Your Body", content: "Every person experiences their menstrual cycle differently. Some people may feel comfortable continuing their regular workouts, while others may prefer lighter activity or rest. Paying attention to how your body feels and adjusting your routine accordingly is the most important factor." }
    ]
  },
  {
    title: "Why Do Muscles Feel Sore After a Workout?",
    description: "Many people experience muscle soreness after trying a new workout or increasing the intensity of their exercise routine. This soreness can make simple movements like walking, sitting, or lifting objects feel uncomfortable. While it may seem concerning at first, muscle soreness after exercise is a normal part of the body adapting to physical activity.",
    tags: ["Muscle Soreness", "Workout Recovery", "DOMS", "Fitness Recovery", "Exercise Tips", "Muscle Health"],
    published: false,
    sections: [
      { subHeading: "What Causes Muscle Soreness", content: "Muscle soreness after exercise is often caused by tiny microscopic tears in muscle fibers. This usually happens when the body performs unfamiliar movements or when the intensity of exercise increases. As the body repairs these small tears, the muscles become stronger and more adapted to physical activity." },
      { subHeading: "Delayed Onset Muscle Soreness (DOMS)", content: "Muscle soreness that appears several hours or even a day after exercise is known as Delayed Onset Muscle Soreness (DOMS). This type of soreness typically begins around 12 to 24 hours after a workout and may peak within one or two days. DOMS is most common after new exercises, strength training, or movements that involve lowering weights slowly." },
      { subHeading: "How to Reduce Muscle Soreness", content: "While muscle soreness is normal, there are several ways to help reduce discomfort and support recovery: Stretching after workouts can help relax muscles, Light movement such as walking can improve circulation, Staying hydrated supports muscle recovery, Getting enough sleep allows the body to repair muscle tissue. These habits can help the body recover more efficiently after exercise." },
      { subHeading: "When Soreness Is Normal", content: "Mild to moderate soreness is usually a normal sign that the body is adapting to exercise. However, sharp pain or soreness that lasts for many days may indicate injury or overtraining. Listening to the body and allowing proper recovery time is important for preventing injuries." }
    ]
  },
  {
    title: "Is It Bad to Skip Workouts Sometimes?",
    description: "Many people feel guilty when they miss a workout. Whether it happens because of a busy schedule, fatigue, or unexpected events, skipping exercise can sometimes make people feel like they are losing progress. However, missing an occasional workout is a normal part of maintaining a long-term fitness routine.",
    tags: ["Workout Consistency", "Fitness Routine", "Rest Days", "Healthy Lifestyle", "Exercise Habits", "Fitness Motivation"],
    published: false,
    sections: [
      { subHeading: "Rest Is Part of Fitness", content: "The body needs time to recover after physical activity. During rest, muscles repair themselves and grow stronger. Without enough recovery time, the body may become fatigued and performance can decline. Skipping a workout occasionally can actually allow the body to recover and prevent overtraining." },
      { subHeading: "One Missed Workout Does Not Affect Progress", content: "Fitness progress is built over weeks and months of consistent effort. Missing one or two workouts does not erase previous progress. What matters most is returning to the routine and continuing regular exercise over time." },
      { subHeading: "Avoid the “All or Nothing” Mindset", content: "Some people believe that if they miss one workout, their entire routine is ruined. This mindset can make it harder to stay consistent. Instead, viewing fitness as a long-term habit can help people stay motivated even when schedules become busy." },
      { subHeading: "Listening to Your Body", content: "There are times when skipping a workout may be the best decision. If someone is feeling extremely tired, sick, or experiencing pain, rest may be necessary. Paying attention to how the body feels helps prevent injuries and supports better long-term health." },
      { subHeading: "Getting Back on Track", content: "After missing a workout, the most important step is simply returning to the routine. Starting again the next day or the next scheduled workout helps maintain consistency. Fitness is not about being perfect every day—it is about maintaining healthy habits over time." }
    ]
  },
  {
    title: "Is It Better to Do Cardio or Strength Training for Weight Loss?",
    description: "One of the most common questions people ask when starting a fitness journey is whether cardio or strength training is better for weight loss. Both forms of exercise offer unique benefits, and choosing the right approach often depends on personal goals and preferences.",
    tags: ["Cardio", "Strength Training", "Weight Loss", "Fat Loss", "Workout Routine", "Fitness Tips"],
    published: false,
    sections: [
      { subHeading: "How Cardio Helps with Weight Loss", content: "Cardio exercises such as running, cycling, swimming, and brisk walking increase heart rate and help burn calories during the activity. Because these exercises require continuous movement, they can quickly increase energy expenditure. Many people include cardio workouts in their routine to help create a calorie deficit, which is necessary for weight loss." },
      { subHeading: "How Strength Training Supports Fat Loss", content: "Strength training focuses on building and maintaining muscle through exercises such as lifting weights or performing bodyweight movements. While strength workouts may not burn as many calories during the session as cardio, they help increase muscle mass. Muscle tissue burns more calories at rest than fat tissue, which means having more muscle can support long-term fat loss." },
      { subHeading: "Why a Combination Often Works Best", content: "Many fitness experts recommend combining both cardio and strength training for the best results. Cardio helps burn calories, while strength training supports muscle growth and metabolism. A balanced routine that includes both types of exercise can improve overall fitness while supporting weight management." },
      { subHeading: "Choosing What Works for You", content: "The most effective workout routine is one that you can maintain consistently. Some people enjoy cardio-based activities, while others prefer strength training. Choosing exercises that you enjoy makes it easier to stay committed and maintain an active lifestyle." }
    ]
  },
  {
    title: "Do You Need Rest Days from Working Out?",
    description: "When people start a fitness routine, many believe that exercising every day will produce faster results. While regular physical activity is important for health, rest days are just as important as workout days. Recovery allows the body to repair itself and prepare for future exercise.",
    tags: ["Rest Days", "Workout Recovery", "Fitness Routine", "Exercise Recovery", "Healthy Lifestyle", "Training Balance"],
    published: false,
    sections: [
      { subHeading: "Muscles Grow During Recovery", content: "During exercise, especially strength training, muscles experience small amounts of stress and microscopic damage. This process is completely normal and is part of how the body adapts to physical activity. When the body rests, it repairs these muscle fibers, making them stronger than before. Without adequate rest, this recovery process cannot occur effectively." },
      { subHeading: "Preventing Overtraining", content: "Exercising intensely every day without rest can lead to overtraining. Overtraining may cause fatigue, decreased performance, and a higher risk of injury. Symptoms of overtraining can include constant soreness, lack of motivation to exercise, and difficulty completing workouts that previously felt manageable." },
      { subHeading: "Improved Performance", content: "Rest days help restore energy levels and allow the body to recover fully. When muscles and energy systems are properly recovered, workouts can be more effective. People often notice improved strength, endurance, and focus after giving their body time to rest." },
      { subHeading: "Active Recovery Can Help", content: "Rest days do not always mean doing nothing. Light activities such as walking, stretching, or yoga can help increase blood circulation and support recovery. These gentle movements allow the body to stay active while still giving muscles time to recover." },
      { subHeading: "Finding the Right Balance", content: "Most fitness routines benefit from at least one or two rest days per week, depending on workout intensity. Listening to the body and recognizing signs of fatigue can help determine when rest is needed. Rest days are an essential part of a balanced fitness routine. They allow the body to recover, prevent injuries, and improve overall performance." }
    ]
  }
];

const seedDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`✅ Connected to MongoDB: ${conn.connection.host}`);

    console.log('🌱 Starting to seed tags...');
    const allTags = new Set();
    
    const normalizeTagName = (name) => {
      return name
        .trim()
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    };

    blogs.forEach(blog => {
      blog.tags = blog.tags.map(t => normalizeTagName(t));
      blog.tags.forEach(tag => allTags.add(tag));
    });

    for (const tagName of allTags) {
      const slug = tagName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const existingTag = await Tag.findOne({ $or: [{ name: tagName }, { slug }] });
      if (!existingTag) {
        await Tag.create({ name: tagName });
        console.log(`   + Seeded Tag: ${tagName}`);
      }
    }
    console.log(`✅ Tag seeding complete!`);

    console.log('🌱 Starting to seed blogs...');
    
    // Clear existing blogs for clean seed with normalized tags
    await Blog.deleteMany({}); 
    
    const countBefore = await Blog.countDocuments();
    
    for (const blogData of blogs) {
      // Check if blog already exists by title to avoid duplicates if run multiple times
      const existing = await Blog.findOne({ title: blogData.title });
      if (!existing) {
        await Blog.create(blogData);
        console.log(`   + Seeded: ${blogData.title}`);
      } else {
        console.log(`   - Skipped (exists): ${blogData.title}`);
      }
    }

    const countAfter = await Blog.countDocuments();
    console.log(`✅ Seeding complete! Added ${countAfter - countBefore} new blogs.`);
    process.exit(0);
  } catch (err) {
    console.error(`❌ Seeding error: ${err.message}`);
    process.exit(1);
  }
};

seedDB();
