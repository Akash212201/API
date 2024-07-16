CREATE TABLE trains (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    source VARCHAR(255) NOT NULL,
    destination VARCHAR(255) NOT NULL,
    total_seats INT NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    no_of_stations INT NOT NULL
);