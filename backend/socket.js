// backend/socket.js
function registerSocket(io) {
  io.on('connection', (socket) => {
    // 单个订单房间：精准推送状态变化
    socket.on('join_order', (orderId) => {
      if (!orderId) return;
      socket.join(`order:${orderId}`);
      // console.log(`🔌 ${socket.id} joined order:${orderId}`);
    });

    socket.on('leave_order', (orderId) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
      // console.log(`🔌 ${socket.id} left order:${orderId}`);
    });

    socket.on('disconnect', () => {
      // console.log(`❎ ${socket.id} disconnected`);
    });
  });
}

module.exports = { registerSocket };
