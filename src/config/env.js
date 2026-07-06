/**
 * Validates required environment variables at startup.
 * Crashes the process if critical secrets are missing in production.
 */
export function validateEnv() {
  if (!process.env.JWT_SECRET) {
    console.error('FATAL: JWT_SECRET environment variable is required.');
    console.error('Set a strong random string (64+ chars) in your .env file.');
    process.exit(1);
  }
}

export function getJwtSecret() {
  return process.env.JWT_SECRET;
}
