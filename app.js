const express = require('express');
const fs = require('fs');
const path = require('path');
var logger = require('morgan');
const cors = require('cors');
var cookieParser = require('cookie-parser');
const sequelize = require('./config/database');
const swaggerUi = require('swagger-ui-express');
const swaggerDocs = require('./swagger');
const authMiddleware = require('./middleware/auth');

const app = express();
const userRoutes = require('./routes/user');

app.use(express.json());
app.use(cookieParser());
app.use(logger('dev'));
app.use(express.urlencoded({ extended: false }));
app.use(cors({
  origin: 'localhost', // Your frontend domain
  credentials: true // Allow cookies to be sent with the requests
}));

if (!fs.existsSync('uploads')) {
  fs.mkdirSync('uploads');
}

// Dynamically import all models from the 'models' folder
fs.readdirSync(path.join(__dirname, 'models'))
  .filter((file) => file.endsWith('.js'))
  .forEach((file) => {
    require(path.join(__dirname, 'models', file));
  });

// Sync database
sequelize.sync({ force: false }).then(() => {
  console.log('Database & tables created!');
});

// Define routes and controllers here...
app.use('/users', userRoutes);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
