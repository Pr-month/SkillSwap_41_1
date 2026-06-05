import { DataSource } from 'typeorm';
import { dbConfig } from './src/config/db.config';
import { config } from 'dotenv';

config({ path: process.env.NODE_ENV === 'test' ? '.env.test.local' : '.env' });

export default new DataSource(dbConfig());
