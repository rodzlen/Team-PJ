drop database kindergarten;

CREATE DATABASE kindergarten;

use kindergarten;

-- 관리자 테이블
CREATE TABLE Admin (
    a_id INT AUTO_INCREMENT PRIMARY KEY,
    admin_id VARCHAR(50) NOT NULL,
    admin_pw VARCHAR(50) NOT NULL,
    admin_name VARCHAR(50) NOT NULL,
    admin_phone VARCHAR(20) NOT NULL
);

INSERT INTO Admin (admin_id, admin_pw, admin_name, admin_phone)
VALUES ('admin1', 'password1', '관리자1', '010-1234-5678'),
       ('admin2', 'password2', '관리자2', '010-9876-5432'),
       ('admin3', 'password3', '관리자3', '010-1111-2222'),
       ('admin4', 'password4', '관리자4', '010-3333-4444'),
       ('admin5', 'password5', '관리자5', '010-5555-6666');

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

INSERT INTO Users (user_id, user_pw, user_name, user_phone, pet_name, pet_gender, pet_neutering, peculiarity)
VALUES ('user1', 'userpw1', '사용자1', '010-1111-1111', '멍멍이', 'Male', 'Yes', '앞발에 작은 흰 반점'),
       ('user2', 'userpw2', '사용자2', '010-2222-2222', '야옹이', 'Female', 'No', '꼬리가 길고 털이 길다'),
       ('user3', 'userpw3', '사용자3', '010-3333-3333', '똥똥이', 'Male', 'No', '눈이 크고 검은색'),
       ('user4', 'userpw4', '사용자4', '010-4444-4444', '키키', 'Female', 'Yes', '귀가 작고 꼬리가 짧다'),
       ('user5', 'userpw5', '사용자5', '010-5555-5555', '초코', 'Male', 'No', '털이 갈색이며 얼굴이 동그랗다');

-- 시설소개 테이블
CREATE TABLE Facilities (
    id INT AUTO_INCREMENT PRIMARY KEY,
    facility_name VARCHAR(50) NOT NULL,
    main_facilities TEXT NOT NULL,
<<<<<<< HEAD
    facility_photo BLOB
);
=======
    photo BLOB
);

INSERT INTO Facilities (facility_name, main_facilities, photo)
VALUES ('운동장', '배드민턴 코트, 농구장, 축구장', NULL),
       ('미술실', '도자기, 수채화, 캔버스 그림', NULL),
       ('도서실', '동화책, 교과서, 만화책', NULL),
       ('식당', '급식장, 뷔페, 음료 자판기', NULL),
       ('수영장', '풀장, 물놀이용 장난감, 수영복', NULL);
>>>>>>> 7e1b50aa685d05733d149926fe20b4aeda4ac25c

-- 직원소개 테이블
CREATE TABLE Staff (
    staff_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(50),
<<<<<<< HEAD
    contact_info VARCHAR(40),
    staff_photo BLOB
);


=======
    photo BLOB
);

INSERT INTO Staff (name, role, photo)
VALUES ('김직원', '교사', NULL),
       ('이직원', '교사', NULL),
       ('박직원', '교사', NULL),
       ('최직원', '보조교사', NULL),
       ('정직원', '행정직원', NULL);
>>>>>>> 7e1b50aa685d05733d149926fe20b4aeda4ac25c

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

<<<<<<< HEAD
=======
INSERT INTO Dogs (dog_photo, pet_name, owner_id, walk_date, walk_time, walk_photo, teacher_id, class_info, note_info, feed)
VALUES (NULL, '멍멍이', 1, '2024-07-23', '09:00:00', NULL, 1, '초보반', '오늘은 산책을 잘 함', true),
       (NULL, '야옹이', 2, '2024-07-23', '10:30:00', NULL, 2, '중급반', '어제는 조금 신경질적이었음', true),
       (NULL, '똥똥이', 3, '2024-07-23', '13:00:00', NULL, 3, '초보반', '오늘은 매우 잘 먹음', false),
       (NULL, '키키', 4, '2024-07-23', '14:30:00', NULL, 4, '고급반', '오늘은 조금 물이 빠르게 마시지 않았음', true),
       (NULL, '초코', 5, '2024-07-23', '16:00:00', NULL, 5, '초보반', '오늘은 소소한 반응이 있었음', false);

>>>>>>> 7e1b50aa685d05733d149926fe20b4aeda4ac25c
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

INSERT INTO NoticeBoard (title, content, image)
VALUES ('여름 휴가 안내', '8월 1일부터 8월 15일까지 여름 휴가입니다. 새학기는 8월 16일부터 시작됩니다.', NULL),
       ('식단 변경 안내', '다음 주부터 아침에 시리얼 대신 요거트를 제공할 예정입니다.', NULL),
       ('기숙사 방청소 안내', '기숙사 방청소는 매주 월요일과 금요일 오후에 진행됩니다.', NULL),
       ('부모님 예배 참석 안내', '오는 주일(7월 28일) 오전 예배 시간에 부모님들의 참석을 부탁드립니다.', NULL),
       ('수학 학습 도우미 필요', '수학 공부에 자신 있는 학부모님께서는 저희에게 연락 주시기 바랍니다.', NULL);

-- 자유게시판 테이블
CREATE TABLE FreeBoard (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    post_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    image BLOB
);

INSERT INTO FreeBoard (title, content, image)
VALUES ('우리 아이의 성장기', '우리 아이가 요즘 무슨 모습을 보이나요? 공유해 주세요.', NULL),
       ('오늘의 일기', '오늘 하루 어떤 일이 있었나요? 기록해 보세요.', NULL),
       ('가정에서의 재미있는 시간', '가정에서 함께 즐길 수 있는 활동이나 추천하고 싶은 책이나 게임이 있나요?', NULL),
       ('휴일 계획', '다가오는 주말에 무엇을 계획하고 계십니까? 공유해 주세요.', NULL),
       ('식당 후기', '최근에 방문한 맛집 후기를 나누어 주세요.', NULL);

-- 질문 테이블
CREATE TABLE Questions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question TEXT NOT NULL,
    question_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    create_by VARCHAR(255) NOT NULL
);

INSERT INTO Questions (question, create_by)
VALUES ('초등학생에게 추천할 만한 영어 교재는 무엇인가요?', '학부모1'),
       ('요즘 아이가 공부에 대해 관심이 없어하는데 어떻게 해야 할까요?', '학부모2'),
       ('다가오는 가을 방학에 추천할 활동이 있을까요?', '학부모3'),
       ('우리 아이의 급식이 과도하게 단 맛이 나요. 이를 개선할 방법이 있을까요?', '학부모4'),
       ('아이가 학교에 가기 싫어하는 이유와 해결 방법을 공유해 주세요.', '학부모5');

-- 답변 테이블
CREATE TABLE Answers (
    id INT AUTO_INCREMENT PRIMARY KEY,
    question_id INT,
    answer TEXT NOT NULL,
    answer_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    answered_by VARCHAR(255) NOT NULL,
    FOREIGN KEY (question_id) REFERENCES Questions(id)
);

INSERT INTO Answers (question_id, answer, answered_by)
VALUES (1, '제가 추천하는 영어 교재는 ABC English Series입니다.', '영어 교육 전문가'),
       (2, '아이의 관심을 끌 수 있는 새로운 학습 방법을 시도해 보세요. 예를 들어 게임을 활용한 학습이 효과적일 수 있습니다.', '교육 전문가'),
       (3, '가을 방학에는 도심을 벗어나 자연과 함께하는 캠핑이 좋을 것 같습니다.', '여행 전문가'),
       (4, '급식의 단 맛을 줄이기 위해 과일을 다양하게 포함시키거나, 단맛을 감소시킬 수 있는 식자재를 추가하는 방법을 고려해 보세요.', '영양 전문가'),
       (5, '아이의 학교 불안을 해소하기 위해 아이와 소통하고 학교 환경을 긍정적으로 변화시키는 노력이 필요합니다.', '상담 전문가');

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

-- 수강신청 테이블
CREATE TABLE ClassRegistration (
    id INT AUTO_INCREMENT PRIMARY KEY,
    owner_name VARCHAR(100) NOT NULL,
    dog_name VARCHAR(100) NOT NULL,
    class_name VARCHAR(100) NOT NULL,
    feed_status BOOLEAN NOT NULL,
    pickup_status BOOLEAN NOT NULL,
    start_day DATE NOT NULL,
    end_day DATE NOT NULL,
    consultation TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    admin_id INT,
    FOREIGN KEY (admin_id) REFERENCES Admin(a_id)
);

--수강목록 테이블 
