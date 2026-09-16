-- PostgreSQL Schema for Ganesh Chaturthi Festival & Pandal Management System

CREATE TABLE IF NOT EXISTS pandals (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    organizer_name VARCHAR(150) NOT NULL,
    contact_number VARCHAR(20) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Pending', 'Completed')),
    budget NUMERIC(12, 2) NOT NULL DEFAULT 0.00 CHECK (budget >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS donations (
    id SERIAL PRIMARY KEY,
    pandal_id INT NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
    donor_name VARCHAR(150) NOT NULL,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_mode VARCHAR(50) NOT NULL CHECK (payment_mode IN ('UPI', 'Cash', 'Bank Transfer', 'Card')),
    receipt_number VARCHAR(100) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS puja_bookings (
    id SERIAL PRIMARY KEY,
    pandal_id INT NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
    devotee_name VARCHAR(150) NOT NULL,
    devotee_phone VARCHAR(20) NOT NULL,
    puja_type VARCHAR(100) NOT NULL CHECK (puja_type IN ('Maha Aarti', 'Special Archana', 'Maha Bhog', 'Modak Offering', 'Satyanarayan Puja')),
    slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Confirmed' CHECK (status IN ('Confirmed', 'Pending', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS visarjan_slots (
    id SERIAL PRIMARY KEY,
    pandal_id INT NOT NULL REFERENCES pandals(id) ON DELETE CASCADE,
    location_ghat VARCHAR(200) NOT NULL,
    immersion_type VARCHAR(100) NOT NULL CHECK (immersion_type IN ('Eco-Friendly Tank', 'Natural River/Lake', 'Sea Immersion', 'Artificial Pool')),
    slot_time TIMESTAMP WITH TIME ZONE NOT NULL,
    vehicle_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Scheduled' CHECK (status IN ('Scheduled', 'In Progress', 'Completed', 'Cancelled')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Indexes
CREATE INDEX IF NOT EXISTS idx_donations_pandal ON donations(pandal_id);
CREATE INDEX IF NOT EXISTS idx_puja_pandal ON puja_bookings(pandal_id);
CREATE INDEX IF NOT EXISTS idx_visarjan_pandal ON visarjan_slots(pandal_id);