drop database kindergarten;

create database kindergarten;

use kindergarten;

-- 관리자 테이블
CREATE TABLE Admin (
    a_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    admin_pw VARCHAR(50) NOT NULL,
    admin_name VARCHAR(50) NOT NULL,
    admin_phone VARCHAR(20) NOT NULL
);

-- 회원가입, 로그인, 내정보 테이블
CREATE TABLE Users (
    u_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id VARCHAR(50) NOT NULL,
    user_pw VARCHAR(50) NOT NULL,
    user_name VARCHAR(50) NOT NULL,
    user_phone VARCHAR(20) NOT NULL,
    pet_name VARCHAR(50) NOT NULL,
    pet_gender ENUM('Male', 'Female') NOT NULL,
    pet_neutering VARCHAR(20),
    peculiarity VARCHAR(100)
);

-- 시설소개 테이블
CREATE TABLE Facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_name VARCHAR(50) NOT NULL,
    main_facilities	 TEXT NOT NULL,
    facility_photo BLOB
);

-- 직원소개 테이블
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
    contact_info varchar(40),
    staff_photo BLOB
);



-- 강아지 테이블
CREATE TABLE Dogs (
    dog_id INT PRIMARY KEY AUTO_INCREMENT,
    dog_photo BLOB,
    pet_name VARCHAR(15) NOT NULL, -- users(pet_name) 테이블 참조
    owner_id INT NOT NULL, -- users(u_id) 테이블 참조
    walk_date DATE NOT NULL,
    walk_time TIME NOT NULL,
    walk_photo BLOB,
    teacher_id INT NOT NULL, -- staff(staff_id) 테이블 참조
    class_info VARCHAR(15) NOT NULL,
    note_info TEXT,
    feed BOOLEAN NOT NULL,
    FOREIGN KEY (owner_id) REFERENCES Users(u_id),
    FOREIGN KEY (teacher_id) REFERENCES Staff(staff_id)
);

-- 수업시간표 테이블 (오전)
CREATE TABLE MorningClassSchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    class_type ENUM('오전') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255)
);

-- 수업시간표 테이블 (오후)
CREATE TABLE AfternoonClassSchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    class_type ENUM('오후') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255)
);

-- 수업시간표 테이블 (종일)
CREATE TABLE AlldayClassSchedule (
    schedule_id INT AUTO_INCREMENT PRIMARY KEY,
    class_type ENUM('종일') NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    description VARCHAR(255)
);

-- 공지사항 테이블
CREATE TABLE NoticeBoard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image BLOB
);

-- 자유게시판 테이블
CREATE TABLE FreeBoard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image BLOB,
    createBy VARCHAR(50) NOT NULL,
    a_id INT,
    FOREIGN KEY (a_id) REFERENCES Admin(a_id)
);

-- 질문 테이블
CREATE TABLE Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    question_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by VARCHAR(255) NOT NULL
);

-- 답변 테이블
CREATE TABLE Answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    answer TEXT NOT NULL,
    answer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(id)
);


-- 펫 추가 테이블
CREATE TABLE Pets (
    pet_id INT AUTO_INCREMENT PRIMARY KEY,
    pet_name VARCHAR(50) NOT NULL,
    pet_gender ENUM('Male', 'Female') NOT NULL, 
    pet_neutering VARCHAR(20),
    peculiarity VARCHAR(100),
    u_id INT,  
    FOREIGN KEY (u_id) REFERENCES Users(u_id)
);

-- 수업 신청 테이블
CREATE TABLE ClassRegistration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    dog_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    feed_status BOOLEAN NOT NULL,
    pickup_status BOOLEAN NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    consultation TEXT, -- 관리자용
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

