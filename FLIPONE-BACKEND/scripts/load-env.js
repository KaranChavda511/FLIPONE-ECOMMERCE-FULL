// Preloaded by `npm run dev` (node --import): reads .env with Node's built-in parser before the app starts.
// Variables already set in the environment win, as with --env-file.
//
// Why not `--env-file-if-exists=.env` here: in watch mode on Windows that flag makes Node watch the whole folder
// that holds .env, so every log line (logs/) and saved email preview restarted the server mid-request.
import { fileURLToPath } from 'node:url';

try {
  process.loadEnvFile(fileURLToPath(new URL('../.env', import.meta.url)));
} catch (error) {
  if (error.code !== 'ENOENT') throw error;
}
