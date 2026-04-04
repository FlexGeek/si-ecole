const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Middlewares globaux
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static('uploads'));

// Import des routes (on les créera plus tard)
const authRoutes = require('./routes/authRoutes');
const yearRoutes = require('./routes/yearRoutes');
const classRoutes = require('./routes/classRoutes');
const studentRoutes = require('./routes/studentRoutes');
const enrollmentRoutes = require('./routes/enrollmentRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const periodRoutes = require('./routes/periodRoutes');
const gradeRoutes = require('./routes/gradeRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
// const cardRoutes = require('./routes/cardRoutes');
const teacherRoutes = require('./routes/teacherRoutes');
const payrollRoutes = require('./routes/payrollRoutes');
const adminStaffRoutes = require('./routes/adminStaffRoutes');
const adminPayrollRoutes = require('./routes/adminPayrollRoutes');
const absenceRoutes = require('./routes/absenceRoutes');
const timetableRoutes = require('./routes/timetableRoutes');
// const reportRoutes = require('./routes/reportRoutes');

// Utilisation des routes
app.use('/api/auth', authRoutes);
app.use('/api/years', yearRoutes);
app.use('/api/classes', classRoutes);
app.use('/api/students', studentRoutes);
app.use('/api/enrollments', enrollmentRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/periods', periodRoutes);
app.use('/api/grades', gradeRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/payroll', payrollRoutes);
// app.use('/api/cards', cardRoutes);
app.use('/api/teachers', teacherRoutes);
app.use('/api/admin-payroll', payrollRoutes);
app.use('/api/admin-staff', adminStaffRoutes);
app.use('/api/absences', absenceRoutes);
app.use('/api/timetables', timetableRoutes);

app.use('/api/admin-payroll', adminPayrollRoutes);
// app.use('/api/reports', reportRoutes);

// Route 404
app.use((req, res) => {
  res.status(404).json({ message: 'Route non trouvée' });
});

// Middleware d'erreur global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Erreur serveur', error: err.message });
});

module.exports = app;



// curl -X POST http://localhost:5001/api/periods \
//   -H "Content-Type: application/json" \
//   -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJhZG1pbkBlY29sZS5jb20iLCJyb2xlIjoiYWRtaW4iLCJpYXQiOjE3NzU2NDk4MTksImV4cCI6MTc3NjI1NDYxOX0.fVKJWULndtR8-iN-MraCBbDGBnHJm-q5buMscG9ljUE" \
//   -d '{"year_id":1,"name":"Trimestre 1","start_date":"2024-09-01","end_date":"2024-12-20"}'