-- Insert Roles if they don't exist
INSERT INTO roles(name) SELECT 'ROLE_USER' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_USER');
INSERT INTO roles(name) SELECT 'ROLE_ADMIN' WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'ROLE_ADMIN');

-- Insert default admin user if it doesn't exist
INSERT INTO users(username, email, password, create_date_time, update_date_time) 
SELECT 'admin', 'admin@example.com', '$2a$10$Vd9/n12xBQpA2HWN09WWruQgH8uymKm8VRRZEUbVaGP2guBXPB3aW', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'admin');

-- Insert default user if it doesn't exist
INSERT INTO users(username, email, password, create_date_time, update_date_time) 
SELECT 'user', 'user@example.com', '$2a$10$Vd9/n12xBQpA2HWN09WWruQgH8uymKm8VRRZEUbVaGP2guBXPB3aW', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM users WHERE username = 'user');

-- Assign admin role to admin user if not already assigned
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'admin' AND r.name = 'ROLE_ADMIN'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Assign user role to user if not already assigned
INSERT INTO user_roles(user_id, role_id)
SELECT u.id, r.id
FROM users u, roles r
WHERE u.username = 'user' AND r.name = 'ROLE_USER'
AND NOT EXISTS (SELECT 1 FROM user_roles ur WHERE ur.user_id = u.id AND ur.role_id = r.id);

-- Insert Categories if they don't exist
INSERT INTO category(title) SELECT 'Technology' WHERE NOT EXISTS (SELECT 1 FROM category WHERE title = 'Technology');
INSERT INTO category(title) SELECT 'Science' WHERE NOT EXISTS (SELECT 1 FROM category WHERE title = 'Science');
INSERT INTO category(title) SELECT 'Sports' WHERE NOT EXISTS (SELECT 1 FROM category WHERE title = 'Sports');
INSERT INTO category(title) SELECT 'Entertainment' WHERE NOT EXISTS (SELECT 1 FROM category WHERE title = 'Entertainment');

-- Insert Articles if they don't exist
INSERT INTO article(title, content, category_id, status_enum)
SELECT 'The Future of AI', 'Artificial Intelligence is revolutionizing the way we live and work...', 
       (SELECT id FROM category WHERE title = 'Technology'), 0
WHERE NOT EXISTS (SELECT 1 FROM article WHERE title = 'The Future of AI');

INSERT INTO article(title, content, category_id, status_enum)
SELECT 'Space Exploration', 'Recent discoveries in space have opened new possibilities...',
       (SELECT id FROM category WHERE title = 'Science'), 0
WHERE NOT EXISTS (SELECT 1 FROM article WHERE title = 'Space Exploration');

INSERT INTO article(title, content, category_id, status_enum)
SELECT 'World Cup 2026', 'The upcoming World Cup promises to be the biggest sporting event...',
       (SELECT id FROM category WHERE title = 'Sports'), 1
WHERE NOT EXISTS (SELECT 1 FROM article WHERE title = 'World Cup 2026');

INSERT INTO article(title, content, category_id, status_enum)
SELECT 'New Movie Releases', 'This month''s most anticipated movies include...',
       (SELECT id FROM category WHERE title = 'Entertainment'), 0
WHERE NOT EXISTS (SELECT 1 FROM article WHERE title = 'New Movie Releases');

-- Insert Comments if they don't exist
INSERT INTO comment(article_comment, article_id)
SELECT 'Great article about AI!', (SELECT id FROM article WHERE title = 'The Future of AI')
WHERE NOT EXISTS (SELECT 1 FROM comment WHERE article_comment = 'Great article about AI!');

INSERT INTO comment(article_comment, article_id)
SELECT 'Very informative content.', (SELECT id FROM article WHERE title = 'The Future of AI')
WHERE NOT EXISTS (SELECT 1 FROM comment WHERE article_comment = 'Very informative content.');

INSERT INTO comment(article_comment, article_id)
SELECT 'Looking forward to more space discoveries!', (SELECT id FROM article WHERE title = 'Space Exploration')
WHERE NOT EXISTS (SELECT 1 FROM comment WHERE article_comment = 'Looking forward to more space discoveries!');

INSERT INTO comment(article_comment, article_id)
SELECT 'Can''t wait for the World Cup!', (SELECT id FROM article WHERE title = 'World Cup 2026')
WHERE NOT EXISTS (SELECT 1 FROM comment WHERE article_comment = 'Can''t wait for the World Cup!');

INSERT INTO comment(article_comment, article_id)
SELECT 'These movies sound interesting!', (SELECT id FROM article WHERE title = 'New Movie Releases')
WHERE NOT EXISTS (SELECT 1 FROM comment WHERE article_comment = 'These movies sound interesting!'); 