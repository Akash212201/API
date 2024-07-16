const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const connection = require('../DB/db.js');

// Register User
exports.registerUser = async (req, resp) => {
    const { username, email, password } = req.body;

    try {
        if (!username || !email || !password) {
            return resp.status(400).json({
                success: false,
                message: 'Required details are missing'
            });
        }

        const [existingUser] = await connection.query('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);

        if (existingUser.length > 0) {
            if (existingUser[0].username === username) {
                return resp.status(400).json({
                    success: false,
                    message: 'Username already exists'
                });
            }
            if (existingUser[0].email === email) {
                return resp.status(400).json({
                    success: false,
                    message: 'Email already exists'
                });
            }
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await connection.query('INSERT INTO users (username, email, password, role) VALUES (?, ?, ?, ?)', [username, email, hashedPassword, 'user']);
        return resp.status(201).json({
            success: true,
            message: 'User registered successfully.'
        });
    } catch (error) {
        console.log(error,"h")
        return resp.status(500).json({
            success: false,
            message: 'Registration failed', 
            error
        });
    }
}

// Login User
exports.loginUser = async (req, resp) => {
    const { email, password } = req.body;

    try {
        const [users] = await connection.query('SELECT * FROM users WHERE email = ?', [email]);
        const user = users[0];

        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '24h' });
            return resp.status(201).json({
                success: true,
                msg: "User login Successful",
                token: token,
                user_id: user.id
            });
        } else {
            return resp.status(401).json({
                success: false,
                message: 'Invalid credentials.'
            });
        }
    } catch (error) {
        return resp.status(500).json({
            success: false,
            message: 'Login failed', 
            error: error
        });
    }
}

// Add Train
exports.addTrain = async (req, resp) => {
    const { train_name, source, destination, start_time, end_time, total_seats, no_of_stations } = req.body;

    try {
        await connection.query('INSERT INTO trains (name, source, destination, start_time, end_time, total_seats, no_of_stations) VALUES (?, ?, ?, ?, ?, ?, ?)', [train_name, source, destination, start_time, end_time, total_seats, no_of_stations]);
        resp.status(201).json({
            success: true,
            message: 'Train added successfully.'
        });
    } catch (error) {
        resp.status(500).json({
            success: false,
            message: 'Failed to add train', error
        });
    }
}

// Book Seat
exports.bookSeat = async (req, resp) => {
    const { train_id, source, destination, doj } = req.body;
    const user_id = req.user.id;

    try {
        await connection.query('START TRANSACTION');

        const [trains] = await connection.query('SELECT total_seats FROM trains WHERE id = ? FOR UPDATE', [train_id,source, destination, doj]);
        const train = trains[0];

        const [bookings] = await connection.query('SELECT COUNT(*) AS count FROM bookings WHERE train_id = ?', [train_id]);
        const bookedSeats = bookings[0].count;

        if (train.total_seats > bookedSeats) {
            const seat_number = bookedSeats + 1;
            await connection.query('INSERT INTO bookings (user_id, train_id, seat_number, booking_time) VALUES (?, ?, ?, ?)', [user_id, train_id, seat_number, new Date()]);
            await connection.query('COMMIT');
            resp.status(201).json({
                success: true,
                message: 'Seat booked successfully.', seat_number
            });
        } else {
            await connection.query('ROLLBACK');
            resp.status(400).json({
                success: false,
                message: 'No seats available.'
            });
        }
    } catch (error) {
        await connection.query('ROLLBACK');
        resp.status(500).json({
            success: false,
            message: 'Booking failed.', error
        });
    }
}

// Get Seat Information
exports.getSeatInfo = async (req, resp) => {
    const { train_id } = req.query;
    try {
        const [train] = await connection.query('SELECT total_seats FROM trains WHERE id = ?', [train_id]);
        const [bookedSeats] = await connection.query('SELECT COUNT(*) AS count FROM bookings WHERE train_id = ?', [train_id]);

        const availableSeats = train[0].total_seats - bookedSeats[0].count;

        resp.status(201).json({
            success: true,
            train_id: train_id,
            total_seats: train[0].total_seats,
            booked_seats: bookedSeats[0].count,
            available_seats: availableSeats
        });
    } catch (error) {
        resp.status(500).json({
            success: false,
            message: 'Failed to fetch seat information', error
        });
    }
}

// Get Booking Information
exports.getBookingInfo = async (req, resp) => {
    const { booking_id } = req.params;
    const user_id = req.user.id;

    try {
        const [booking] = await connection.query('SELECT * FROM bookings WHERE id = ? AND user_id = ?', [booking_id, user_id]);

        if (booking.length > 0) {
            resp.status(201).json({
                success: true,
                booking: booking[0],
            });
        } else {
            resp.status(404).json({
                success: false,
                message: 'Booking not found'
            });
        }
    } catch (error) {
        resp.status(500).json({
            success: false,
            message: 'Failed to fetch booking information', error
        });
    }
}
