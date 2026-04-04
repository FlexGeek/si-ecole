-- =====================================================
-- Script d'initialisation complet pour PostgreSQL
-- Base de données : gestion_ecole
-- Auteur : Généré pour le projet Mali
-- Date : 2026-04-08
-- =====================================================

-- -----------------------------------------------------
-- 1. Années scolaires
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS years (
    id SERIAL PRIMARY KEY,
    label VARCHAR(50) NOT NULL UNIQUE,   -- ex: '2024-2025'
    start_date DATE,
    end_date DATE,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 2. Classes (niveaux)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS classes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    level_order INTEGER NOT NULL,        -- pour le passage automatique (1,2,3...)
    fees DECIMAL(10,2) DEFAULT 0,        -- frais annuels par défaut (optionnel)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 3. Élèves
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    photo_url VARCHAR(255),              -- chemin de la photo
    parent_phone VARCHAR(50),
    parent_email VARCHAR(255),
    address TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 4. Inscriptions annuelles (élève + classe + année)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS enrollments (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(id),
    year_id INTEGER NOT NULL REFERENCES years(id),
    enrollment_date DATE DEFAULT CURRENT_DATE,
    status VARCHAR(50) DEFAULT 'actif',   -- actif, suspendu, diplômé, transféré
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, year_id)           -- un élève ne peut être inscrit qu'une fois par année
);

-- -----------------------------------------------------
-- 5. Matières (associées à une classe)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    coefficient DECIMAL(5,2) NOT NULL DEFAULT 1.0,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 6. Périodes d'évaluation (trimestres/semestres)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS periods (
    id SERIAL PRIMARY KEY,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    name VARCHAR(50) NOT NULL,            -- 'Trimestre 1', 'Semestre 1', etc.
    start_date DATE,
    end_date DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 7. Notes (évaluations multiples)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS grades (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    period_id INTEGER NOT NULL REFERENCES periods(id) ON DELETE CASCADE,
    evaluation_name VARCHAR(100) NOT NULL,  -- 'Devoir 1', 'Examen final', etc.
    evaluation_date DATE,
    value DECIMAL(5,2) NOT NULL CHECK (value >= 0 AND value <= 20), -- note sur 20
    evaluation_coefficient DECIMAL(5,2) DEFAULT 1.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 8. Échéanciers de paiement (pour les élèves)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payment_schedules (
    id SERIAL PRIMARY KEY,
    class_id INTEGER REFERENCES classes(id) ON DELETE CASCADE,
    year_id INTEGER REFERENCES years(id) ON DELETE CASCADE,
    description VARCHAR(255) NOT NULL,    -- 'Mensualité janvier', 'Frais d'inscription'
    amount DECIMAL(10,2) NOT NULL,
    due_date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 9. Paiements effectués par les élèves
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payments (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    schedule_id INTEGER REFERENCES payment_schedules(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_date DATE NOT NULL,
    payment_method VARCHAR(50),           -- 'espèces', 'carte', 'virement'
    receipt_number VARCHAR(100) UNIQUE,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 10. Professeurs
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teachers (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    phone VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'actif',    -- actif, congé, démissionné
    photo_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 11. Contrats des professeurs (par année)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_contracts (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,    -- salaire mensuel de base
    contract_type VARCHAR(50),              -- CDI, vacataire, etc.
    hours_per_month INTEGER,                -- pour les vacataires
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, year_id)
);

-- -----------------------------------------------------
-- 12. Composants du salaire (primes, retenues)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS salary_components (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,      -- 'Salaire de base', 'Prime transport', 'CNSS'
    type VARCHAR(50) NOT NULL,              -- 'base', 'prime', 'deduction'
    is_percentage BOOLEAN DEFAULT false,    -- true = pourcentage du base, false = montant fixe
    value DECIMAL(10,2) NOT NULL,           -- montant ou pourcentage (ex: 5.00 pour 5%)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 13. Périodes de paie (mensuelles)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_periods (
    id SERIAL PRIMARY KEY,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    month INTEGER NOT NULL CHECK (month BETWEEN 1 AND 12),
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status VARCHAR(20) DEFAULT 'ouvert',    -- ouvert, clos
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(year_id, month)
);

-- -----------------------------------------------------
-- 14. Lignes de paie (par professeur et période)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS teacher_payroll (
    id SERIAL PRIMARY KEY,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) DEFAULT 0,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending',   -- pending, paid
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(teacher_id, payroll_period_id)
);

-- -----------------------------------------------------
-- 15. Détail des composants pour chaque ligne de paie
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS payroll_details (
    id SERIAL PRIMARY KEY,
    teacher_payroll_id INTEGER NOT NULL REFERENCES teacher_payroll(id) ON DELETE CASCADE,
    component_id INTEGER NOT NULL REFERENCES salary_components(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 16. Utilisateurs (pour l'application web)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL,              -- admin, comptable, secretariat, parent
    nom_complet VARCHAR(255),
    student_id INTEGER REFERENCES students(id) ON DELETE CASCADE, -- lien pour les parents
    teacher_id INTEGER REFERENCES teachers(id) ON DELETE CASCADE, -- lien pour les profs (optionnel)
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 17. Cartes étudiantes (générées)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS student_cards (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    qr_code TEXT,
    pdf_url VARCHAR(255),
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 18. Absences (optionnel, mais utile)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS absences (
    id SERIAL PRIMARY KEY,
    enrollment_id INTEGER NOT NULL REFERENCES enrollments(id) ON DELETE CASCADE,
    absence_date DATE NOT NULL,
    is_justified BOOLEAN DEFAULT false,
    justification TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- 19. Emplois du temps (simple version)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS timetables (
    id SERIAL PRIMARY KEY,
    class_id INTEGER NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    teacher_id INTEGER NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
    day_of_week INTEGER NOT NULL CHECK (day_of_week BETWEEN 1 AND 7), -- 1=lundi, 7=dimanche
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- -----------------------------------------------------
-- Index pour optimiser les requêtes fréquentes
-- -----------------------------------------------------
CREATE INDEX idx_enrollments_student ON enrollments(student_id);
CREATE INDEX idx_enrollments_class ON enrollments(class_id);
CREATE INDEX idx_enrollments_year ON enrollments(year_id);
CREATE INDEX idx_grades_student ON grades(student_id);
CREATE INDEX idx_grades_subject ON grades(subject_id);
CREATE INDEX idx_grades_period ON grades(period_id);
CREATE INDEX idx_payments_enrollment ON payments(enrollment_id);
CREATE INDEX idx_teacher_payroll_teacher ON teacher_payroll(teacher_id);
CREATE INDEX idx_teacher_payroll_period ON teacher_payroll(payroll_period_id);
CREATE INDEX idx_absences_enrollment ON absences(enrollment_id);
CREATE INDEX idx_timetables_class ON timetables(class_id);

-- -----------------------------------------------------
-- Insertion d'un administrateur par défaut
-- mot de passe : admin123 (à hacher avec bcrypt)
-- Pour l'instant on insère un placeholder, le mot de passe devra être haché
-- via l'application avant utilisation.
-- -----------------------------------------------------
INSERT INTO users (email, password, role, nom_complet)
VALUES ('admin@ecole.com', 'admin123', 'admin', 'Administrateur')
ON CONFLICT (email) DO NOTHING;

-- -----------------------------------------------------
-- Insertion d'un composant de salaire par défaut (exemple)
-- -----------------------------------------------------
INSERT INTO salary_components (name, type, is_percentage, value)
VALUES 
('Salaire de base', 'base', false, 0),
('Prime de transport', 'prime', false, 20000),
('CNSS (6%)', 'deduction', true, 6)
ON CONFLICT (name) DO NOTHING;



-- -----------------------------------------------------
-- 20. Personnel administratif (pour la paie)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    birth_date DATE,
    phone VARCHAR(50),
    address TEXT,
    hire_date DATE,
    status VARCHAR(50) DEFAULT 'actif',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id)
);

-- -----------------------------------------------------
-- 21. Contrats du personnel administratif (par année)
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_contracts (
    id SERIAL PRIMARY KEY,
    admin_staff_id INTEGER NOT NULL REFERENCES admin_staff(id) ON DELETE CASCADE,
    year_id INTEGER NOT NULL REFERENCES years(id) ON DELETE CASCADE,
    base_salary DECIMAL(10,2) NOT NULL,
    contract_type VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_staff_id, year_id)
);

-- -----------------------------------------------------
-- 22. Lignes de paie pour le personnel administratif
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_payroll (
    id SERIAL PRIMARY KEY,
    admin_staff_id INTEGER NOT NULL REFERENCES admin_staff(id) ON DELETE CASCADE,
    payroll_period_id INTEGER NOT NULL REFERENCES payroll_periods(id) ON DELETE CASCADE,
    total_earnings DECIMAL(10,2) DEFAULT 0,
    total_deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) DEFAULT 0,
    payment_date DATE,
    status VARCHAR(20) DEFAULT 'pending',
    pdf_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(admin_staff_id, payroll_period_id)
);

-- -----------------------------------------------------
-- 23. Détails des composants pour la paie administrative
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS admin_payroll_details (
    id SERIAL PRIMARY KEY,
    admin_payroll_id INTEGER NOT NULL REFERENCES admin_payroll(id) ON DELETE CASCADE,
    component_id INTEGER NOT NULL REFERENCES salary_components(id),
    amount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
-- -----------------------------------------------------
-- Fin du script
-- -----------------------------------------------------