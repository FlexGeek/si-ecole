const pool = require('../config/db');

class Enrollment {
static async findAll() {
  const query = `
    SELECT e.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
    FROM enrollments e
    JOIN students s ON e.student_id = s.id
    JOIN classes c ON e.class_id = c.id
    JOIN years y ON e.year_id = y.id
    ORDER BY e.id DESC
  `;
  const { rows } = await pool.query(query);
  return rows;
}

    static async findById(id) {
        const query = `
            SELECT e.*, s.first_name, s.last_name, c.name as class_name, y.label as year_label
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            WHERE e.id = $1
        `;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    static async findByStudent(studentId) {
        const query = `
            SELECT e.*, c.name as class_name, y.label as year_label
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            JOIN years y ON e.year_id = y.id
            WHERE e.student_id = $1
            ORDER BY y.start_date DESC
        `;
        const { rows } = await pool.query(query, [studentId]);
        return rows;
    }

    static async findByClassAndYear(classId, yearId) {
        const query = `
            SELECT e.*, s.first_name, s.last_name
            FROM enrollments e
            JOIN students s ON e.student_id = s.id
            WHERE e.class_id = $1 AND e.year_id = $2
            ORDER BY s.last_name, s.first_name
        `;
        const { rows } = await pool.query(query, [classId, yearId]);
        return rows;
    }

    static async create({ student_id, class_id, year_id, enrollment_date, status }) {
        const query = `
            INSERT INTO enrollments (student_id, class_id, year_id, enrollment_date, status)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING *
        `;
        const values = [student_id, class_id, year_id, enrollment_date || new Date(), status || 'actif'];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async update(id, { class_id, year_id, enrollment_date, status }) {
        const query = `
            UPDATE enrollments
            SET class_id = COALESCE($1, class_id),
                year_id = COALESCE($2, year_id),
                enrollment_date = COALESCE($3, enrollment_date),
                status = COALESCE($4, status)
            WHERE id = $5
            RETURNING *
        `;
        const values = [class_id, year_id, enrollment_date, status, id];
        const { rows } = await pool.query(query, values);
        return rows[0];
    }

    static async delete(id) {
        const query = `DELETE FROM enrollments WHERE id = $1 RETURNING id`;
        const { rows } = await pool.query(query, [id]);
        return rows[0];
    }

    // Promotion massive : réinscrire tous les élèves d'une année dans la classe supérieure
    static async promoteAll(fromYearId, toYearId) {
        // Récupérer les inscriptions de l'année source
        const enrollments = await pool.query(`
            SELECT e.student_id, c.level_order, c.id as class_id
            FROM enrollments e
            JOIN classes c ON e.class_id = c.id
            WHERE e.year_id = $1 AND e.status = 'actif'
        `, [fromYearId]);
        
        const results = [];
        for (const e of enrollments.rows) {
            // Chercher la classe de niveau supérieur (level_order + 1)
            const nextClass = await pool.query(`
                SELECT id FROM classes WHERE level_order = $1 LIMIT 1
            `, [e.level_order + 1]);
            const newClassId = nextClass.rows[0] ? nextClass.rows[0].id : e.class_id; // si pas de supérieur, reste même classe (redoublement)
            
            // Créer la nouvelle inscription
            const newEnrollment = await pool.query(`
                INSERT INTO enrollments (student_id, class_id, year_id, status)
                VALUES ($1, $2, $3, 'actif')
                ON CONFLICT (student_id, year_id) DO NOTHING
                RETURNING *
            `, [e.student_id, newClassId, toYearId]);
            if (newEnrollment.rows[0]) results.push(newEnrollment.rows[0]);
        }
        return results;
    }
}

module.exports = Enrollment;