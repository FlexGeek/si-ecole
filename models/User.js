// models/User.js
const pool = require('../config/db');
const bcrypt = require('bcryptjs');

class User {
    // Créer un utilisateur (admin, comptable, secrétariat, parent)
    static async create({ email, password, role, nom_complet, student_id = null, teacher_id = null }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = `
            INSERT INTO users (email, password, role, nom_complet, student_id, teacher_id)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING id, email, role, nom_complet, student_id, teacher_id, created_at
        `;
        const values = [email, hashedPassword, role, nom_complet, student_id, teacher_id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    // Trouver un utilisateur par email (avec mot de passe pour vérification)
    static async findByEmail(email) {
        const query = `SELECT * FROM users WHERE email = $1`;
        const { rows } = await pool.query(query, [email]);
        return rows[0];
    }

    // Trouver par ID (sans mot de passe)
    static async findById(id) {
        const query = `SELECT id, email, role, nom_complet, student_id, teacher_id, created_at FROM users WHERE id = $1`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // Vérifier le mot de passe
    static async comparePassword(plainPassword, hashedPassword) {
        return bcrypt.compare(plainPassword, hashedPassword);
    }

    // Lister tous les utilisateurs (admin seulement)
    static async findAll() {
        const query = `SELECT id, email, role, nom_complet, student_id, teacher_id, created_at FROM users ORDER BY created_at DESC`;
        const { rows } = await pool.query(query);
        return rows;
    }

    // Supprimer un utilisateur (admin seulement)
    static async delete(id) {
        const query = `DELETE FROM users WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }
}

module.exports = User;