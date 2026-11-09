import { defineConfig } from 'vitest/config';

// Unit + HTTP tests that need no database: validation, auth guards, routing, error handling.
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.js'],
    env: { NODE_ENV: 'test', JWT_SECRET: 'test-secret' },
  },
});
