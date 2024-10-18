#!/bin/bash

# installs PostgreSQL and configures the database using the environment variables passed
# Update package list and install PostgreSQL
sudo apt-get update
sudo apt-get install -y postgresql postgresql-contrib

# Create PostgreSQL database and user
# sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
# sudo -u postgres psql -c "CREATE USER ${DB_USER} WITH PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "ALTER USER ${DB_USER} PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE ${DB_NAME} TO ${DB_USER};"

# Ensure PostgreSQL listens on all IP addresses
sudo sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" /etc/postgresql/*/main/postgresql.conf

# Change 'peer' to 'trust' for local connections in pg_hba.conf
sudo sed -ri "s/^(local\s+all\s+postgres\s+)peer/\1trust/" /etc/postgresql/*/main/pg_hba.conf
sudo sed -ri "s/^(local\s+all\s+all\s+)peer/\1trust/" /etc/postgresql/*/main/pg_hba.conf

# Configure PostgreSQL to allow password authentication from all IPs
echo "host    all             all             0.0.0.0/0               md5" | sudo tee -a /etc/postgresql/*/main/pg_hba.conf

# Restart PostgreSQL
sudo systemctl restart postgresql

echo "PostgreSQL setup complete."
