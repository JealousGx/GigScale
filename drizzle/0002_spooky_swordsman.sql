CREATE TABLE `scan_jobs` (
	`id` varchar(48) NOT NULL,
	`user_id` varchar(48) NOT NULL,
	`profile_url` varchar(2048) NOT NULL,
	`platform` enum('upwork','fiverr') NOT NULL,
	`status` enum('queued','running','completed','error') NOT NULL,
	`error_message` text,
	`scraped_markdown` text,
	`provider_used` varchar(100),
	`profile_id` varchar(48),
	`analysis_id` varchar(48),
	`started_at` timestamp(3),
	`finished_at` timestamp(3),
	`created_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `scan_jobs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_profile_id_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `scan_jobs` ADD CONSTRAINT `scan_jobs_analysis_id_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `scan_jobs_user_status_updated_idx` ON `scan_jobs` (`user_id`,`status`,`updated_at`);