# Postgres migration for Render

1. Create a Postgres instance on Render (free tier is fine to start).
2. Copy its "Internal Database URL" (if your backend web service is also
   on Render) or "External Database URL" (if connecting from elsewhere).
3. Run schema.sql against it once:
     psql "<your-database-url>" -f schema.sql
4. (Optional) Seed your existing data:
     psql "<your-database-url>" -f seed.sql
   Skip this if you'd rather start with a clean database — registering
   again through the app works fine either way.
5. On your Render Web Service (the Node backend), set the env var:
     DATABASE_URL = <your-database-url>
   plus JWT_SECRET, JWT_EXPIRES_IN, NODE_ENV=production.
6. Update frontend/js/config.js's RENDER_BACKEND_URL to your real
   Render service URL (e.g. https://arclist-api.onrender.com/api)
   once Render assigns it, then redeploy the frontend on Netlify.
