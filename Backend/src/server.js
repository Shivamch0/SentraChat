import dotenv from "dotenv";
dotenv.config({
  path: ".env",
});

import app from "./app.js";
import { Server } from "socket.io";
import http from "http";
import { connectDB } from "./config/db.js";
import { User } from "./models/user.models.js";

const Port = process.env.PORT || 3000;

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  },
});

app.set("io", io);

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  socket.on("setup" , async (userId) => {
    socket.userId = userId;
    socket.join(userId);

    await User.findByIdAndUpdate(userId , {
        isOnline : true,
        lastSeen : null
    });

    socket.broadcast.emit("user status changed", {
      userId,
      isOnline: true,
    });

  })

  socket.on("Join Chat", (chatId) => {
    socket.join(chatId);
  });

   socket.on("typing", (chatId) => {
    socket.to(chatId).emit("typing");
  });

  socket.on("stop typing", (chatId) => {
    socket.io(chatId).emit("stop typing");
  });

  socket.on("disconnect", async () => {
    const userId = socket.userId;

    if(!userId) return;

    await User.findByIdAndUpdate(userId , {
        isOnline : false,
        lastSeen : new Date()
    });

    socket.broadcast.emit("user status changed" , {
        userId,
        isOnline : false,
        lastSeen : new Date()
    })

    console.log("User Disconnected : " , socket.id)
  });
});

connectDB()
  .then(() => {
    server.listen(Port, () => {
      console.log("Server is listening on port : ", Port);
    });
  })
  .catch((error) => {
    console.log(error);
  });
