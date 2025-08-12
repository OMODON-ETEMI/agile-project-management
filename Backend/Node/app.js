const mongoose = require('mongoose');
const express = require('express');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors');
const { issueRouter, projectRouter } = require('./Model/router');
const { initSocket } = require('./utility/socket')

const app = express();

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'OPTIONS', 'PUT', 'DELETE']
  }
});

const uri = 'mongodb://localhost:27017/mydatabase';

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
    initSocket(io)

    app.use(cors(corsOptions))
    app.use(express.json());
    app.use(issueRouter)
    app.use(projectRouter);

    app.get('/', (req, res) => {
      res.send('Hello world');
    });

    io.on('connection', (socket) => {
      console.log('A client connected:', socket.id);

      socket.on('disconnect', () => {
        console.log('A user disconnected:', socket.id)
      })
    })

    server.listen(4000, () => {
      console.log('Server is running on port 4000');
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

mongoose.connection.on('error', (err) => {
  console.error("MongoDB connection error:", err);
})

mongoose.connection.on('disconnected', () => {
  console.log("MongoDB connection disconnected")
})
