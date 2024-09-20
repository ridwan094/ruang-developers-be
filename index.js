const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const sequelize = require('./config/database');
const videoRoutes = require('./routes/video');
const fileRoutes = require('./routes/file');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3006;

app.use(cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', [
  videoRoutes,
  fileRoutes
]);

sequelize.sync()
  .then(() => {
    app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
  })
  .catch(err => console.error('Unable to connect to the database:', err));