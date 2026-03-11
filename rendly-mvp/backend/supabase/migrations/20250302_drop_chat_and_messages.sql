-- Drop all chat interface and messages related tables.
-- Run this to remove whispers/group chat and messages from the database.
-- Order: drop dependents first to satisfy foreign keys.

DROP TABLE IF EXISTS notifications;
DROP TABLE IF EXISTS group_invites;
DROP TABLE IF EXISTS call_logs;
DROP TABLE IF EXISTS user_message_deletes;
DROP TABLE IF EXISTS group_members;
DROP TABLE IF EXISTS groups;
DROP TABLE IF EXISTS messages;
DROP TABLE IF EXISTS user_conversation_meta;
DROP TABLE IF EXISTS conversation_participants;
DROP TABLE IF EXISTS user_blocks;
DROP TABLE IF EXISTS conversations;
