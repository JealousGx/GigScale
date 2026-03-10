CREATE TABLE `accounts` (
	`id` varchar(48) NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` varchar(48) NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` timestamp(3),
	`refresh_token_expires_at` timestamp(3),
	`scope` text,
	`password` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	CONSTRAINT `accounts_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `analyses` (
	`id` varchar(48) NOT NULL,
	`profile_id` varchar(48) NOT NULL,
	`profile_score` decimal(5,2) NOT NULL DEFAULT '0',
	`visibility_score` decimal(5,2) NOT NULL DEFAULT '0',
	`conversion_score` decimal(5,2) NOT NULL DEFAULT '0',
	`trust_score` decimal(5,2) NOT NULL DEFAULT '0',
	`completeness_score` decimal(5,2) NOT NULL DEFAULT '0',
	`summary` text,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `analyses_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` varchar(48) NOT NULL,
	`user_id` varchar(48) NOT NULL,
	`platform` enum('upwork','fiverr') NOT NULL,
	`profile_url` varchar(2048) NOT NULL,
	`profile_title` varchar(500) NOT NULL,
	`profile_description` text NOT NULL,
	`review_rating` decimal(3,2) NOT NULL DEFAULT '0',
	`review_count` int NOT NULL DEFAULT 0,
	`portfolio_count` int NOT NULL DEFAULT 0,
	`profile_age_years` decimal(4,1) NOT NULL DEFAULT '0',
	`crawl_meta` json,
	`last_scanned_at` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `profiles_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `rewrites` (
	`id` varchar(48) NOT NULL,
	`profile_id` varchar(48) NOT NULL,
	`type` enum('headline','description','gig') NOT NULL,
	`mode` enum('seo_optimization','conversion_optimization','premium_client_targeting','clarity_improvement') NOT NULL,
	`original_text` text NOT NULL,
	`rewritten_text` text NOT NULL,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `rewrites_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `sessions` (
	`id` varchar(48) NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`token` varchar(255) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` varchar(48) NOT NULL,
	CONSTRAINT `sessions_id` PRIMARY KEY(`id`),
	CONSTRAINT `sessions_token_unique` UNIQUE(`token`)
);
--> statement-breakpoint
CREATE TABLE `subscriptions` (
	`id` varchar(48) NOT NULL,
	`user_id` varchar(48) NOT NULL,
	`plan` enum('free','pro','enterprise','custom') NOT NULL DEFAULT 'free',
	`status` enum('active','inactive','cancelled','past_due') NOT NULL,
	`credits_total` int NOT NULL DEFAULT 2,
	`credits_used` int NOT NULL DEFAULT 0,
	`polar_subscription_id` varchar(255),
	`current_period_start` timestamp,
	`current_period_end` timestamp,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	`updated_at` timestamp NOT NULL DEFAULT (now()) ON UPDATE CURRENT_TIMESTAMP,
	CONSTRAINT `subscriptions_id` PRIMARY KEY(`id`),
	CONSTRAINT `subscriptions_polar_id_idx` UNIQUE(`polar_subscription_id`)
);
--> statement-breakpoint
CREATE TABLE `suggestions` (
	`id` varchar(48) NOT NULL,
	`analysis_id` varchar(48) NOT NULL,
	`title` varchar(500) NOT NULL,
	`description` text NOT NULL,
	`recommended_fix` text NOT NULL,
	`priority` enum('critical','high','medium','low') NOT NULL,
	`is_applied` boolean NOT NULL DEFAULT false,
	`created_at` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `suggestions_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `usage_logs` (
	`id` varchar(48) NOT NULL,
	`user_id` varchar(48) NOT NULL,
	`action` enum('profile_scan','suggestion_generated','rewrite_generated','report_exported') NOT NULL,
	`credits_consumed` int NOT NULL DEFAULT 1,
	`metadata` json,
	`timestamp` timestamp NOT NULL DEFAULT (now()),
	CONSTRAINT `usage_logs_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` varchar(48) NOT NULL,
	`name` varchar(255),
	`email` varchar(255) NOT NULL,
	`email_verified` boolean NOT NULL DEFAULT false,
	`image` text,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `users_id` PRIMARY KEY(`id`),
	CONSTRAINT `users_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `verifications` (
	`id` varchar(48) NOT NULL,
	`identifier` varchar(255) NOT NULL,
	`value` text NOT NULL,
	`expires_at` timestamp(3) NOT NULL,
	`created_at` timestamp(3) NOT NULL DEFAULT (now()),
	`updated_at` timestamp(3) NOT NULL DEFAULT (now()),
	CONSTRAINT `verifications_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `accounts` ADD CONSTRAINT `accounts_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `analyses` ADD CONSTRAINT `analyses_profile_id_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `profiles` ADD CONSTRAINT `profiles_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `rewrites` ADD CONSTRAINT `rewrites_profile_id_profiles_id_fk` FOREIGN KEY (`profile_id`) REFERENCES `profiles`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `sessions` ADD CONSTRAINT `sessions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `subscriptions` ADD CONSTRAINT `subscriptions_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `suggestions` ADD CONSTRAINT `suggestions_analysis_id_analyses_id_fk` FOREIGN KEY (`analysis_id`) REFERENCES `analyses`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE `usage_logs` ADD CONSTRAINT `usage_logs_user_id_users_id_fk` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX `accounts_user_id_idx` ON `accounts` (`user_id`);--> statement-breakpoint
CREATE INDEX `analyses_profile_id_idx` ON `analyses` (`profile_id`);--> statement-breakpoint
CREATE INDEX `analyses_profile_created_idx` ON `analyses` (`profile_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `profiles_user_id_idx` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE INDEX `profiles_user_platform_idx` ON `profiles` (`user_id`,`platform`);--> statement-breakpoint
CREATE INDEX `rewrites_profile_id_idx` ON `rewrites` (`profile_id`);--> statement-breakpoint
CREATE INDEX `rewrites_profile_created_idx` ON `rewrites` (`profile_id`,`created_at`);--> statement-breakpoint
CREATE INDEX `sessions_user_id_idx` ON `sessions` (`user_id`);--> statement-breakpoint
CREATE INDEX `subscriptions_user_id_idx` ON `subscriptions` (`user_id`);--> statement-breakpoint
CREATE INDEX `suggestions_analysis_id_idx` ON `suggestions` (`analysis_id`);--> statement-breakpoint
CREATE INDEX `suggestions_priority_idx` ON `suggestions` (`priority`);--> statement-breakpoint
CREATE INDEX `usage_logs_user_id_idx` ON `usage_logs` (`user_id`);--> statement-breakpoint
CREATE INDEX `usage_logs_user_action_ts_idx` ON `usage_logs` (`user_id`,`action`,`timestamp`);--> statement-breakpoint
CREATE INDEX `verifications_identifier_idx` ON `verifications` (`identifier`);