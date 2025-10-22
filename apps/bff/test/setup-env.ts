import * as path from "node:path";
import * as dotenv from "dotenv";

const envPath = path.resolve(__dirname, "../.env");          // apps/bff/.env
const rootEnvPath = path.resolve(__dirname, "../../../.env"); // repo root .env

dotenv.config({ path: rootEnvPath });
dotenv.config({ path: envPath, override: true });

