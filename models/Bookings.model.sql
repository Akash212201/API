CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    train_id INT NOT NULL,
    seat_number INT NOT NULL,
    booking_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (train_id) REFERENCES trains(id),
    UNIQUE (train_id, seat_number)
);
