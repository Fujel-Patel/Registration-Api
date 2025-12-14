import express from 'express';
import mysql from 'mysql2';
import cors from 'cors';
import bcrypt from 'bcryptjs';

const app = express();

// Middleware
app.use(cors());
app.use(express.json({
    origin: "https://poetic-pudding-65616c.netlify.app/"
}));

// Database connection
const db = mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'registration_db'
});

db.connect((err) => {
    if (err) {
        console.error('Database connection failed:', err);
        return;
    }
    console.log('Connected to MySQL database');
    
    // Create users table if not exists
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            full_name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone VARCHAR(20) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    db.query(createTableQuery, (err) => {
        if (err) console.error('Table creation error:', err);
        else console.log('Users table ready');
    });
});

// Validation function
const validateInput = (fullName, email, password, phone) => {
    if (!fullName || fullName.trim().length < 2) {
        return 'Full name must be at least 2 characters';
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return 'Invalid email format';
    }
    
    if (!password || password.length < 6) {
        return 'Password must be at least 6 characters';
    }
    
    const phoneRegex = /^[0-9]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/[\s-]/g, ''))) {
        return 'Invalid phone number';
    }
    
    return null;
};

// Registration endpoint
app.post('/api/register', async (req, res) => {
    const { fullName, email, password, phone } = req.body;
    
    // Validate input
    const validationError = validateInput(fullName, email, password, phone);
    if (validationError) {
        return res.status(400).json({ message: validationError });
    }
    
    try {
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insert user
        const query = 'INSERT INTO users (full_name, email, password, phone) VALUES (?, ?, ?, ?)';
        
        db.query(query, [fullName, email, hashedPassword, phone], (err, result) => {
            if (err) {
                if (err.code === 'ER_DUP_ENTRY') {
                    return res.status(400).json({ message: 'Email already registered' });
                }
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Registration failed' });
            }
            
            res.status(201).json({ 
                message: 'Registration successful',
                userId: result.insertId 
            });
        });
    } catch (error) {
        console.error('Server error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'OK' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});