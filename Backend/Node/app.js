const mongoose = require('mongoose');
const express = require('express');
const cookieParser = require('cookie-parser');
const http = require('http')
const { Server } = require('socket.io')
const cors = require('cors');
const { issueRouter, projectRouter, notificationRouter } = require('./Model/router');
const { initSocket } = require('./utility/socket')
const subscriber = require('./utility/subscriber')
const dotenv =  require('dotenv');
const { authMiddleware } = require('./utility/auth.js');

const app = express();

const server = http.createServer(app)

const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PATCH', 'OPTIONS', 'PUT', 'DELETE']
  }
});

const uri = 'mongodb://host.docker.internal:27017/mydatabase';

const corsOptions = {
  origin: 'http://localhost:3000',
  optionsSuccessStatus: 200
}

mongoose.connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
    initSocket(io);
    
    app.get('/', (req, res) => {
      res.send('Hello world');
    });

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use(authMiddleware)
    app.use(issueRouter);
    app.use(projectRouter);
    app.use(notificationRouter);


    app.get("/protected", (req, res) => {
  // req.user is available here
  res.json({ message: `Hello ${req.user.username}` });
});

    dotenv.config();
    subscriber.start();
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
