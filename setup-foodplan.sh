#!/bin/bash

echo "=== Setting up Food Plan Database ==="
echo ""

echo "Step 1: Generating Prisma Client..."
npx prisma generate

echo ""
echo "Step 2: Creating Migration..."
npx prisma migrate dev --name add_food_plan_models

echo ""
echo "=== Setup Complete! ==="
echo ""
echo "Now you can:"
echo "1. Restart your dev server (npm run dev)"
echo "2. Navigate to the dashboard"
echo "3. Click 'Create Meal Plan'"
echo ""
