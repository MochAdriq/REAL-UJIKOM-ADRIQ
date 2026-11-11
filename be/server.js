const express = require('express')
const cors = require('cors')
const db = require('./db')

const app = express();
const PORT = 5000;

app.use(cors());
-