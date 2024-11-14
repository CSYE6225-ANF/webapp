#!/bin/bash

# installs Node.js, handles the web app files, sets permissions, installs dependencies, and creates the systemd service for the web app
# Install Node.js
sudo apt-get update
sudo apt-get install -y curl unzip
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo bash - 
sudo apt-get install -y nodejs
sudo apt-get install zip -y

# Handling Web App Files
echo "Handling Web Application Files..."

# Ensure the application directory exists (now in /home/csye6225)
sudo mkdir -p /home/csye6225

# Copy the zipped application file to the target directory
echo "Copying the application file..."
sudo cp /tmp/webapp.zip /home/csye6225/webapp.zip

# Navigate to the application directory
cd /home/csye6225

# Unzip the application files
echo "Unzipping the application files..."
sudo unzip webapp.zip -d /home/csye6225

# Change ownership and permissions
echo "Changing permissions..."
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod 500 /home/csye6225/server.js

# Remove the zip file after extraction
echo "Cleaning up the zip file..."
sudo rm -f /home/csye6225/webapp.zip

# Install dependencies for the web application
echo "Installing Node.js dependencies..."
cd /home/csye6225
sudo npm install
sudo npm install bcrypt
sudo npm install express multer
sudo npm install @aws-sdk/client-s3
sudo npm install node-statsd
sudo npm install winston
sudo npm install @aws-sdk/client-sns
sudo npm install pg
sudo npm install uuid

# Install CloudWatch Agent
echo "Installing CloudWatch Agent..."
sudo wget https://s3.amazonaws.com/amazoncloudwatch-agent/debian/amd64/latest/amazon-cloudwatch-agent.deb
sudo dpkg -i -E ./amazon-cloudwatch-agent.deb
rm amazon-cloudwatch-agent.deb
sudo systemctl start amazon-cloudwatch-agent

# Copy the webapp.service file to the systemd directory
sudo cp /home/csye6225/webapp.service /etc/systemd/system/webapp.service

# Reload systemd to pick up the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable webapp.service

echo "Node.js and systemd setup complete."
