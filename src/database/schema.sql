-- ============================================
-- COUNTRIES
-- ============================================

CREATE TABLE countries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);


-- ============================================
-- STATES
-- ============================================

CREATE TABLE states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    country_id INTEGER NOT NULL,

    CONSTRAINT fk_states_country
        FOREIGN KEY (country_id)
        REFERENCES countries(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_state_per_country
        UNIQUE (name, country_id)
);


-- ============================================
-- CITIES
-- ============================================

CREATE TABLE cities (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    state_id INTEGER NOT NULL,

    CONSTRAINT fk_cities_state
        FOREIGN KEY (state_id)
        REFERENCES states(id)
        ON DELETE CASCADE,

    CONSTRAINT unique_city_per_state
        UNIQUE (name, state_id)
);


-- ============================================
-- USERS
-- ============================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,

    gender VARCHAR(20) NOT NULL
        CHECK (gender IN ('male', 'female', 'other')),

    email VARCHAR(255) NOT NULL UNIQUE,

    password VARCHAR(255) NOT NULL,

    country_id INTEGER NOT NULL,
    state_id INTEGER NOT NULL,
    city_id INTEGER NOT NULL,

    zip VARCHAR(20),

    interests TEXT[],

    profile_picture TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_users_country
        FOREIGN KEY (country_id)
        REFERENCES countries(id),

    CONSTRAINT fk_users_state
        FOREIGN KEY (state_id)
        REFERENCES states(id),

    CONSTRAINT fk_users_city
        FOREIGN KEY (city_id)
        REFERENCES cities(id)
);