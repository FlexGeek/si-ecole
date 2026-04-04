// scripts/createAdmin.js
const bcrypt = require('bcryptjs');
const pool = require('./config/db');

async function createAdmin() {
    const email = 'admin@ecole.com';
    const password = 'admin123';
    const hashed = await bcrypt.hash(password, 10);
    const query = `
        INSERT INTO users (email, password, role, nom_complet)
        VALUES ($1, $2, 'admin', 'Administrateur')
        ON CONFLICT (email) DO UPDATE SET password = $2
    `;
    try {
        await pool.query(query, [email, hashed]);
        console.log('✅ Admin créé ou mis à jour avec succès');
    } catch (err) {
        console.error('❌ Erreur lors de la création de l\'admin :', err.message);
    } finally {
        process.exit();
    }
}

createAdmin();