CREATE TABLE event_responses (
    id TEXT PRIMARY KEY,
    event_id TEXT NOT NULL REFERENCES events(id) ON DELETE CASCADE,
    user_id TEXT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    response TEXT NOT NULL, -- going | not_going
    UNIQUE(event_id, user_id)
);