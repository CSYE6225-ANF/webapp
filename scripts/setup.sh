#!/bin/bash

# Set the non-interactive mode for apt
export DEBIAN_FRONTEND=noninteractive

# Update and install necessary packages
sudo apt-get update -y
sudo apt-get upgrade -y
echo 'System updated and upgraded'

# Install required packages: unzip, gcc, g++, curl, PostgreSQL, and bcrypt for password hashing
sudo apt-get install -y unzip gcc g++ curl postgresql postgresql-contrib libffi-dev build-essential
echo 'Installed system dependencies'

# Install Node.js and npm (latest LTS version)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash -
sudo apt-get install -y nodejs
sudo apt-get install zip -y
echo 'Installed Node.js and npm'

# Install bcrypt for password hashing
sudo npm install bcrypt --save
echo 'Installed bcrypt using npm'

# Start and enable PostgreSQL service
sudo service postgresql start
sudo systemctl enable postgresql
echo 'Started and enabled PostgreSQL'

# Configure PostgreSQL with environment variables
sudo -u postgres psql -c "ALTER USER postgres PASSWORD '${DB_PASSWORD}';"
sudo -u postgres psql -c "CREATE DATABASE ${DB_NAME};"
echo 'Configured Postgres database and user'

# Create the csye6225 group and user for the web application
sudo groupadd csye6225
sudo useradd -r -g csye6225 -m -s /usr/sbin/nologin csye6225
echo 'Created group and user for the web application'

# Handling Web Application Files
echo "Handling Web Application Files..."

# Ensure the application directory exists (now in /home/csye6225)
sudo mkdir -p /home/csye6225

# Check if /tmp/webapp.zip exists before attempting to copy it
if [ -f /tmp/webapp.zip ]; then
    echo "Found webapp.zip in /tmp. Proceeding to copy..."
    sudo cp /tmp/webapp.zip /home/csye6225/webapp.zip
    echo "Copy successful"
else
    echo "ERROR: /tmp/webapp.zip not found. Exiting script."
    exit 1
fi

# Navigate to the application directory
cd /home/csye6225

# Unzip the application files
if [ -f webapp.zip ]; then
    echo "Unzipping the application files..."
    sudo unzip webapp.zip -d /home/csye6225
    echo "Application files unzipped in /home/csye6225"
else
    echo "ERROR: webapp.zip was not copied to /home/csye6225. Exiting script."
    exit 1
fi
