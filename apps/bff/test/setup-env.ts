import * as path from "node:path";
import * as dotenv from "dotenv";

// Resolve path relative to apps/bff
const envPath = path.resolve(__dirname, "../.env");
const rootEnvPath = path.resolve(__dirname, "../../../.env");

// Load variables from .env file
dotenv.config({ path: rootEnvPath });
dotenv.config({ path: envPath });

// Optional log for confirmation (visible in test output)
console.log(`[setup-env] Loaded environment from: ${envPath} and ${rootEnvPath}`);
