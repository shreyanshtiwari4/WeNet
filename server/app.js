const express = require('express');
const {connectDB} = require('./config/db.js');
const adminRoutes = require('./routes/admin.route.js');
const communityRoutes = require('./routes/community.route.js');
const search = require('./controllers/search.controller.js');
const userRoutes = require('./routes/user.route.js');
const postRoutes = require('./routes/post.route.js')
const contextAuthRoutes = require("./routes/context-auth.route.js")
const dotenv = require('dotenv');
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
const morgan = require("morgan");
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const passport = require("passport");
require("./config/passport.js");

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