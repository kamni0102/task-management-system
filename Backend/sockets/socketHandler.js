const socketHandler = (io) => {
  io.on('connection', (socket) => {
    console.log(`Socket Connected: ${socket.id}`);

    // Join a specific project room
    socket.on('joinProject', (projectId) => {
      socket.join(projectId);
      console.log(`User joined project room: ${projectId}`);
    });

    socket.on('leaveProject', (projectId) => {
      socket.leave(projectId);
    });

    socket.on('disconnect', () => {
      console.log(`Socket Disconnected: ${socket.id}`);
    });
  });
};

module.exports = socketHandler;