import fs from 'fs';

function readFileSecret(name: string): string | undefined {
  const file = process.env[`${name}_FILE`];
  if (!file) return undefined;
  return fs.readFileSync(file, 'utf8').trim();
}

export function env(name: string): string | undefined {
  return process.env[name] || readFileSecret(name);
}

export function requiredEnv(name: string): string {
  const value = env(name);
  if (!value) throw new Error(`${name} is required`);
  return value;
}

export function requiredInProduction(name: string): string | undefined {
  const value = env(name);
  if (process.env.NODE_ENV === 'production' && !value) {
    throw new Error(`${name} is required in production`);
  }
  return value;
}

