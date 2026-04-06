require("dotenv").config();
const mongoose = require("mongoose");
const express = require("express");
const cookieParser = require("cookie-parser");
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const { issueRouter, notificationRouter } = require("./Model/router");
const { initSocket } = require("./utility/socket");
const subscriber = require("./utility/subscriber");
const { authMiddleware } = require("./utility/auth.js");

const app = express();

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    methods: ["GET", "POST", "PATCH", "OPTIONS", "PUT", "DELETE"],
  },
});

const uri =
  process.env.MONGODB_URI || "mongodb://host.docker.internal:27017/mydatabase";
const PORT = process.env.PORT || 4000;
const corsOptions = {
  origin: process.env.FRONTEND_URL || "http://localhost:3000",
  optionsSuccessStatus: 200,
};

mongoose
  .connect(uri)
  .then(() => {
    console.log("Connected to MongoDB");
    initSocket(io);

    app.use(cors(corsOptions));
    app.use(express.json());
    app.use(cookieParser());
    app.use(authMiddleware);
    app.get("/", (req, res) => {
      res.send("Hello world");
    });
    app.use(issueRouter);
    app.use(notificationRouter);

    app.get("/protected", (req, res) => {
      res.json({ message: `Hello ${req.user.username}` });
    });

    subscriber.start();
    io.on("connection", (socket) => {
      console.log("A client connected:", socket.id);

      socket.on("user:join", (userId) => {
        socket.join(userId);
        console.log(`User ${socket.id} is now watching User: ${userId}`);
      });

      socket.on("wrk:join", (orgId) => {
        socket.join(orgId);
        console.log(`User ${socket.id} is now watching Org: ${orgId}`);
      });

      socket.on("wrk:leave", (orgId) => {
        socket.leave(orgId);
      });

      socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
      });
    });
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err);
  });

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Server is running on port ${PORT}`);
});

mongoose.connection.on("error", (err) => {
  console.error("MongoDB connection error:", err);
});

mongoose.connection.on("disconnected", () => {
  console.log("MongoDB connection disconnected");
});
