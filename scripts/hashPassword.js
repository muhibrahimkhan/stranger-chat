// One-off utility: run this to generate a bcrypt hash of whatever admin
// password you choose. Usage:
//   node scripts/hashPassword.js "your-chosen-password"
// Paste the printed hash into your .env as ADMIN_PASSWORD_HASH.

const bcrypt = require('bcrypt');

const password = process.argv[2];

if (!password) {
  console.error('Usage: node scripts/hashPassword.js "your-password"');
  process.exit(1);
}

bcrypt.hash(password, 10).then((hash) => {
  console.log(hash);
});
