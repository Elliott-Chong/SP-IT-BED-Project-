-- @BLOCK
CREATE TABLE Users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(255) NOT NULL UNIQUE,
    contact VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    type ENUM('Customer', 'Admin') NOT NULL,
    profile_pic_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    username VARCHAR(255) NOT NULL UNIQUE
);
-- @BLOCK
CREATE TABLE Categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT
);
-- @BLOCK
CREATE TABLE Products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    brand VARCHAR(255) NOT NULL,
    price VARCHAR(255) NOT NULL,
    categoryid INT NOT NULL,
    FOREIGN KEY (categoryid) REFERENCES Categories(id)
);
-- @BLOCK
CREATE TABLE Reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    userid INT NOT NULL,
    productid INT NOT NULL,
    review TEXT,
    rating INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (userid) REFERENCES Users(id),
    FOREIGN KEY (productid) REFERENCES Products(id) ON DELETE CASCADE
);
-- @BLOCK
CREATE TABLE Interests (
    userid INT NOT NULL,
    categoryid INT NOT NULL,
    FOREIGN KEY (userid) REFERENCES Users(id),
    FOREIGN KEY (categoryid) REFERENCES Categories(id)
);