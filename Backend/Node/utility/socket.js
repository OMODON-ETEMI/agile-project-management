let io;

function initSocket(socketServer) {
  io = socketServer;
  console.log('Socket.IO initialized');
}

function emitSocketEvent(eventName, data) {
  if (io) {
    io.emit(eventName, data);
  } else {
    console.warn('Socket.io not initialized');
  }
}

module.exports = { 
  initSocket, 
  emitSocketEvent 
};