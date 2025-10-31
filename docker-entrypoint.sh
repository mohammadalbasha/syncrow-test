
# Run migrations
# echo "Running database migrations..."
# npm run db:migrate

# Run seeders
echo "Running database seeders..."
npm run db:seed

# Start the application
echo "Starting application..."
exec node dist/main 