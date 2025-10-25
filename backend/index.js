// backend/index.js
require('dotenv').config();

const express = require('express');
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');

const { resetDatabase } = require('./db/resetDB');
const { seedData } = require('./db/dataSeed');
const { connectDB } = require('./db/db');

const { registerSocket } = require('./socket');

const authRouter = require('./routes/auth');
const menusRouter = require('./routes/menus');
const ordersRouter = require('./routes/orders');
const statisticsRouter = require('./routes/statistics');
const aiRouter = require('./routes/ai');

const app = express();
const server = http.createServer(app);

const CORS_ORIGIN = process.env.CORS_ORIGIN || '*';
const io = new Server(server, { cors: { origin: CORS_ORIGIN } });

app.use(cors({ origin: CORS_ORIGIN }));
app.use(express.json());

async function startServer() {
  try {
    let conn;

    if (process.env.DB_RESET === 'true') {
      // ✅ 重置数据库 + 插入数据
      conn = await resetDatabase();
      await seedData(conn);
    } else {
      // ✅ 仅连接，不清空数据库
      conn = await connectDB();
      console.log('⚡ Using existing database, no reset.');
    }

    // ✅ 每个请求挂 db / io
    app.use((req, _res, next) => {
      req.db = conn;
      req.io = io;
      next();
    });

    // ✅ 健康检查
    app.get('/api/health', (_req, res) =>
      res.json({ ok: true, ts: Date.now(), reset: process.env.DB_RESET === 'true' })
    );

    // ✅ 路由
    app.use('/api/auth', authRouter);
    app.use('/api/menus', menusRouter);
    app.use('/api/orders', ordersRouter);
    app.use('/api/statistics', statisticsRouter);
    app.use('/api/ai', aiRouter);

    // ✅ Socket event
    registerSocket(io);

    // ✅ 统一错误兜底（可按需保留）
    // app.use((err, _req, res, _next) => {
    //   console.error('Unhandled error:', err);
    //   res.status(500).json({ success: false, error: 'Internal Server Error' });
    // });

    const PORT = Number(process.env.PORT) || 3000;
    const HOST = process.env.HOST || '0.0.0.0';

    server.listen(PORT, HOST, () => {
      console.log(`🚀 Backend running at http://${HOST}:${PORT}`);
      if (HOST === '0.0.0.0') {
        console.log('💡 If testing on phone, set API_BASE to your LAN IP, e.g. http://192.168.x.x:' + PORT);
      }
    });

    // ✅ 优雅退出
    const shutdown = async (signal) => {
      console.log(`\n${signal} received, shutting down...`);
      try {
        io.close();
        server.close(() => process.exit(0));
      } catch {
        process.exit(0);
      }
    };
    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));

  } catch (err) {
    console.error('❌ Server startup error:', err);
    process.exit(1);
  }
}

startServer();
