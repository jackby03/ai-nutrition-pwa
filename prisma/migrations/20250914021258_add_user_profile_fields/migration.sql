/*
  Warnings:

  - Added the required column `updatedAt` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "profileCompleted" BOOLEAN NOT NULL DEFAULT false,
    "age" INTEGER,
    "sex" TEXT,
    "height" REAL,
    "weight" REAL,
    "activityLevel" TEXT,
    "goal" TEXT,
    "dietType" TEXT,
    "allergies" TEXT,
    "dislikes" TEXT,
    "targetCalories" INTEGER,
    "targetProtein" REAL,
    "targetCarbs" REAL,
    "targetFat" REAL,
    "preferences" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_User" ("email", "id", "name", "password", "preferences") SELECT "email", "id", "name", "password", "preferences" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
