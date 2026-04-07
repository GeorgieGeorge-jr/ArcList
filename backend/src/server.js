const app = require("./app");
const { testConnection } = require("./config/db");

const PORT = process.env.PORT || 5050;

async function startServer() {
  try {
    await testConnection();
    console.log("✅ MySQL connected successfully");

    app.listen(PORT, () => {
      console.log(`🚀 ArcList server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
}

startServer();