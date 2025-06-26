import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

const { Pool } = pkg;

dotenv.config();

const app = express();
const PORT = process.env.PORT || 2345;

const PASS_CODE = process.env.TEACHER_PASSCODE || 'PASSWORD'

// Database connection
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  user: process.env.DB_USER || 'user',
  password: process.env.DB_PASSWORD || 'password',
  database: process.env.DB_NAME || 'my_db',
});

// Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
    },
  },
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173/',
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());

// Rate limiting for login endpoint
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/login', loginLimiter);

// Initialize database
const initDb = async () => {
  try {
    await pool.query(`
      -----------------------------------------------------------------------
      -- 1) users_new table: minimal user info
      -----------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS users_new (
        id SERIAL PRIMARY KEY,
        email VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        first_name VARCHAR(100) NOT NULL,
        last_name VARCHAR(100) NOT NULL,
        role VARCHAR(10) NOT NULL CHECK (role IN ('teacher', 'student')),
        teacher_code VARCHAR(50), -- Added for teacher verification
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -----------------------------------------------------------------------
      -- 2) student_profiles: holds all questionnaire data linked to user ID
      -----------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS student_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users_new(id) ON DELETE CASCADE,
        email VARCHAR(100),
        telegram VARCHAR(100),
        birthday DATE,
        citizenship VARCHAR(100),
        phone VARCHAR(50),
        faculty VARCHAR(100),
        program VARCHAR(100),
        year INTEGER CHECK (year BETWEEN 1 AND 6),
        debts VARCHAR(100),
        edu_rating VARCHAR(50),
        digitalliteracyscore VARCHAR(20),
        pythonscore VARCHAR(20),
        dataanalysisscore VARCHAR(20),
        primary_discipline VARCHAR(100),
        primary_group_size INTEGER,
        secondary_discipline VARCHAR(100),
        secondary_group_size INTEGER,
        data_analysis_answers TEXT[],
        python_programming_answers TEXT[],
        machine_learning_answers TEXT[],
        digital_literacy_answers TEXT[],
        motivation_text TEXT,
        achievements TEXT,
        experience TEXT,
        recommendation_available BOOLEAN DEFAULT false,
        teacher_email VARCHAR(255),
        questionnaire_completed BOOLEAN DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );

      -----------------------------------------------------------------------
      -- 3) bookings: info about which students are booked by which teachers
      -----------------------------------------------------------------------
      CREATE TABLE IF NOT EXISTS bookings (
        id SERIAL PRIMARY KEY,
        student_id INTEGER REFERENCES users_new(id) ON DELETE CASCADE,
        teacher_id INTEGER REFERENCES users_new(id) ON DELETE CASCADE,
        discipline VARCHAR(100) CHECK (
          discipline IN (
            'data_analysis',
            'python_programming',
            'machine_learning',
            'digital_literacy'
          )
        ),
        groups_count INTEGER CHECK (groups_count IN (1, 2)),
        assistance_format VARCHAR(100) CHECK (assistance_format IN ('money', 'credits')),
        start_date DATE NOT NULL,
        end_date DATE NOT NULL CHECK (end_date >= start_date),
        -- prog_faculty VARCHAR(255) NOT NULL,
        program VARCHAR(255) NOT NULL,
        active BOOLEAN DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    console.log('Database tables created (or already exist) successfully!');
  } catch (error) {
    console.error('Error initializing database:', error);
    process.exit(1);
  }
};

const sendErrorResponse = (res, status, message) => {
  res.status(status).json({ success: false, message });
};

// User Registration
const registerUser = async (userData) => {
  const { email, password, firstName, lastName, role, teacherCode } = userData;
  
  const existingUser = await pool.query(
    'SELECT * FROM users_new WHERE email = $1',
    [email]
  );

  if (existingUser.rows.length > 0) {
    throw new Error('User already exists');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const query = `
    INSERT INTO users_new (email, password, first_name, last_name, role) 
    VALUES ($1, $2, $3, $4, $5) 
    RETURNING id, email, first_name, last_name, role
  `;
  const values = [email, hashedPassword, firstName, lastName, role];

  const result = await pool.query(query, values);

  if (role !== 'teacher') {
    const studentId = result.rows[0].id;
    await pool.query(
      `INSERT INTO student_profiles (user_id, questionnaire_completed) 
       VALUES ($1, FALSE)`,
      [studentId]
    );
  }

  return result.rows[0];
};

// API Routes
app.get('/api/validate-session', async (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return sendErrorResponse(res, 401, 'Токен не предоставлен');
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'default_secret');
    return res.status(200).json({ success: true, message: 'Сессия действительна', user: decoded });
  } catch (error) {
    return sendErrorResponse(res, 401, 'Недействительный или истёкший токен');
  }
});

app.post('/api/register', async (req, res) => {
  try {
    const { email, password, first_name, last_name, role, teacher_code } = req.body;

    // Validate required fields
    if (!email || !password || !first_name || !last_name || !role) {
      return sendErrorResponse(res, 400, 'Все поля обязательны');
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return sendErrorResponse(res, 400, 'Неверный формат почты');
    }

    // Validate password length
    if (password.length < 6) {
      return sendErrorResponse(res, 400, 'Пароль должен быть не менее 6 символов');
    }

    // Validate role
    if (!['teacher', 'student'].includes(role)) {
      return sendErrorResponse(res, 400, 'Указана недопустимая роль');
    }

    // Validate teacher_code for teachers
    if (role === 'teacher' && (!teacher_code || teacher_code !== PASS_CODE)) {
      return sendErrorResponse(res, 400, 'Неверный код преподавателя');
    }

    const user = await registerUser({
      email,
      password,
      firstName: first_name,
      lastName: last_name,
      role,
      teacherCode: teacher_code,
    });

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.status(201).json({ success: true, ...user, token });
  } catch (error) {
    console.error('Ошибка регистрации:', error);
    if (error.message.includes('already exists') || error.code === '23505') {
      return sendErrorResponse(res, 409, 'Пользователь с этой почтой уже существует');
    }
    return sendErrorResponse(res, 500, 'Ошибка при регистрации. Попробуйте снова.');
  }
});

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return sendErrorResponse(res, 400, 'Электронная почта и пароль обязательны');
    }

    const result = await pool.query('SELECT * FROM users_new WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Пользователь не найден');
    }

    const user = result.rows[0];
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return sendErrorResponse(res, 401, 'Неверный логин или пароль');
    }

    const { password: _, ...userWithoutPassword } = user;

    const token = jwt.sign(
      { id: userWithoutPassword.id, email: userWithoutPassword.email, role: userWithoutPassword.role },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1h' }
    );

    res.json({ success: true, ...userWithoutPassword, token });
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return sendErrorResponse(res, 500, 'Ошибка при входе. Попробуйте снова.');
  }
});

app.get('/api/students/:studentId/questionnaire', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query(
      'SELECT questionnaire_completed FROM student_profiles WHERE user_id = $1',
      [studentId]
    );
    if (result.rows.length === 0) {
      return res.json({ success: true, questionnaire_completed: false });
    }
    res.json({ success: true, ...result.rows[0] });
  } catch (error) {
    console.error('Ошибка получения статуса анкеты:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении статуса анкеты');
  }
});

app.post('/api/students/:studentId/questionnaire', async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId } = req.params;
    const {
      email,
      telegram,
      birthday,
      citizenship,
      phone,
      faculty,
      program,
      year,
      debts,
      edu_rating,
      primaryDiscipline,
      primaryGroupSize,
      secondaryDiscipline,
      secondaryGroupSize,
      motivationText,
      achievements,
      experience,
      recommendationAvailable,
      teacherEmail,
      dataAnalysisAnswers,
      pythonProgrammingAnswers,
      machineLearningAnswers,
      digitalLiteracyAnswers,
      digitalliteracyscore,
      pythonscore,
      dataanalysisscore
    } = req.body;
    
    await client.query('BEGIN');

    const transformScore = (score) => {
      if (score === null || score === undefined) return null;
      return score.toString();
    };

    await client.query(`
      UPDATE student_profiles
      SET
        email = $1,
        telegram = $2,
        birthday = $3,
        citizenship = $4,
        phone = $5,
        faculty = $6,
        program = $7,
        year = $8,
        debts = $9,
        edu_rating = $10,
        primary_discipline = $11,
        primary_group_size = $12,
        secondary_discipline = $13,
        secondary_group_size = $14,
        motivation_text = $15,
        achievements = $16,
        experience = $17,
        recommendation_available = CASE WHEN $18 = 'yes' THEN true WHEN $18 = 'no' THEN false ELSE recommendation_available END,
        teacher_email = $19,
        questionnaire_completed = true,
        data_analysis_answers = $20,
        python_programming_answers = $21,
        machine_learning_answers = $22,
        digital_literacy_answers = $23,
        digitalliteracyscore = $24,
        pythonscore = $25,
        dataanalysisscore = $26
      WHERE user_id = $27
    `, [
      email || null,
      telegram || null,
      birthday || null,
      citizenship || null,
      phone || null,
      faculty || null,
      program || null,
      year || null,
      debts || null,
      edu_rating || null,
      primaryDiscipline || null,
      primaryGroupSize || null,
      secondaryDiscipline || null,
      secondaryGroupSize || null,
      motivationText || null,
      achievements || null,
      experience || null,
      recommendationAvailable || null,
      teacherEmail || null,
      dataAnalysisAnswers || null,
      pythonProgrammingAnswers || null,
      machineLearningAnswers || null,
      digitalLiteracyAnswers || null,
      transformScore(digitalliteracyscore),
      transformScore(pythonscore),
      transformScore(dataanalysisscore),
      studentId
    ]);

    await client.query('COMMIT');
    return res.json({ success: true });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Ошибка сохранения данных анкеты:', error);
    return sendErrorResponse(res, 500, 'Ошибка при сохранении данных анкеты');
  } finally {
    client.release();
  }
});

// Faculties endpoint for filtering
app.get('/api/faculties', async (req, res) => {
  try {
    const { program } = req.query;
    let query, queryParams = [];
    if (program) {
      query = 'SELECT DISTINCT faculty FROM student_profiles WHERE faculty IS NOT NULL AND program = $1 ORDER BY faculty';
      queryParams = [program];
    } else {
      query = 'SELECT DISTINCT faculty FROM student_profiles WHERE faculty IS NOT NULL ORDER BY faculty';
    }
    const result = await pool.query(query, queryParams);
    res.json({ success: true, faculties: result.rows.map(r => r.faculty).filter(Boolean) });
  } catch (error) {
    console.error('Ошибка получения факультетов:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении списка факультетов');
  }
});

app.get('/api/programs', async (req, res) => {
  try {
    const { faculty } = req.query;
    let query, queryParams = [];
    if (faculty) {
      query = 'SELECT DISTINCT program FROM student_profiles WHERE program IS NOT NULL AND faculty = $1 ORDER BY program';
      queryParams = [faculty];
    } else {
      query = 'SELECT DISTINCT program FROM student_profiles WHERE program IS NOT NULL ORDER BY program';
    }
    const result = await pool.query(query, queryParams);
    res.json({ success: true, programs: result.rows.map(r => r.program).filter(Boolean) });
  } catch (error) {
    console.error('Ошибка получения программ:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении списка программ');
  }
});

app.get('/api/students', async (req, res) => {
  try {
    const { search, faculty, rating, discipline, program } = req.query;
    let query = `
      WITH student_bookings AS (
        SELECT 
            student_id,
            json_agg(
                json_build_object(
                    'program', program,
                    'groups', groups_count
                )
            ) as program_details,
            COUNT(DISTINCT program) as program_count,
            SUM(groups_count) as total_groups
        FROM (
            SELECT 
                student_id,
                program,
                SUM(groups_count) as groups_count
            FROM bookings
            WHERE active = true
            GROUP BY student_id, program
        ) sub
        GROUP BY student_id
      )
      SELECT
          un.id AS id,
          un.first_name,
          un.last_name,
          sp.email,
          sp.telegram,
          sp.birthday,
          sp.citizenship,
          sp.phone,
          sp.faculty,
          sp.program as edu_program,
          sp.year,
          sp.debts,
          sp.edu_rating,
          sp.digitalliteracyscore,
          sp.pythonscore,
          sp.dataanalysisscore,
          sp.primary_discipline,
          sp.primary_group_size,
          sp.secondary_discipline,
          sp.secondary_group_size,
          sp.digital_literacy_answers,
          sp.data_analysis_answers,
          sp.python_programming_answers,
          sp.machine_learning_answers,
          sp.motivation_text,
          sp.achievements,
          sp.experience,
          sp.teacher_email,
          COALESCE(sb.program_details, '[]'::json) as booked_programs
      FROM users_new un
      JOIN student_profiles sp ON un.id = sp.user_id
      LEFT JOIN student_bookings sb ON un.id = sb.student_id
      WHERE un.role = 'student'
      AND sp.questionnaire_completed = true
      AND (
        sb.student_id IS NULL 
        OR (sb.program_count <= 2 and sb.total_groups < 4)
      )
    `;
    const queryParams = [];
    if (search) {
      queryParams.push(`%${search}%`);
      query += ` AND (LOWER(un.first_name) LIKE LOWER($${queryParams.length}) OR LOWER(un.last_name) LIKE LOWER($${queryParams.length}))`;
    }
    if (faculty) {
      queryParams.push(faculty);
      query += ` AND sp.faculty = $${queryParams.length}`;
    }
    if (program) {
      queryParams.push(program);
      query += ` AND sp.program = $${queryParams.length}`;
    }
    if (rating) {
      queryParams.push(parseFloat(rating));
      query += ` AND sp.edu_rating >= $${queryParams.length}`;
    }
    if (discipline) {
      queryParams.push(discipline);
      query += ` AND ($${queryParams.length} = sp.primary_discipline OR $${queryParams.length} = sp.secondary_discipline OR sp.secondary_discipline is NULL)`;
    }
    const result = await pool.query(query, queryParams);
    res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Ошибка получения списка студентов:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении списка студентов');
  }
});

app.get('/api/teachers/:teacherId/students', async (req, res) => {
  try {
    const { teacherId } = req.params;
    const result = await pool.query(`
      SELECT 
        un.id AS id,
        b.discipline,
        -- b.prog_faculty,
        b.program,
        b.groups_count,
        b.assistance_format,
        b.start_date,
        b.end_date,
        un.first_name, un.last_name, 
        sp.email, sp.telegram , sp.birthday, sp.citizenship, sp.phone, 
        sp.faculty, sp.program as edu_program, sp.year, sp.debts, sp.edu_rating,
        sp.digitalliteracyscore,
        sp.pythonscore,
        sp.dataanalysisscore,
        sp.primary_discipline, sp.primary_group_size,
        sp.secondary_discipline, sp.secondary_group_size, 
        sp.digital_literacy_answers, sp.data_analysis_answers, sp.python_programming_answers, sp.machine_learning_answers, 
        sp.motivation_text, sp.achievements, sp.experience,
        sp.teacher_email,
        b.id as booking_id 
      from bookings b
      left join users_new un on b.student_id = un.id
      left join student_profiles sp on un.id = sp.user_id
      where b.teacher_id = $1 and b.active = true;
    `, [teacherId]);
    res.json({ success: true, students: result.rows });
  } catch (error) {
    console.error('Ошибка получения студентов преподавателя:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении списка студентов');
  }
});

app.get('/api/students/:studentId/disciplines', async (req, res) => {
  try {
    const { studentId } = req.params;
    
    const result = await pool.query(`  
      SELECT 
        b.id,
        t.first_name AS teacher_first_name,
        t.last_name  AS teacher_last_name,
        t.email AS teacher_email,
        b.discipline,
        b.groups_count,
        b.assistance_format,
        b.start_date,
        b.end_date,
        b.program
      FROM bookings b
      JOIN users_new t ON b.teacher_id = t.id
      WHERE b.student_id = $1 AND b.active = true;
    `, [studentId]);
    res.json({ success: true, disciplines: result.rows });
  } catch (error) {
    console.error('Ошибка получения дисциплин студента:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении списка дисциплин');
  }
});

app.post('/api/bookings', async (req, res) => {
  try {
    const { studentId, teacherId, discipline, groupsCount, assistanceFormat, startDate, endDate, program } = req.body;
    
    if (!startDate || !endDate) {
      return sendErrorResponse(res, 400, 'Укажите даты начала и окончания');
    }

    if (!program) {
      return sendErrorResponse(res, 400, 'Укажите образовательную программу');
    }

    const start = new Date(startDate);
    const end = new Date(endDate);
    if (end < start) {
      return sendErrorResponse(res, 400, 'Дата окончания не может быть раньше даты начала');
    }

    // Check existing bookings for the same student, discipline and program
    const existingBookings = await pool.query(
      `SELECT SUM(groups_count) as total_groups
       FROM bookings
       WHERE student_id = $1 
       AND discipline = $2 
       AND program = $3
       AND active = true`,
      [studentId, discipline, program]
    );

    const currentGroups = parseInt(existingBookings.rows[0].total_groups) || 0;
    if (currentGroups + groupsCount > 2) {
      const availableGroups = 2 - currentGroups;
      return sendErrorResponse(res, 400, `Студент уже имеет ${currentGroups} групп для данной дисциплины и программы. Доступно для бронирования: ${availableGroups} ${availableGroups === 1 ? 'группа' : 'группы'}`);
    }

    const result = await pool.query(
      `INSERT INTO bookings (student_id, teacher_id, discipline, groups_count, assistance_format, start_date, end_date, program)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [studentId, teacherId, discipline, groupsCount, assistanceFormat, startDate, endDate, program]
    );
    
    res.status(201).json({ success: true, booking: result.rows[0] });
  } catch (error) {
    console.error('Ошибка бронирования ассистента:', error);
    return sendErrorResponse(res, 500, 'Ошибка при бронировании ассистента');
  }
});

app.delete('/api/bookings/:bookingId', async (req, res) => {
  try {
    const { bookingId } = req.params;
    await pool.query('UPDATE bookings SET active = false WHERE id = $1', [bookingId]);
    res.json({ success: true, message: 'Бронирование успешно удалено' });
  } catch (error) {
    console.error('Ошибка удаления бронирования:', error);
    return sendErrorResponse(res, 500, 'Ошибка при удаления бронирования');
  }
});

app.get('/api/users/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const result = await pool.query(
      'SELECT id, email, first_name, last_name, role FROM users_new WHERE id = $1',
      [userId]
    );
    
    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Пользователь не найден');
    }
    res.json({ success: true, user: result.rows[0] });
  } catch (error) {
    console.error('Ошибка получения профиля пользователя:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении профиля пользователя');
  }
});

app.put('/api/users/:userId', async (req, res) => {
  const client = await pool.connect();
  try {
    const { userId } = req.params;
    const { email, password, first_name, last_name } = req.body;
    
    await client.query('BEGIN');

    let hashedPassword = null;
    if (password) {
      const salt = await bcrypt.genSalt(10);
      hashedPassword = await bcrypt.hash(password, salt);
    }

    const updateFields = [];
    const values = [];
    let valueCount = 1;

    if (email) {
      updateFields.push(`email = $${valueCount}`);
      values.push(email);
      valueCount++;
    }

    if (hashedPassword) {
      updateFields.push(`password = $${valueCount}`);
      values.push(hashedPassword);
      valueCount++;
    }

    if (first_name) {
      updateFields.push(`first_name = $${valueCount}`);
      values.push(first_name);
      valueCount++;
    }

    if (last_name) {
      updateFields.push(`last_name = $${valueCount}`);
      values.push(last_name);
      valueCount++;
    }

    values.push(userId);

    if (updateFields.length > 0) {
      const query = `
        UPDATE users_new 
        SET ${updateFields.join(', ')}
        WHERE id = $${valueCount}
        RETURNING id, email, first_name, last_name, role
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendErrorResponse(res, 404, 'Пользователь не найден');
      }

      await client.query('COMMIT');
      res.json({ success: true, user: result.rows[0] });
    } else {
      await client.query('ROLLBACK');
      res.status(400).json({ message: 'No fields to update' });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    return sendErrorResponse(res, 500, 'Ошибка при обновлении профиля пользователя');
  } finally {
    client.release();
  }
});

app.get('/api/students/:studentId/profile', async (req, res) => {
  try {
    const { studentId } = req.params;
    const result = await pool.query(
      'SELECT * FROM student_profiles WHERE user_id = $1',
      [studentId]
    );
    
    if (result.rows.length === 0) {
      return sendErrorResponse(res, 404, 'Профиль студента не найден');
    }
    res.json({ success: true, profile: result.rows[0] });
  } catch (error) {
    console.error('Ошибка получения профиля студента:', error);
    return sendErrorResponse(res, 500, 'Ошибка при получении профиля студента');
  }
});

app.put('/api/students/:studentId/profile', async (req, res) => {
  const client = await pool.connect();
  try {
    const { studentId } = req.params;
    const { section, ...updateData } = req.body;
    
    await client.query('BEGIN');

    const sectionFields = {
      personal: ['email', 'telegram', 'birthday', 'citizenship', 'phone'],
      education: ['faculty', 'program', 'year', 'debts', 'edu_rating'],
      disciplines: ['primary_discipline', 'primary_group_size', 'secondary_discipline', 'secondary_group_size'],
      motivation: ['motivation_text', 'achievements', 'experience'],
      recommendation: ['recommendation_available', 'teacher_email']
    };

    const fields = sectionFields[section] || [];
    const updateFields = [];
    const values = [];
    let valueCount = 1;

    fields.forEach(field => {
      if (updateData[field] !== undefined) {
        updateFields.push(`${field} = $${valueCount}`);
        values.push(updateData[field]);
        valueCount++;
      }
    });

    values.push(studentId);

    if (updateFields.length > 0) {
      const query = `
        UPDATE student_profiles 
        SET ${updateFields.join(', ')}
        WHERE user_id = $${valueCount}
        RETURNING *
      `;

      const result = await client.query(query, values);
      
      if (result.rows.length === 0) {
        await client.query('ROLLBACK');
        return sendErrorResponse(res, 404, 'Профиль студента не найден');
      }

      await client.query('COMMIT');
      res.json(result.rows[0]);
    } else {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Обновлять нечего' });
    }
  } catch (error) {
    await client.query('ROLLBACK');
    return sendErrorResponse(res, 500, 'Ошибка при обновлении профиля');
  } finally {
    client.release();
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  return sendErrorResponse(res, 500, 'Что-то пошло не так');
});

// Start server
app.listen(PORT, async () => {
  await initDb();
  console.log(`Server running on http://localhost:${PORT}`);
});