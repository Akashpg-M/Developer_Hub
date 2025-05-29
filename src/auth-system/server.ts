import 'reflect-metadata';
import { app } from '../app';
import { AppDataSource } from './config/db';


const PORT = process.env.PORT || 3000;

// Initialize database connection and start server
AppDataSource.initialize()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error: Error) => {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }); 