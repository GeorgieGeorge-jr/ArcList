const dotenv = require("dotenv");
const { pool } = require("../config/db");

dotenv.config();

const starterTags = [
  { name: "Growth", color: "#8B1E3F" },
  { name: "Learning", color: "#5C2E91" },
  { name: "Creative", color: "#C15F3C" },
  { name: "Fitness", color: "#2C8C6B" },
  { name: "Language", color: "#3F6ED8" },
  { name: "Reading", color: "#8C6A2C" },
  { name: "Research", color: "#6B7280" },
];

const starterTasks = [
  {
    title: "Spend 30 minutes on personal growth",
    description: "Starter self-development task",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 30,
    tag: "Growth",
  },
  {
    title: "Learn something outside my course",
    description: "Explore knowledge beyond formal coursework",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 45,
    tag: "Learning",
  },
  {
    title: "Explore one tech topic",
    description: "Read or watch something related to technology",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 45,
    tag: "Learning",
  },
  {
    title: "Practice a new language",
    description: "Vocabulary, listening, or speaking practice",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 30,
    tag: "Language",
  },
  {
    title: "Improve speaking through practice",
    description: "Speaking drills or presentation-style practice",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 20,
    tag: "Language",
  },
  {
    title: "Do a physical fitness session",
    description: "General body movement or workout",
    priority: "high",
    planning_mode: "todo",
    difficulty_level: 4,
    estimated_minutes: 40,
    tag: "Fitness",
  },
  {
    title: "Practice calisthenics",
    description: "Bodyweight training session",
    priority: "high",
    planning_mode: "todo",
    difficulty_level: 4,
    estimated_minutes: 35,
    tag: "Fitness",
  },
  {
    title: "Work on crocheting",
    description: "Spend time developing crocheting skill",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 45,
    tag: "Creative",
  },
  {
    title: "Practice drawing",
    description: "Sketching or drawing improvement session",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 40,
    tag: "Creative",
  },
  {
    title: "Practice painting",
    description: "Painting session for improvement or expression",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 45,
    tag: "Creative",
  },
  {
    title: "Read fiction",
    description: "Read fiction for learning or enjoyment",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 30,
    tag: "Reading",
  },
  {
    title: "Read non-fiction",
    description: "Read educational or reflective material",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 30,
    tag: "Reading",
  },
  {
    title: "Write fiction",
    description: "Creative writing practice",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 40,
    tag: "Creative",
  },
  {
    title: "Journal for the day",
    description: "Reflect and write daily thoughts",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 15,
    tag: "Growth",
  },
  {
    title: "Practice singing",
    description: "Voice or song practice",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 25,
    tag: "Creative",
  },
  {
    title: "Learn a constellation",
    description: "Study one constellation and its features",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 20,
    tag: "Learning",
  },
  {
    title: "Memorize 5 countries",
    description: "Learn and retain names or locations of countries",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 15,
    tag: "Learning",
  },
  {
    title: "Write or study a poem this week",
    description: "Weekly poetry engagement",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 25,
    tag: "Creative",
  },
  {
    title: "Identify a plant",
    description: "Study and recognize a plant",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 15,
    tag: "Research",
  },
  {
    title: "Research a controversial topic",
    description: "Explore a complex topic from multiple angles",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 4,
    estimated_minutes: 45,
    tag: "Research",
  },
  {
    title: "Study the history of a famous person",
    description: "Read about someone influential",
    priority: "low",
    planning_mode: "todo",
    difficulty_level: 2,
    estimated_minutes: 25,
    tag: "Research",
  },
  {
    title: "Practice acrylic painting",
    description: "Acrylic-specific painting session",
    priority: "medium",
    planning_mode: "todo",
    difficulty_level: 3,
    estimated_minutes: 45,
    tag: "Creative",
  },
];

async function findUser(identifier) {
  const [rows] = await pool.query(
    `SELECT id, username, email, display_name FROM users WHERE email = ? OR username = ? LIMIT 1`,
    [identifier, identifier]
  );
  return rows[0] || null;
}

async function ensureTags(userId) {
  const tagMap = {};

  for (const tag of starterTags) {
    const [existingRows] = await pool.query(
      `SELECT id, name FROM task_tags WHERE user_id = ? AND name = ? LIMIT 1`,
      [userId, tag.name]
    );

    if (existingRows[0]) {
      tagMap[tag.name] = existingRows[0].id;
      continue;
    }

    const [insertResult] = await pool.query(
      `INSERT INTO task_tags (user_id, name, color) VALUES (?, ?, ?)`,
      [userId, tag.name, tag.color]
    );

    tagMap[tag.name] = insertResult.insertId;
  }

  return tagMap;
}

async function seedTasks(userId, tagMap) {
  let insertedCount = 0;
  let skippedCount = 0;

  for (const task of starterTasks) {
    const [existingRows] = await pool.query(
      `SELECT id FROM tasks WHERE user_id = ? AND title = ? LIMIT 1`,
      [userId, task.title]
    );

    if (existingRows[0]) {
      skippedCount += 1;
      continue;
    }

    await pool.query(
      `
        INSERT INTO tasks (
          user_id,
          title,
          description,
          priority,
          planning_mode,
          difficulty_level,
          estimated_minutes,
          status,
          tag_id
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, 'pending', ?)
      `,
      [
        userId,
        task.title,
        task.description,
        task.priority,
        task.planning_mode,
        task.difficulty_level,
        task.estimated_minutes,
        tagMap[task.tag] || null,
      ]
    );

    insertedCount += 1;
  }

  return { insertedCount, skippedCount };
}

async function main() {
  const identifier = process.argv[2];

  if (!identifier) {
    console.error("❌ Please provide a username or email.");
    console.log("Example: node src/scripts/seedStarterTasks.js daraandy");
    process.exit(1);
  }

  try {
    const user = await findUser(identifier);

    if (!user) {
      console.error(`❌ No user found for "${identifier}"`);
      process.exit(1);
    }

    console.log(`🌱 Seeding starter tasks for ${user.display_name} (@${user.username})`);

    const tagMap = await ensureTags(user.id);
    const result = await seedTasks(user.id, tagMap);

    console.log(`✅ Done. Inserted: ${result.insertedCount}, Skipped duplicates: ${result.skippedCount}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed failed:", error.message);
    process.exit(1);
  }
}

main();