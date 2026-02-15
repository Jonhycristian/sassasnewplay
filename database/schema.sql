-- Database Schema for IPTV/VPN Management System

-- Drop tables if they exist to start fresh (optional, be careful in production)
DROP TABLE IF EXISTS sales;
DROP TABLE IF EXISTS clients;
DROP TABLE IF EXISTS plans;
DROP TABLE IF EXISTS servers;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS users;

-- 1. Users Table (Admin)
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- Encrypted with bcrypt
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Products Table
CREATE TABLE products (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('IPTV', 'VPN')),
    ativo BOOLEAN DEFAULT TRUE
);

-- 3. Plans Table
CREATE TABLE plans (
    id SERIAL PRIMARY KEY,
    produto_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    duracao_meses INTEGER NOT NULL,
    valor DECIMAL(10, 2) NOT NULL,
    tipo_preco VARCHAR(50) NOT NULL CHECK (tipo_preco IN ('normal', 'promocional'))
);

-- 4. Servers Table
CREATE TABLE servers (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    host VARCHAR(255) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('IPTV', 'VPN')),
    ativo BOOLEAN DEFAULT TRUE
);

-- 5. Clients Table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    usuario_login VARCHAR(255),
    telefone VARCHAR(50),
    produto_id INTEGER REFERENCES products(id),
    servidor_id INTEGER REFERENCES servers(id),
    quantidade_telas INTEGER DEFAULT 1,
    tipo_preco VARCHAR(50) CHECK (tipo_preco IN ('normal', 'promocional', 'personalizado')),
    valor_personalizado DECIMAL(10, 2), -- Used if tipo_preco is 'personalizado'
    data_inicio TIMESTAMP,
    data_vencimento TIMESTAMP,
    status VARCHAR(50) DEFAULT 'ativo' CHECK (status IN ('ativo', 'vencido', 'cancelado')),
    ultimo_aviso TIMESTAMP,
    status_cobranca VARCHAR(50) DEFAULT 'pendente' CHECK (status_cobranca IN ('pendente', 'cobrado', 'aguardando', 'pago')),
    proximo_lembrete DATE,
    tentativas_cobranca INTEGER DEFAULT 0,
    observacoes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Sales Table (History)
CREATE TABLE sales (
    id SERIAL PRIMARY KEY,
    cliente_id INTEGER REFERENCES clients(id) ON DELETE SET NULL,
    produto_id INTEGER REFERENCES products(id) ON DELETE SET NULL,
    valor DECIMAL(10, 2) NOT NULL,
    meses_comprados INTEGER NOT NULL,
    data_pagamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Initial Admin User (Password is 'admin123' hashed with bcrypt)
-- You typically shouldn't put raw hashes in SQL files, but for setup strictly:
-- $2a$10$X7... (example hash)
-- INSERT INTO users (email, password) VALUES ('admin@admin.com', '$2y$10$vI8aWBdWs9d.0...placeholder...');
