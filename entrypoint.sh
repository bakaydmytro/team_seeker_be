set -e 

echo "Running migrations..."
npx sequelize-cli db:migrate

echo "Starting the app..."
exec node server.js
