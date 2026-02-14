-- Delete orphaned auth records that have no created_at (broken/ghost records)
-- These block new signups with duplicate key errors
DELETE FROM auth.users WHERE id = '096f9f22-6edd-4286-81ff-8403bce0ce75';
DELETE FROM auth.users WHERE id = '2b4af056-33c9-48af-9d23-6878fdf67b70';