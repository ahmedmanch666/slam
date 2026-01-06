-- SLAM Database Schema for MySQL (HostGator)
-- Run this in phpMyAdmin

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'user',
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000)
);

-- Refresh Tokens Table
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(500) UNIQUE NOT NULL,
    user_id VARCHAR(36) NOT NULL,
    expires_at BIGINT NOT NULL,
    revoked TINYINT DEFAULT 0,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Companies Table
CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(50),
    phone2 VARCHAR(50),
    email VARCHAR(255),
    address TEXT,
    notes TEXT,
    sector VARCHAR(100),
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    updated_at BIGINT,
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tenders Table
CREATE TABLE IF NOT EXISTS tenders (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    type VARCHAR(100),
    status VARCHAR(50),
    value DECIMAL(15, 2),
    submission_date BIGINT,
    notes TEXT,
    sample_date BIGINT,
    proof_date BIGINT,
    delivery_duration VARCHAR(100),
    vat_status VARCHAR(50),
    gm_instructions TEXT,
    dm_instructions TEXT,
    include_vat TINYINT DEFAULT 0,
    include_insurance TINYINT DEFAULT 0,
    include_withholding TINYINT DEFAULT 0,
    vat_amount DECIMAL(15, 2),
    withholding_amount DECIMAL(15, 2),
    insurance_amount DECIMAL(15, 2),
    total_value DECIMAL(15, 2),
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Contracts Table
CREATE TABLE IF NOT EXISTS contracts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    tender_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    value DECIMAL(15, 2),
    start_date BIGINT,
    end_date BIGINT,
    notes TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tasks Table
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    related_type VARCHAR(50),
    related_id VARCHAR(36),
    title VARCHAR(255) NOT NULL,
    priority VARCHAR(50),
    status VARCHAR(50),
    due_date BIGINT,
    notes TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Contacts Table
CREATE TABLE IF NOT EXISTS contacts (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    company_id VARCHAR(36),
    name VARCHAR(255) NOT NULL,
    position VARCHAR(100),
    phone VARCHAR(50),
    email VARCHAR(255),
    notes TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Followups Table
CREATE TABLE IF NOT EXISTS followups (
    id VARCHAR(36) PRIMARY KEY,
    user_id VARCHAR(36) NOT NULL,
    related_type VARCHAR(50),
    related_id VARCHAR(36),
    type VARCHAR(50),
    date BIGINT,
    notes TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (user_id) REFERENCES users (id)
);

-- Tender Items Table
CREATE TABLE IF NOT EXISTS tender_items (
    id VARCHAR(36) PRIMARY KEY,
    tender_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    quantity DECIMAL(15, 2),
    specifications TEXT,
    delivery_schedule TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (tender_id) REFERENCES tenders (id) ON DELETE CASCADE
);

-- Tender Competitors Table
CREATE TABLE IF NOT EXISTS tender_competitors (
    id VARCHAR(36) PRIMARY KEY,
    tender_id VARCHAR(36) NOT NULL,
    name VARCHAR(255) NOT NULL,
    details TEXT,
    price DECIMAL(15, 2),
    is_winner TINYINT DEFAULT 0,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (tender_id) REFERENCES tenders (id) ON DELETE CASCADE
);

-- Tender Attachments Table
CREATE TABLE IF NOT EXISTS tender_attachments (
    id VARCHAR(36) PRIMARY KEY,
    tender_id VARCHAR(36) NOT NULL,
    type VARCHAR(50),
    url LONGTEXT NOT NULL,
    description TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (tender_id) REFERENCES tenders (id) ON DELETE CASCADE
);

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id VARCHAR(36) PRIMARY KEY,
    tender_id VARCHAR(36) NOT NULL,
    date BIGINT,
    amount DECIMAL(15, 2),
    quantity DECIMAL(15, 2),
    vat_amount DECIMAL(15, 2),
    details TEXT,
    created_at BIGINT DEFAULT(UNIX_TIMESTAMP() * 1000),
    FOREIGN KEY (tender_id) REFERENCES tenders (id) ON DELETE CASCADE
);

-- Insert seed admin user (password: 12345678)
-- Password hash for '12345678' using scrypt
INSERT INTO
    users (
        id,
        email,
        password_hash,
        role,
        created_at
    )
VALUES (
        'seed_admin',
        'admin@domain.com',
        'scrypt:N=16384,r=8,p=1:randomsalt:hashedpassword',
        'admin',
        UNIX_TIMESTAMP() * 1000
    )
ON DUPLICATE KEY UPDATE
    id = id;