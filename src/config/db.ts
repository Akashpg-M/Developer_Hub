import prisma from '../lib/prisma';

export const initializeDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Database connected successfully');
  } catch (error) {
    console.error('Error connecting to database:', error);
    process.exit(1);
  }
};

export const closeDatabase = async () => {
  await prisma.$disconnect();
}; 