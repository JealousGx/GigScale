CREATE TABLE `provider_daily_quota` (
	`id` varchar(48) NOT NULL,
	`provider` varchar(100) NOT NULL,
	`day` varchar(10) NOT NULL,
	`provider_used` int NOT NULL DEFAULT 0,
	`updated_at` timestamp(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
	CONSTRAINT `provider_daily_quota_id` PRIMARY KEY(`id`),
	CONSTRAINT `provider_daily_quota_provider_day_unique` UNIQUE(`provider`,`day`)
);
--> statement-breakpoint
CREATE INDEX `provider_daily_quota_provider_idx` ON `provider_daily_quota` (`provider`);--> statement-breakpoint
CREATE INDEX `provider_daily_quota_day_idx` ON `provider_daily_quota` (`day`);