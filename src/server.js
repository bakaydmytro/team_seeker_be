const express = require('express');
const app = express();
const port = process.env.PORT || 5000; 
const { errorHandler } = require('./middleware/errorMiddleware');
const sequelize = require('./config/db'); 

// Middleware
app.use(express.json()); 
app.use(express.urlencoded({ extended: false })); 

// Routes
app.use('/api/todos', require('./routes/todoRoutes')); 
app.use('/api/users', require('./routes/userRoutes')); 

// Error handling middleware
app.use(errorHandler);

// Sync the database and start the server
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    app.listen(port, () => {
      console.log(`Server started on port ${port}`);
    });
  })
  .catch(err => {
    console.error('Error connecting to the database:', err);
  });





