const pool = require('../backend/src/config/db');
const bcrypt = require('bcryptjs');

const seed = async () => {
    const email = 'admin@admin.com';
    const password = 'admin';

    console.log('Connecting to database...');

    try {
        const hashedPassword = await bcrypt.hash(password, 10);

        const res = await pool.query(`
            INSERT INTO users (email, password) 
            VALUES ($1, $2) 
            ON CONFLICT (email) DO NOTHING
            RETURNING id
        `, [email, hashedPassword]);

        if (res.rows.length > 0) {
            console.log('✅ Admin user created successfully.');
        } else {
            console.log('ℹ️ Admin user already exists.');
        }

        console.log('-----------------------------------');
        console.log('Login Email: ' + email);
        console.log('Login Password: ' + password);
        console.log('-----------------------------------');

        process.exit();
    } catch (err) {
        console.error('❌ Error creating admin user:', err);
        process.exit(1);
    }
};

seed();
