import dotenv from 'dotenv';

process.env.NODE_ENV = process.env.NODE_ENV || 'development';
dotenv.config();

const envFound = dotenv.config();
if (!envFound) {
  console.info('No .env file specified, falling back to defaults');
}

export default {
  env: process.env.NODE_ENV || 'production',
  clientId: process.env.TWITCH_CLIENT_ID || '',
  apiUrl: process.env.SHOKZ_API_URL || '',
  apiKey: process.env.API_KEY || '',
};
