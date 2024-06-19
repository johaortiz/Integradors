-- CreateTable
CREATE TABLE "Device" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "host" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "frequency_days" INTEGER NOT NULL,
    "frequency_hours" INTEGER NOT NULL,
    "frequency_minutes" INTEGER NOT NULL,
    "max_backup_limit" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Device_host_key" ON "Device"("host");
