let io;

function initSocket(socketServer) {
  io = socketServer;
  console.log('Socket.IO initialized');
}

function emitSocketEvent(eventName, data, id) {
  if (io) {
    io.to(id.toString()).emit(eventName, data);
  } else {
    console.warn('Socket.io not initialized');
  }
}

module.exports = { 
  initSocket, 
  emitSocketEvent 
};