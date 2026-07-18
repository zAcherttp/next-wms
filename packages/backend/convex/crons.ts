import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

const crons = cronJobs();

// Public demo data returns to its deterministic baseline four times per day.
// Convex cron expressions use UTC: 00:00, 06:00, 12:00, and 18:00.
crons.cron(
  "reset-public-demo-data",
  "0 0,6,12,18 * * *",
  internal.myFunctions.resetDemoData,
);

// Run every day at 6:00 AM UTC+7 (Vietnam Time)
// 6:00 AM VN = 23:00 PM UTC (previous day)
crons.cron(
  "check-inventory-expiration",
  "0 23 * * *",
  internal.inventory.checkInventoryExpiration,
);

export default crons;
