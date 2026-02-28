import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(
  cors({
    origin: process.env.CORS_ORIGIN,
    credentials: true,
  }),
);

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use("/uploads" , express.static("uploads"))

app.use(cookieParser());

import userRoute from "./routes/user.routes.js";
import messageRoute from "./routes/message.routes.js";
import chatRoute from "./routes/chat.routes.js";
import emotionRoute from "./routes/emotion.routes.js"
import profileRoute from "./routes/profile.routes.js"

app.use("/api/v1/users", userRoute);
app.use("/api/v1/message", messageRoute);
app.use("/api/v1/chat" , chatRoute);
app.use("/api/v1/emotion" , emotionRoute);
app.use("/api/v1/profile", profileRoute);


export default app;
