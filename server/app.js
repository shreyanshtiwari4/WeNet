import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config();
 // should print your key
import express from 'express';
import { connectDB } from './config/db.js';
import adminRoutes from './routes/admin.route.js';
import communityRoutes from './routes/community.route.js';
import search from './controllers/search.controller.js';
import userRoutes from './routes/user.route.js';
import postRoutes from './routes/post.route.js';
import contextAuthRoutes from "./routes/context-auth.route.js";

const app = express();
const PORT = process.env.PORT || 4000;
import cors from 'cors';
import morgan from "morgan";
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
import passport from "passport";
import "./config/passport.js";

app.use(passport.initialize());
app.use(morgan("dev"));
app.use("/assets/userFiles", express.static(__dirname + "/assets/userFiles"));
app.use(
  "/assets/userAvatars",
  express.static(__dirname + "/assets/userAvatars")
);

app.use("/users", userRoutes);
app.use("/auth", contextAuthRoutes);
app.use("/communities", communityRoutes);
app.use("/admin", adminRoutes);
app.use("/posts", postRoutes);

connectDB();


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
 
});