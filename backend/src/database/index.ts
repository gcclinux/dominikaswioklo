// Adapter loader: export DatabaseQueries from either sqlite queries or mongoQueries based on DB_TYPE
const DB_TYPE = process.env.DB_TYPE || 'sqlite';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const impl: any = DB_TYPE === 'mongodb' ? require('./mongoQueries') : require('./queries');

if (DB_TYPE === 'mongodb') {
  // eslint-disable-next-line no-console
  console.log('🔀 Using MongoDB adapter for database queries');
} else {
  // eslint-disable-next-line no-console
  console.log('🔀 Using SQLite adapter for database queries');
}

export const DatabaseQueries: any = impl.DatabaseQueries;
