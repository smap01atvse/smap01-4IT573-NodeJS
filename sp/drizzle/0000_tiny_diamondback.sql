CREATE TABLE `answers` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`round_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`answer` text NOT NULL,
	`is_correct` integer NOT NULL,
	`answered_at` integer NOT NULL,
	`points` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `game_rounds` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` integer NOT NULL,
	`question_id` integer NOT NULL,
	`round_number` integer NOT NULL,
	`started_at` integer NOT NULL,
	`ended_at` integer
);
--> statement-breakpoint
CREATE TABLE `lobbies` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`status` text NOT NULL,
	`rounds` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `lobby_players` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`lobby_id` integer NOT NULL,
	`user_id` integer NOT NULL,
	`score` integer DEFAULT 0 NOT NULL,
	`joined_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `lobby_players_lobby_id_user_id_unique` ON `lobby_players` (`lobby_id`,`user_id`);--> statement-breakpoint
CREATE TABLE `questions` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`question` text NOT NULL,
	`correct_answer` text NOT NULL,
	`options` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `todos` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`title` text NOT NULL,
	`done` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`nickname` text NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_nickname_unique` ON `users` (`nickname`);