#!/bin/bash

#echo "Changing permissions..."
sudo chown -R csye6225:csye6225 /home/csye6225
sudo chmod 500 /home/csye6225/server.js
echo "Permissions and ownership set"

# Remove the zip file after extraction
echo "Cleaning up the zip file..."
sudo rm -f /home/csye6225/webapp.zip

# Install dependencies for the web application
cd /home/csye6225
sudo npm install
sudo npm install bcrypt
echo "Node.js dependencies installed"

# Copy the webapp.service file to the systemd directory
if [ -f /home/csye6225/webapp.service ]; then
    sudo cp /home/csye6225/webapp.service /etc/systemd/system/webapp.service
    sudo chown root:root /etc/systemd/system/webapp.service
    sudo chmod 644 /etc/systemd/system/webapp.service
    echo "Systemd service file created and configured"
else
    echo "ERROR: /home/csye6225/webapp.service not found. Exiting script."
    exit 1
fi

# Reload systemd to pick up the new service
sudo systemctl daemon-reload

# Enable the service to start on boot
sudo systemctl enable webapp.service

# Start the webapp service
sudo systemctl start webapp.service

# Check the status of the service
sudo systemctl status webapp.service --no-pager

echo "Web application started and service running"
