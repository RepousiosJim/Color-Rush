-- Multiplayer Match-3 Game Database Schema
-- PostgreSQL Schema with all necessary tables

-- Users table for authentication and profiles
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    display_name VARCHAR(100),
    avatar_url TEXT,
    level INTEGER DEFAULT 1,
    total_xp INTEGER DEFAULT 0,
    coins INTEGER DEFAULT 100,
    gems INTEGER DEFAULT 10,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_active TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_online BOOLEAN DEFAULT false,
    preferences JSONB DEFAULT '{}',
    stats JSONB DEFAULT '{}'
);

-- User sessions for real-time tracking
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    session_token VARCHAR(255) UNIQUE NOT NULL,
    socket_id VARCHAR(255),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    is_active BOOLEAN DEFAULT true
);

-- Game modes and configurations
CREATE TABLE game_modes (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    max_players INTEGER NOT NULL,
    time_limit INTEGER, -- in seconds
    move_limit INTEGER,
    scoring_multiplier DECIMAL(3,2) DEFAULT 1.00,
    unlock_level INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    config JSONB DEFAULT '{}'
);

-- Single player games
CREATE TABLE games_solo (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mode_id INTEGER REFERENCES game_modes(id),
    score INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    moves_used INTEGER DEFAULT 0,
    time_played INTEGER DEFAULT 0, -- in seconds
    gems_matched JSONB DEFAULT '{}', -- count by gem type
    combos_achieved INTEGER DEFAULT 0,
    max_combo INTEGER DEFAULT 0,
    power_ups_used JSONB DEFAULT '{}',
    board_state JSONB,
    game_state ENUM('playing', 'paused', 'completed', 'failed') DEFAULT 'playing',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    final_stats JSONB
);

-- Multiplayer game rooms
CREATE TABLE game_rooms (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_code VARCHAR(10) UNIQUE NOT NULL,
    host_id UUID REFERENCES users(id) ON DELETE CASCADE,
    mode_id INTEGER REFERENCES game_modes(id),
    max_players INTEGER DEFAULT 2,
    current_players INTEGER DEFAULT 0,
    status ENUM('waiting', 'starting', 'active', 'paused', 'completed', 'cancelled') DEFAULT 'waiting',
    is_private BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    ended_at TIMESTAMP,
    winner_id UUID REFERENCES users(id)
);

-- Multiplayer game participants
CREATE TABLE game_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    position INTEGER NOT NULL, -- player position (1, 2, 3, 4)
    score INTEGER DEFAULT 0,
    moves_used INTEGER DEFAULT 0,
    status ENUM('waiting', 'ready', 'playing', 'finished', 'disconnected') DEFAULT 'waiting',
    board_state JSONB,
    power_ups JSONB DEFAULT '{}',
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    final_ranking INTEGER,
    rewards_earned JSONB DEFAULT '{}',
    UNIQUE(room_id, user_id),
    UNIQUE(room_id, position)
);

-- Real-time game moves for replay and synchronization
CREATE TABLE game_moves (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID REFERENCES game_rooms(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    move_number INTEGER NOT NULL,
    move_type ENUM('swap', 'power_up', 'special') NOT NULL,
    move_data JSONB NOT NULL, -- contains move details
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    result_data JSONB -- contains match results, score changes, etc.
);

-- Global leaderboards
CREATE TABLE leaderboards (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    type ENUM('daily', 'weekly', 'monthly', 'all_time', 'seasonal') NOT NULL,
    mode_id INTEGER REFERENCES game_modes(id),
    period_start DATE,
    period_end DATE,
    is_active BOOLEAN DEFAULT true,
    rewards JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Leaderboard entries
CREATE TABLE leaderboard_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    leaderboard_id INTEGER REFERENCES leaderboards(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    score INTEGER NOT NULL,
    rank INTEGER,
    additional_stats JSONB DEFAULT '{}',
    game_id UUID, -- can reference either games_solo or game_rooms
    achieved_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(leaderboard_id, user_id)
);

-- Friend relationships
CREATE TABLE friendships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    requester_id UUID REFERENCES users(id) ON DELETE CASCADE,
    addressee_id UUID REFERENCES users(id) ON DELETE CASCADE,
    status ENUM('pending', 'accepted', 'blocked', 'declined') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(requester_id, addressee_id),
    CHECK(requester_id != addressee_id)
);

-- Power-ups and items
CREATE TABLE items (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) NOT NULL,
    display_name VARCHAR(100) NOT NULL,
    description TEXT,
    type ENUM('power_up', 'booster', 'cosmetic', 'currency') NOT NULL,
    rarity ENUM('common', 'rare', 'epic', 'legendary') DEFAULT 'common',
    cost_coins INTEGER DEFAULT 0,
    cost_gems INTEGER DEFAULT 0,
    unlock_level INTEGER DEFAULT 1,
    effects JSONB DEFAULT '{}',
    is_tradeable BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true
);

-- User inventory
CREATE TABLE user_inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    item_id INTEGER REFERENCES items(id) ON DELETE CASCADE,
    quantity INTEGER DEFAULT 1,
    acquired_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP,
    UNIQUE(user_id, item_id)
);

-- Game achievements
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    display_name VARCHAR(150) NOT NULL,
    description TEXT,
    icon_url TEXT,
    type ENUM('progress', 'milestone', 'challenge', 'social') NOT NULL,
    category VARCHAR(50),
    requirements JSONB NOT NULL,
    rewards JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    rarity ENUM('bronze', 'silver', 'gold', 'platinum', 'diamond') DEFAULT 'bronze',
    is_hidden BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    completed_at TIMESTAMP,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Daily challenges
CREATE TABLE daily_challenges (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    requirements JSONB NOT NULL,
    rewards JSONB NOT NULL,
    difficulty ENUM('easy', 'medium', 'hard', 'expert') DEFAULT 'medium',
    date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    completion_count INTEGER DEFAULT 0
);

-- User daily challenge progress
CREATE TABLE user_daily_challenges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    challenge_id INTEGER REFERENCES daily_challenges(id) ON DELETE CASCADE,
    progress JSONB DEFAULT '{}',
    completed_at TIMESTAMP,
    is_claimed BOOLEAN DEFAULT false,
    claimed_at TIMESTAMP,
    UNIQUE(user_id, challenge_id)
);

-- Tournaments
CREATE TABLE tournaments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(150) NOT NULL,
    description TEXT,
    type ENUM('bracket', 'round_robin', 'elimination', 'ladder') NOT NULL,
    mode_id INTEGER REFERENCES game_modes(id),
    entry_fee_coins INTEGER DEFAULT 0,
    entry_fee_gems INTEGER DEFAULT 0,
    max_participants INTEGER,
    min_participants INTEGER DEFAULT 2,
    prize_pool JSONB NOT NULL,
    status ENUM('scheduled', 'registration', 'active', 'completed', 'cancelled') DEFAULT 'scheduled',
    registration_start TIMESTAMP,
    registration_end TIMESTAMP,
    tournament_start TIMESTAMP,
    tournament_end TIMESTAMP,
    rules JSONB DEFAULT '{}',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tournament participants
CREATE TABLE tournament_participants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tournament_id UUID REFERENCES tournaments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('registered', 'active', 'eliminated', 'winner', 'withdrawn') DEFAULT 'registered',
    current_round INTEGER DEFAULT 1,
    wins INTEGER DEFAULT 0,
    losses INTEGER DEFAULT 0,
    total_score INTEGER DEFAULT 0,
    final_rank INTEGER,
    rewards_earned JSONB DEFAULT '{}',
    UNIQUE(tournament_id, user_id)
);

-- Game reports for moderation
CREATE TABLE game_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID REFERENCES users(id) ON DELETE CASCADE,
    reported_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    game_id UUID, -- can reference game room or solo game
    report_type ENUM('cheating', 'harassment', 'inappropriate_name', 'other') NOT NULL,
    description TEXT,
    status ENUM('pending', 'investigating', 'resolved', 'dismissed') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP,
    resolved_by UUID REFERENCES users(id),
    resolution_notes TEXT
);

-- Indexes for performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_last_active ON users(last_active);

CREATE INDEX idx_game_rooms_status ON game_rooms(status);
CREATE INDEX idx_game_rooms_room_code ON game_rooms(room_code);
CREATE INDEX idx_game_rooms_created_at ON game_rooms(created_at);

CREATE INDEX idx_game_participants_room_user ON game_participants(room_id, user_id);
CREATE INDEX idx_game_participants_status ON game_participants(status);

CREATE INDEX idx_games_solo_user_score ON games_solo(user_id, score);
CREATE INDEX idx_games_solo_completed_at ON games_solo(completed_at);

CREATE INDEX idx_leaderboard_entries_score ON leaderboard_entries(leaderboard_id, score DESC);
CREATE INDEX idx_leaderboard_entries_rank ON leaderboard_entries(leaderboard_id, rank);

CREATE INDEX idx_friendships_requester ON friendships(requester_id);
CREATE INDEX idx_friendships_addressee ON friendships(addressee_id);
CREATE INDEX idx_friendships_status ON friendships(status);

CREATE INDEX idx_user_inventory_user_item ON user_inventory(user_id, item_id);
CREATE INDEX idx_user_achievements_user ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_completed ON user_achievements(user_id, completed_at);

-- Triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_friendships_updated_at BEFORE UPDATE ON friendships FOR EACH ROW EXECUTE FUNCTION update_updated_at_column(); 