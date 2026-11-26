// Load backend/.env before any other module reads process.env at import time
// (several services capture env vars in module-level constants). Variables
// already set in the real environment take precedence. On hosts without a
// .env file (e.g. Render, which injects env vars directly) this is a no-op.
try {
  process.loadEnvFile();
} catch {
  // no .env file — rely on the real environment
}
