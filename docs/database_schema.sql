-- Table for Users (staff, administrators)
CREATE TABLE users (
    user_id SERIAL PRIMARY KEY,
    username VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'staff')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Clients
CREATE TABLE clients (
    client_id SERIAL PRIMARY KEY,
    first_name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE,
    phone VARCHAR(50),
    address TEXT,
    date_of_birth DATE,
    expiration_date DATE, -- Added expiration_date column
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Client Statuses (e.g., Activo, Expirado)
CREATE TABLE client_statuses (
    status_id SERIAL PRIMARY KEY,
    status_name VARCHAR(255) UNIQUE NOT NULL
);

-- Table for Client's Current Status
CREATE TABLE client_current_status (
    client_status_id SERIAL PRIMARY KEY,
    client_id INTEGER UNIQUE NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    status_id INTEGER NOT NULL REFERENCES client_statuses(status_id) ON DELETE RESTRICT,
    status_update_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);


-- Table for Memberships
CREATE TABLE memberships (
    membership_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL CHECK (price >= 0),
    duration_days INTEGER NOT NULL CHECK (duration_days > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Client Memberships (linking clients to memberships)
CREATE TABLE client_memberships (
    client_membership_id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    membership_id INTEGER NOT NULL REFERENCES memberships(membership_id) ON DELETE RESTRICT,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, membership_id, start_date) -- Prevent duplicate entries for the same client, membership and start date
);

-- Table for Payments
CREATE TABLE payments (
    payment_id SERIAL PRIMARY KEY,
    client_membership_id INTEGER NOT NULL REFERENCES client_memberships(client_membership_id) ON DELETE CASCADE,
    payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    amount DECIMAL(10, 2) NOT NULL CHECK (amount >= 0),
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    notes TEXT
);

-- Table for Classes
CREATE TABLE classes (
    class_id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schedule TIME NOT NULL,
    day_of_week INTEGER NOT NULL CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0 for Sunday, 6 for Saturday
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    capacity INTEGER NOT NULL CHECK (capacity >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Table for Class Registrations (linking clients to classes)
CREATE TABLE class_registrations (
    registration_id SERIAL PRIMARY KEY,
    client_id INTEGER NOT NULL REFERENCES clients(client_id) ON DELETE CASCADE,
    class_id INTEGER NOT NULL REFERENCES classes(class_id) ON DELETE CASCADE,
    registration_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (client_id, class_id) -- Prevent duplicate registrations for the same client and class
);

-- Indexing for performance
CREATE INDEX idx_clients_email ON clients(email);
CREATE INDEX idx_client_memberships_client_id ON client_memberships(client_id);
CREATE INDEX idx_client_memberships_membership_id ON client_memberships(membership_id);
CREATE INDEX idx_payments_client_membership_id ON payments(client_membership_id);
CREATE INDEX idx_class_registrations_client_id ON class_registrations(client_id);
CREATE INDEX idx_class_registrations_class_id ON class_registrations(class_id);

-- View to show the last payment for each client
CREATE VIEW last_payment_per_client AS
SELECT
    c.client_id,
    c.first_name || ' ' || c.last_name AS client_name,
    lp.payment_id AS latest_payment_id,
    lp.payment_date AS latest_payment_date,
    lp.amount AS latest_payment_amount
FROM clients c
JOIN (
    SELECT
        p.payment_id, p.client_membership_id, p.payment_date, p.amount,
        ROW_NUMBER() OVER(PARTITION BY cm.client_id ORDER BY p.payment_date DESC) as rn 
    FROM payments p JOIN client_memberships cm ON p.client_membership_id = cm.client_membership_id
) lp ON lp.rn = 1
JOIN client_memberships cm ON lp.client_membership_id = cm.client_membership_id AND cm.client_id = c.client_id;

-- Function to update client status based on expiration date
CREATE OR REPLACE FUNCTION update_client_status_by_expiration()
RETURNS VOID
AS $$
DECLARE
    client_record clients;
    active_status_id INTEGER;
    expired_status_id INTEGER;
BEGIN
    SELECT status_id INTO active_status_id FROM client_statuses WHERE status_name = 'Activo';
    SELECT status_id INTO expired_status_id FROM client_statuses WHERE status_name = 'Expirado';

    FOR client_record IN SELECT * FROM clients LOOP
        IF client_record.expiration_date < CURRENT_DATE THEN
            -- Set status to 'Expirado'
            INSERT INTO client_current_status (client_id, status_id, status_update_date) VALUES (client_record.client_id, expired_status_id, CURRENT_TIMESTAMP) ON CONFLICT (client_id) DO UPDATE SET status_id = EXCLUDED.status_id, status_update_date = EXCLUDED.status_update_date;
        ELSE
            -- Set status to 'Activo'
            INSERT INTO client_current_status (client_id, status_id, status_update_date) VALUES (client_record.client_id, active_status_id, CURRENT_TIMESTAMP) ON CONFLICT (client_id) DO UPDATE SET status_id = EXCLUDED.status_id, status_update_date = EXCLUDED.status_update_date;
        END IF;
    END LOOP;
END;
$$
LANGUAGE plpgsql;
CREATE INDEX idx_class_registrations_class_id ON class_registrations(class_id);