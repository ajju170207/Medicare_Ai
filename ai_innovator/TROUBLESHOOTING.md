# 🛠️ Database Troubleshooting Guide

It looks like your MediCare AI platform is unable to connect to the database. This is usually because **MongoDB** isn't running on your computer.

Follow these steps to fix the issue:

## 🍏 For MacOS (using Homebrew)

1. **Check if MongoDB is installed:**
   ```bash
   brew list | grep mongodb
   ```

2. **Start the MongoDB service:**
   ```bash
   brew services start mongodb-community
   ```

3. **Verify it's running:**
   ```bash
   pgrep mongod
   ```

## ☁️ Alternative: Use MongoDB Atlas (Cloud)

If you don't want to run MongoDB locally, you can use a free cluster on MongoDB Atlas:

1. Create a free account at [mongodb.com/atlas](https://www.mongodb.com/atlas).
2. Create a "Shared" cluster.
3. Get your **Connection String** (it looks like `mongodb+srv://<username>:<password>@cluster.mongodb.net/medicare-ai`).
4. Open `backend/.env` and replace `MONGODB_URI` with your connection string.

## 🔄 After Fixing

Once MongoDB is running:
1. The backend server should automatically reconnect (or restart it).
2. Go back to the website and try searching or registering again!

---
> [!NOTE]
> I have added a "Database Offline" detector to the backend. Now, instead of a generic failure, the app will explicitly tell you if the database is disconnected.
