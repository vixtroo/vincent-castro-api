import 'dotenv/config';

const parsePort = (value: string | undefined): number => {
  const port = Number(value ?? 5000);
  return Number.isInteger(port) && port > 0 && port <= 65535 ? port : 5000;
};

export const env = {
  port: parsePort(process.env.PORT),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  authToken: process.env.AUTH_TOKEN,
  corsOrigin: process.env.CORS_ORIGIN ?? '*',
} as const;
