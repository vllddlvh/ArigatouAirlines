-- ============================================
-- HỆ THỐNG ĐẶT VÉ MÁY BAY - DATABASE SCHEMA
-- Version: 2.1 (Tương thích với MySQL)
-- ============================================

-- ========================================
-- NHÓM 1: QUẢN LÝ NGƯỜI DÙNG & PHÂN QUYỀN
-- ========================================
CREATE TABLE role (
    role_name VARCHAR(50) PRIMARY KEY,
    description VARCHAR(200)
);

CREATE TABLE permission (
    permission_name VARCHAR(100) PRIMARY KEY,
    `resource` VARCHAR(50),
    `action` VARCHAR(50),
    description VARCHAR(200)
);

CREATE TABLE role_permission (
    role_name VARCHAR(50) NOT NULL,
    permission_name VARCHAR(100) NOT NULL,
    PRIMARY KEY (role_name, permission_name),
    FOREIGN KEY (role_name) REFERENCES role(role_name) ON DELETE CASCADE,
    FOREIGN KEY (permission_name) REFERENCES permission(permission_name) ON DELETE CASCADE
);

CREATE TABLE `user` (
    user_id INT PRIMARY KEY AUTO_INCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    avatar VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE user_roles (
    user_id INT NOT NULL,
    role_name VARCHAR(50) NOT NULL,
    PRIMARY KEY (user_id, role_name),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id) ON DELETE CASCADE,
    FOREIGN KEY (role_name) REFERENCES role(role_name) ON DELETE CASCADE
);
CREATE TABLE invalidated_token (
  id varchar(255) NOT NULL,
  expiry_time datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
);

CREATE TABLE password_otp (
    otp VARCHAR(100) PRIMARY KEY,
    user_id INT NOT NULL,
    is_valid TINYINT NOT NULL DEFAULT 1,
    expiry_at DATETIME NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id) ON DELETE CASCADE
);

-- ========================================
-- NHÓM 2: QUẢN LÝ HÀNG KHÔNG & MÁY BAY
-- ========================================
CREATE TABLE airline (
    airline_id INT PRIMARY KEY AUTO_INCREMENT,
    airline_code VARCHAR(10) NOT NULL UNIQUE,
    airline_name VARCHAR(100) NOT NULL,
    country VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE
);

CREATE TABLE aircraft_type (
    aircraft_type_id INT PRIMARY KEY AUTO_INCREMENT,
    type_name VARCHAR(100) NOT NULL,
    total_seats INT NOT NULL CHECK (total_seats > 0)
);

CREATE TABLE aircraft (
    aircraft_id INT PRIMARY KEY AUTO_INCREMENT,
    airline_id INT NOT NULL,
    aircraft_type_id INT NOT NULL,
    registration_number VARCHAR(20) NOT NULL UNIQUE,
    status ENUM('Active', 'Maintenance', 'Retired') DEFAULT 'Active',
    FOREIGN KEY (airline_id) REFERENCES airline(airline_id),
    FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_type(aircraft_type_id)
);

CREATE TABLE seat_map (
    seat_map_id INT PRIMARY KEY AUTO_INCREMENT,
    aircraft_type_id INT NOT NULL,
    seat_number VARCHAR(10) NOT NULL,
    seat_class ENUM('Economy', 'Business', 'First Class') NOT NULL,
    seat_type ENUM('Window', 'Aisle', 'Middle', 'Exit Row') DEFAULT 'Middle',
    UNIQUE (aircraft_type_id, seat_number),
    FOREIGN KEY (aircraft_type_id) REFERENCES aircraft_type(aircraft_type_id) ON DELETE CASCADE
);

-- ========================================
-- NHÓM 3: QUẢN LÝ SÂN BAY, LỊCH TRÌNH & CHUYẾN BAY
-- ========================================
CREATE TABLE airport (
    airport_id INT PRIMARY KEY AUTO_INCREMENT,
    airport_code VARCHAR(10) NOT NULL UNIQUE,
    airport_name VARCHAR(100) NOT NULL,
    city VARCHAR(50) NOT NULL,
    country VARCHAR(50) NOT NULL
);

CREATE TABLE flight_schedule (
    schedule_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_number VARCHAR(20) NOT NULL,
    airline_id INT NOT NULL,
    departure_airport_id INT NOT NULL,
    arrival_airport_id INT NOT NULL,
    departure_time TIME NOT NULL,
    arrival_time TIME NOT NULL,
    duration_minutes INT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    UNIQUE(flight_number, departure_airport_id, arrival_airport_id),
    CHECK (departure_airport_id <> arrival_airport_id),
    FOREIGN KEY (airline_id) REFERENCES airline(airline_id),
    FOREIGN KEY (departure_airport_id) REFERENCES airport(airport_id),
    FOREIGN KEY (arrival_airport_id) REFERENCES airport(airport_id)
);

CREATE TABLE flight (
    flight_id INT PRIMARY KEY AUTO_INCREMENT,
    schedule_id INT NOT NULL,
    aircraft_id INT,
    flight_date DATE NOT NULL,
    departure_datetime DATETIME NOT NULL,
    arrival_datetime DATETIME NOT NULL,
    status ENUM('Scheduled', 'On Time', 'Delayed', 'Cancelled', 'Departed', 'Arrived') DEFAULT 'Scheduled',
    UNIQUE(schedule_id, flight_date),
    CHECK (arrival_datetime > departure_datetime),
    FOREIGN KEY (schedule_id) REFERENCES flight_schedule(schedule_id),
    FOREIGN KEY (aircraft_id) REFERENCES aircraft(aircraft_id)
);

CREATE TABLE flight_seat (
    flight_seat_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_id INT NOT NULL,
    seat_map_id INT NOT NULL,
    status ENUM('Available', 'Booked', 'Locked') DEFAULT 'Available',
    UNIQUE(flight_id, seat_map_id),
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (seat_map_id) REFERENCES seat_map(seat_map_id)
);

-- ========================================
-- NHÓM 4: QUẢN LÝ HẠNG VÉ & GIÁ VÉ
-- ========================================
CREATE TABLE ticket_class (
    class_id INT PRIMARY KEY AUTO_INCREMENT,
    class_name VARCHAR(50) NOT NULL UNIQUE,
    baggage_allowance_kg INT DEFAULT 20,
    refundable BOOLEAN DEFAULT FALSE,
    changeable BOOLEAN DEFAULT TRUE
);

CREATE TABLE flight_price (
    price_id INT PRIMARY KEY AUTO_INCREMENT,
    flight_id INT NOT NULL,
    class_id INT NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL CHECK (base_price >= 0),
    tax DECIMAL(10, 2) DEFAULT 0 CHECK (tax >= 0),
    total_seats INT NOT NULL,
    available_seats INT NOT NULL,
    UNIQUE(flight_id, class_id),
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id) ON DELETE CASCADE,
    FOREIGN KEY (class_id) REFERENCES ticket_class(class_id)
);

-- ========================================
-- NHÓM 5: QUẢN LÝ HÀNH KHÁCH, BOOKING & VÉ
-- ========================================
CREATE TABLE booking (
    booking_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    booking_code VARCHAR(20) NOT NULL UNIQUE,
    booking_status ENUM('Pending', 'Confirmed', 'Cancelled') DEFAULT 'Pending',
    payment_status ENUM('Pending', 'Paid', 'Refunded', 'Failed') DEFAULT 'Pending',
    total_amount DECIMAL(10, 2) NOT NULL,
    payment_deadline DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE passenger (
    passenger_id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE NOT NULL,
    gender ENUM('Male', 'Female', 'Other'),
    nationality VARCHAR(50),
    passport_number VARCHAR(50),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE ticket (
    ticket_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    flight_id INT NOT NULL,
    passenger_id INT NOT NULL,
    price_id INT NOT NULL,
    flight_seat_id INT UNIQUE,
    ticket_number VARCHAR(20) UNIQUE,
    status ENUM('Issued', 'CheckedIn', 'Boarded', 'Cancelled', 'Refunded') DEFAULT 'Issued',
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id) ON DELETE CASCADE,
    FOREIGN KEY (flight_id) REFERENCES flight(flight_id),
    FOREIGN KEY (passenger_id) REFERENCES passenger(passenger_id),
    FOREIGN KEY (price_id) REFERENCES flight_price(price_id),
    FOREIGN KEY (flight_seat_id) REFERENCES flight_seat(flight_seat_id)
);

-- ========================================
-- NHÓM 6: DỊCH VỤ BỔ SUNG & THANH TOÁN
-- ========================================
CREATE TABLE payment (
    payment_id INT PRIMARY KEY AUTO_INCREMENT,
    booking_id INT NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    payment_method VARCHAR(50),
    transaction_id VARCHAR(100) UNIQUE,
    payment_status ENUM('Success', 'Failed', 'Pending') DEFAULT 'Pending',
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id)
);

CREATE TABLE ancillary_service (
    service_id INT PRIMARY KEY AUTO_INCREMENT,
    service_name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL
);

CREATE TABLE booking_service (
    ticket_id INT NOT NULL,
    service_id INT NOT NULL,
    price_at_purchase DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY(ticket_id, service_id),
    FOREIGN KEY (ticket_id) REFERENCES ticket(ticket_id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES ancillary_service(service_id)
);

-- ========================================
-- CÁC NHÓM CÒN LẠI
-- ========================================

CREATE TABLE voucher (
    voucher_id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_code VARCHAR(50) NOT NULL UNIQUE,
    discount_type ENUM('Percentage', 'Fixed Amount') NOT NULL,
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2),
    min_order_amount DECIMAL(10, 2) DEFAULT 0,
    usage_limit INT DEFAULT 1,
    used_count INT DEFAULT 0,
    valid_from DATETIME NOT NULL,
    valid_to DATETIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    CHECK (valid_to > valid_from)
);

CREATE TABLE voucher_usage (
    usage_id INT PRIMARY KEY AUTO_INCREMENT,
    voucher_id INT NOT NULL,
    booking_id INT NOT NULL UNIQUE,
    user_id INT NOT NULL,
    discount_amount DECIMAL(10, 2) NOT NULL,
    used_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (voucher_id) REFERENCES voucher(voucher_id),
    FOREIGN KEY (booking_id) REFERENCES booking(booking_id),
    FOREIGN KEY (user_id) REFERENCES `user`(user_id)
);

CREATE TABLE audit_log (
    log_id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id INT,
    `action` VARCHAR(255) NOT NULL,
    table_name VARCHAR(50),
    record_id VARCHAR(100),
    old_value JSON,
    new_value JSON,
    ip_address VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES `user`(user_id) ON DELETE SET NULL
);

-- ========================================
-- INDEXES TỐI ƯU PERFORMANCE
-- ========================================
CREATE INDEX idx_flight_search ON flight(flight_date, status);
CREATE INDEX idx_schedule_search ON flight_schedule(departure_airport_id, arrival_airport_id, is_active);
CREATE INDEX idx_booking_user ON booking(user_id, created_at);
CREATE INDEX idx_ticket_flight_passenger ON ticket(flight_id, passenger_id);