-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create users table
CREATE TABLE users (
    user_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE NOT NULL,
    subscription_status TEXT NOT NULL DEFAULT 'free' CHECK (subscription_status IN ('free', 'premium')),
    selected_state TEXT,
    stripe_customer_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create state_rights_guides table
CREATE TABLE state_rights_guides (
    guide_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    state_name TEXT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    content JSONB NOT NULL,
    languages TEXT[] NOT NULL DEFAULT ARRAY['english'],
    last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create interaction_logs table
CREATE TABLE interaction_logs (
    log_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE NOT NULL,
    location TEXT,
    recorded_media_url TEXT,
    notes TEXT,
    interaction_type TEXT NOT NULL CHECK (interaction_type IN ('traffic_stop', 'search', 'arrest', 'other')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create shareable_cards table
CREATE TABLE shareable_cards (
    card_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    interaction_log_id UUID NOT NULL REFERENCES interaction_logs(log_id) ON DELETE CASCADE,
    generated_content JSONB NOT NULL,
    generated_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_subscription_status ON users(subscription_status);
CREATE INDEX idx_interaction_logs_user_id ON interaction_logs(user_id);
CREATE INDEX idx_interaction_logs_timestamp ON interaction_logs(timestamp);
CREATE INDEX idx_interaction_logs_type ON interaction_logs(interaction_type);
CREATE INDEX idx_shareable_cards_interaction_log_id ON shareable_cards(interaction_log_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE interaction_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE shareable_cards ENABLE ROW LEVEL SECURITY;

-- Users can only see their own data
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

CREATE POLICY "Users can insert own data" ON users
    FOR INSERT WITH CHECK (wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address');

-- Interaction logs policies
CREATE POLICY "Users can view own interaction logs" ON interaction_logs
    FOR SELECT USING (user_id IN (
        SELECT user_id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    ));

CREATE POLICY "Users can insert own interaction logs" ON interaction_logs
    FOR INSERT WITH CHECK (user_id IN (
        SELECT user_id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    ));

CREATE POLICY "Users can update own interaction logs" ON interaction_logs
    FOR UPDATE USING (user_id IN (
        SELECT user_id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
    ));

-- Shareable cards policies
CREATE POLICY "Users can view own shareable cards" ON shareable_cards
    FOR SELECT USING (interaction_log_id IN (
        SELECT log_id FROM interaction_logs WHERE user_id IN (
            SELECT user_id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    ));

CREATE POLICY "Users can insert own shareable cards" ON shareable_cards
    FOR INSERT WITH CHECK (interaction_log_id IN (
        SELECT log_id FROM interaction_logs WHERE user_id IN (
            SELECT user_id FROM users WHERE wallet_address = current_setting('request.jwt.claims', true)::json->>'wallet_address'
        )
    ));

-- State rights guides are public (read-only)
CREATE POLICY "Anyone can view state rights guides" ON state_rights_guides
    FOR SELECT TO public USING (true);

-- Insert sample data for state rights guides
INSERT INTO state_rights_guides (state_name, title, content, languages) VALUES
('California', 'California Rights Guide', '{
    "dos": [
        "Remain calm and polite",
        "Keep your hands visible",
        "Ask \"Am I free to leave?\"",
        "Exercise your right to remain silent",
        "Ask for a lawyer if arrested"
    ],
    "donts": [
        "Don''t argue or resist",
        "Don''t consent to searches",
        "Don''t lie or provide false information",
        "Don''t run or make sudden movements",
        "Don''t sign anything without a lawyer"
    ],
    "scripts": {
        "english": [
            "I am exercising my right to remain silent.",
            "I do not consent to any searches.",
            "Am I free to leave?",
            "I want to speak to a lawyer."
        ],
        "spanish": [
            "Estoy ejerciendo mi derecho a permanecer en silencio.",
            "No consiento a ninguna búsqueda.",
            "¿Soy libre de irme?",
            "Quiero hablar con un abogado."
        ]
    },
    "scenarios": {
        "traffic_stop": "During a traffic stop in California, you must provide your driver''s license, registration, and insurance. You have the right to remain silent beyond providing these documents.",
        "search": "Police need a warrant or probable cause to search you or your property. You can clearly state ''I do not consent to this search.''",
        "arrest": "If arrested, you have the right to remain silent and the right to an attorney. Clearly invoke these rights."
    }
}', ARRAY['english', 'spanish']),

('New York', 'New York Rights Guide', '{
    "dos": [
        "Remain calm and respectful",
        "Keep your hands visible at all times",
        "Ask \"Am I being detained or am I free to go?\"",
        "Exercise your right to remain silent",
        "Request a lawyer immediately if arrested"
    ],
    "donts": [
        "Don''t resist or argue with officers",
        "Don''t consent to searches of your person or property",
        "Don''t provide false information",
        "Don''t make sudden movements",
        "Don''t sign any documents without legal counsel"
    ],
    "scripts": {
        "english": [
            "I am invoking my right to remain silent.",
            "I do not consent to any search.",
            "Am I being detained or am I free to go?",
            "I want to speak with an attorney."
        ],
        "spanish": [
            "Estoy invocando mi derecho a permanecer en silencio.",
            "No consiento ninguna búsqueda.",
            "¿Estoy detenido o soy libre de irme?",
            "Quiero hablar con un abogado."
        ]
    },
    "scenarios": {
        "traffic_stop": "In New York, you must provide license, registration, and insurance during a traffic stop. You have the right to remain silent for other questions.",
        "search": "Police need probable cause or a warrant to search. You can refuse consent by saying ''I do not consent to this search.''",
        "arrest": "Upon arrest, clearly state your right to remain silent and request an attorney immediately."
    }
}', ARRAY['english', 'spanish']),

('Texas', 'Texas Rights Guide', '{
    "dos": [
        "Stay calm and be respectful",
        "Keep your hands where officers can see them",
        "Ask \"Am I free to leave?\"",
        "Invoke your right to remain silent",
        "Ask for an attorney if arrested"
    ],
    "donts": [
        "Don''t resist or become confrontational",
        "Don''t consent to vehicle or property searches",
        "Don''t lie or give false information",
        "Don''t make quick movements",
        "Don''t sign anything without a lawyer present"
    ],
    "scripts": {
        "english": [
            "I am exercising my right to remain silent.",
            "I do not consent to any searches.",
            "Am I free to leave?",
            "I want to speak to a lawyer."
        ],
        "spanish": [
            "Estoy ejerciendo mi derecho a permanecer en silencio.",
            "No consiento a ninguna búsqueda.",
            "¿Soy libre de irme?",
            "Quiero hablar con un abogado."
        ]
    },
    "scenarios": {
        "traffic_stop": "During a Texas traffic stop, provide your driver''s license, registration, and insurance. You may remain silent for other questions.",
        "search": "Officers need a warrant or probable cause to search. Clearly state ''I do not consent to this search.''",
        "arrest": "If arrested, immediately invoke your right to remain silent and request legal representation."
    }
}', ARRAY['english', 'spanish']);
