-- Ensure the database exists and use it
CREATE DATABASE IF NOT EXISTS my_local_database;
USE my_local_database;

-- Table to store UCL buildings and accommodations
CREATE TABLE IF NOT EXISTS places (
    id INT AUTO_INCREMENT PRIMARY KEY,
    gmap_id VARCHAR(255) NOT NULL, -- Unique ID from Google Maps
    type ENUM('Buildings', 'Accommodation') NOT NULL, -- Place type
    display_name VARCHAR(255), -- Name of the place
    address TEXT, -- Address of the place
    location POINT NOT NULL, -- Latitude and longitude of the place
    UNIQUE KEY unique_gmap_id (gmap_id) -- Ensure gmap_id is unique
);

-- Table to store routes between buildings and accommodations
CREATE TABLE IF NOT EXISTS routes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    building_id INT NOT NULL, -- Foreign key to the buildings
    accommodation_id INT NOT NULL, -- Foreign key to the accommodations
    duration INT NOT NULL, -- Travel duration in seconds
    distance_meters INT NOT NULL, -- Distance in meters
    encoded_polyline TEXT NOT NULL, -- Encoded polyline for the route
    FOREIGN KEY (building_id) REFERENCES places(id),
    FOREIGN KEY (accommodation_id) REFERENCES places(id),
    INDEX (building_id), -- Index for foreign key
    INDEX (accommodation_id) -- Index for foreign key
);
