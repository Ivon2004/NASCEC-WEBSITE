const bcrypt = require('bcrypt');

async function generateHash() {
    const hashed = await bcrypt.hash("AdminPass123", 10);
    console.log("Hashed password:", hashed);
}

generateHash();
