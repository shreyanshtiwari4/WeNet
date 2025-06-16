const express = require('express');
const {connectDB} = require('./config/db.js');
const dotenv = require('dotenv');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;
const cors = require('cors');
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
connectDB();

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});