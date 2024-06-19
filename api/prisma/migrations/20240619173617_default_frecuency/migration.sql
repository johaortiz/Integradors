-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "frequency_days" INTEGER NOT NULL DEFAULT 0,
    "frequency_hours" INTEGER NOT NULL DEFAULT 0,
    "frequency_minutes" INTEGER NOT NULL DEFAULT 0,
    "max_backup_limit" INTEGER NOT NULL
);
INSERT INTO "new_Device" ("frequency_days", "frequency_hours", "frequency_minutes", "host", "id", "max_backup_limit", "name", "password", "username") SELECT "frequency_days", "frequency_hours", "frequency_minutes", "host", "id", "max_backup_limit", "name", "password", "username" FROM "Device";
DROP TABLE "Device";
ALTER TABLE "new_Device" RENAME TO "Device";
CREATE UNIQUE INDEX "Device_host_key" ON "Device"("host");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
