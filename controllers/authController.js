// controllers/authController.js
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpire } = require('../config/auth');
const pool = require('../config/db');


// Connexion
exports.login = async (req, res) => {
    const { email, password } = req.body;
    if (!email || !password) {
        return res.status(400).json({ message: 'Email et mot de passe requis' });
    }

    try {
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const isValid = await User.comparePassword(password, user.password);
        if (!isValid) {
            return res.status(401).json({ message: 'Identifiants invalides' });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role },
            jwtSecret,
            { expiresIn: jwtExpire }
        );

        // Ne pas renvoyer le mot de passe
        delete user.password;

        res.json({ token, user });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Inscription (réservé à l'admin – sera protégé par middleware)
exports.register = async (req, res) => {
    const { email, password, role, nom_complet, student_id, teacher_id } = req.body;

    if (!email || !password || !role) {
        return res.status(400).json({ message: 'Email, mot de passe et rôle requis' });
    }

    const validRoles = ['admin', 'comptable', 'secretariat', 'parent'];
    if (!validRoles.includes(role)) {
        return res.status(400).json({ message: 'Rôle invalide' });
    }

    try {
        const existing = await User.findByEmail(email);
        if (existing) {
            return res.status(409).json({ message: 'Cet email est déjà utilisé' });
        }

        const newUser = await User.create({ email, password, role, nom_complet, student_id, teacher_id });
        res.status(201).json({ message: 'Utilisateur créé', user: newUser });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Obtenir son propre profil
exports.getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json(user);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Lister tous les utilisateurs (admin seulement)
exports.getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll();
        res.json(users);
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

// Supprimer un utilisateur (admin seulement)
exports.deleteUser = async (req, res) => {
    const { id } = req.params;
    try {
        const deleted = await User.delete(id);
        if (!deleted) return res.status(404).json({ message: 'Utilisateur non trouvé' });
        res.json({ message: 'Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur' });
    }
};

exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { nom_complet } = req.body;
    const query = `UPDATE users SET nom_complet = COALESCE($1, nom_complet) WHERE id = $2 RETURNING id, email, role, nom_complet`;
    const values = [nom_complet, userId];
    const { rows } = await pool.query(query, values);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(userId);
    const isValid = await User.comparePassword(currentPassword, user.password);
    if (!isValid) return res.status(401).json({ message: 'Mot de passe actuel incorrect' });
    const hashed = await bcrypt.hash(newPassword, 10);
    await pool.query('UPDATE users SET password = $1 WHERE id = $2', [hashed, userId]);
    res.json({ message: 'Mot de passe modifié' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


exports.getMyFullProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'Utilisateur non trouvé' });

    let extraData = {};
    if (user.role === 'parent' && user.student_id) {
      // Récupérer les infos de l'élève lié
      const student = await pool.query(`
        SELECT s.*, 
          (SELECT json_agg(json_build_object('year_label', y.label, 'class_name', c.name, 'enrollment_id', e.id))
           FROM enrollments e
           JOIN classes c ON e.class_id = c.id
           JOIN years y ON e.year_id = y.id
           WHERE e.student_id = s.id
          ) as enrollments
        FROM students s
        WHERE s.id = $1
      `, [user.student_id]);
      extraData.student = student.rows[0];
    } else if (user.role === 'admin' || user.role === 'comptable' || user.role === 'secretariat') {
      // Récupérer le contrat de paie si existant (via admin_contracts)
      const contract = await pool.query(`
        SELECT ac.*, y.label as year_label
        FROM admin_contracts ac
        JOIN years y ON ac.year_id = y.id
        WHERE ac.user_id = $1 AND y.is_current = true
        LIMIT 1
      `, [userId]);
      extraData.currentContract = contract.rows[0];
    }

    res.json({ user, ...extraData });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: err.message });
  }
};