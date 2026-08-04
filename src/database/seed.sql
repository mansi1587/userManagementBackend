-- ============================================
-- COUNTRIES
-- ============================================

INSERT INTO countries (name)
VALUES
    ('India'),
    ('United States'),
    ('Canada'),
    ('Australia'),
    ('United Kingdom');


-- ============================================
-- STATES
-- ============================================

INSERT INTO states (name, country_id)
VALUES
    -- India
    ('Madhya Pradesh', 1),
    ('Maharashtra', 1),
    ('Rajasthan', 1),

    -- United States
    ('California', 2),
    ('Texas', 2),

    -- Canada
    ('Ontario', 3),
    ('British Columbia', 3),

    -- Australia
    ('New South Wales', 4),
    ('Victoria', 4),

    -- United Kingdom
    ('England', 5);


-- ============================================
-- CITIES
-- ============================================

INSERT INTO cities (name, state_id)
VALUES
    -- Madhya Pradesh
    ('Bhopal', 1),
    ('Indore', 1),
    ('Ujjain', 1),

    -- Maharashtra
    ('Mumbai', 2),
    ('Pune', 2),
    ('Nagpur', 2),

    -- Rajasthan
    ('Jaipur', 3),
    ('Udaipur', 3),
    ('Jodhpur', 3),

    -- California
    ('Los Angeles', 4),
    ('San Francisco', 4),
    ('San Diego', 4),

    -- Texas
    ('Houston', 5),
    ('Austin', 5),
    ('Dallas', 5),

    -- Ontario
    ('Toronto', 6),
    ('Ottawa', 6),
    ('Hamilton', 6),

    -- British Columbia
    ('Vancouver', 7),
    ('Victoria', 7),
    ('Surrey', 7),

    -- New South Wales
    ('Sydney', 8),
    ('Newcastle', 8),
    ('Wollongong', 8),

    -- Victoria
    ('Melbourne', 9),
    ('Geelong', 9),
    ('Ballarat', 9),

    -- England
    ('London', 10),
    ('Manchester', 10),
    ('Birmingham', 10);