#!/bin/bash

# starts the webapp.service and checks its statu
# Start the webapp service
sudo systemctl start webapp.service

# Check the status of the service
sudo systemctl status webapp.service --no-pager

echo "Web application started."
