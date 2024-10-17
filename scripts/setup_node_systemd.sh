#!/bin/bash

# installs Node.js, handles the web app files, sets permissions, installs dependencies, and creates the systemd service for the web app
# Install Node.js
sudo apt-get update
sudo apt-get install -y curl unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - 
sudo apt-get install -y nodejs

# Handling Web App Files
echo "Handling Web Application Files..."

# Ensure the application directory exists
sudo mkdir -p /home/csye6225
sudo mkdir -p /home/csye6225/webapp

# Copy the zipped application file to the target directory
echo "Copying the application file..."
sudo cp /tmp/webapp.zip /home/csye6225/webapp.zip

# Navigate to the application directory
cd /home/csye6225

# Unzip the application files
echo "Unzipping the application files..."
sudo unzip webapp.zip -d /home/csye6225/

# Change ownership and permissions
echo "Changing permissions..."
sudo chown -R csye6225:csye6225 /home/csye6225/webapp
sudo chmod 500 /home/csye6225/webapp/server.js

# Remove the zip file after extraction
echo "Cleaning up the zip file..."
sudo rm -f /home/csye6225/webapp.zip

# Install dependencies for the web application
cd /home/csye6225/webapp
sudo npm install

# Reload systemd to pick up the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable webapp.service

# Start the service
sudo systemctl start webapp.service

echo "Node.js and systemd setup complete."