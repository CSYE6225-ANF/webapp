#!/bin/bash

# Set ownership and permissions for the web application directory and files
echo "Setting ownership and permissions..."
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod -R 775 /home/csye6225
sudo chmod 500 /home/csye6225/server.js
echo "Permissions and ownership set"

# Remove old dependencies and reinstall Node.js packages
cd /home/csye6225
sudo rm -rf node_modules package-lock.json
sudo npm install
sudo npm install bcrypt
echo "Node.js dependencies installed"

# Create a systemd service file for the web application
echo "Configuring the systemd service..."
sudo cp /home/csye6225/webapp.service /etc/systemd/system/webapp.service
sudo chown root:root /etc/systemd/system/webapp.service
sudo chmod 644 /etc/systemd/system/webapp.service
echo "Systemd service file created and configured"

# Reload systemd to pick up the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable webapp.service

# Start the webapp service
sudo systemctl start webapp.service

# Check the status of the service
sudo systemctl status webapp.service --no-pager

echo "Web application started and service running"
