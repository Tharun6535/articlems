-- Users table
CREATE TABLE IF NOT EXISTS users (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  mfa_enabled BOOLEAN DEFAULT FALSE,
  mfa_secret VARCHAR(255),
  active BOOLEAN DEFAULT TRUE,
  failed_login_attempts INT DEFAULT 0,
  create_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  update_date_time TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Roles table
CREATE TABLE IF NOT EXISTS roles (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL
);

-- Junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS user_roles (
  user_id BIGINT NOT NULL,
  role_id BIGINT NOT NULL,
  PRIMARY KEY (user_id, role_id),
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (role_id) REFERENCES roles(id)
);

-- Category table
CREATE TABLE IF NOT EXISTS category (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  create_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Article table
CREATE TABLE IF NOT EXISTS article (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  title VARCHAR(100) NOT NULL,
  content TEXT NOT NULL,
  category_id BIGINT,
  status_enum INT DEFAULT 0,
  image_path VARCHAR(255),
  image_url VARCHAR(1024),
  version BIGINT DEFAULT 0,
  create_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (category_id) REFERENCES category(id)
);

-- Comment table
CREATE TABLE IF NOT EXISTS comment (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  article_comment VARCHAR(255) NOT NULL,
  article_id BIGINT,
  create_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  update_date_time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (article_id) REFERENCES article(id)
);

-- User tokens table for session management
CREATE TABLE IF NOT EXISTS user_tokens (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NOT NULL,
  username VARCHAR(50) NOT NULL,
  token VARCHAR(2000) NOT NULL,
  is_blacklisted BOOLEAN DEFAULT FALSE,
  ip_address VARCHAR(50),
  user_agent VARCHAR(500),
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expires_at TIMESTAMP NOT NULL,
  last_used_at TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

-- JWT Blacklist Table
CREATE TABLE IF NOT EXISTS jwt_blacklist (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    token VARCHAR(512) NOT NULL,
    user_id BIGINT,
    reason VARCHAR(100),
    blacklisted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Create indexes separately for H2 compatibility
CREATE INDEX IF NOT EXISTS idx_token ON jwt_blacklist(token);
CREATE INDEX IF NOT EXISTS idx_expires_at ON jwt_blacklist(expires_at); 