const fs = require('fs');
const path = require('path');

// This script runs during the build process (e.g., on Netlify)
// It creates the public/env-config.js file using environment variables
// set in the build environment (like Netlify's UI).

const envConfigContent = `
window.ENV = {
  API_KEY: "${process.env.API_KEY || 'MISSING_API_KEY_PLACEHOLDER'}",
  SUPABASE_URL: "${process.env.SUPABASE_URL || 'MISSING_SUPABASE_URL_PLACEHOLDER'}",
  SUPABASE_ANON_KEY: "${process.env.SUPABASE_ANON_KEY || 'MISSING_SUPABASE_ANON_KEY_PLACEHOLDER'}"
};
`;

const publicDir = path.join(__dirname, 'public');
if (!fs.existsSync(publicDir)){
    fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFileSync(path.join(publicDir, 'env-config.js'), envConfigContent.trim());

console.log('public/env-config.js created successfully.');
console.log('Using API_KEY starting with: ' + (process.env.API_KEY ? process.env.API_KEY.substring(0, 5) + '...' : 'NOT SET'));
console.log('Using SUPABASE_URL: ' + process.env.SUPABASE_URL);