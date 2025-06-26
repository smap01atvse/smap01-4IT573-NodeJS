CREATE TABLE `game_results` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`players` text NOT NULL,
	`scores` text NOT NULL,
	`created_at` integer
);
