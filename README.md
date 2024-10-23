# webapp

This Repository is part of CSYE6225 - Network Structures & Cloud Computing 
- Student Name: Angel Fernandes
- Professor Name: Tejas Parikh
- Term: Fall 2024

## Prerequisites for building and deploying this application locally:
- Server Operating System: Ubuntu 24.04 LTS
- Programming Language: Node.js
- Relational Database: PostgreSQL
- Backend Framework: Any open-source framework such as Spring, Hibernate, etc.
- ORM Framework: Sequelize
- UI Framework: N/A
- CSS: N/A

## Assignment 1
## Instructions to Build and Deploy this web application:

### 1: Clone the repository
Navigate to project repository after cloning.
```
git clone git@github.com:CSYE6225-ANF/webapp.git
cd webapp
```

### 2. Install Dependencies & Packages
```
npm install
```
Other dependencies that may need installation:
```
npm install sequelize
```

### 3. Set up environment variables
Create a .env file in the root directory and edit with your PostgreSQL credentials.
```
NODE_ENV=development
DB_HOST=DB_HOSTNAME (If running on localhost, use '127.0.0.1' or 'localhost')
DB_USER=db_username
DB_PASSWORD=db_password (Leave blank if no password)
DB_NAME=db_name
DB_PORT=5432 (5432 is default PostgreSQL port, change if needed)
PORT=8080
HOSTNAME=localhost
```

### 4. Run the Application
```
node server.js
```

### 5. Test the application
```
npm test
```

## Assignment 2
## Instructions to Build and Deploy this web application in Digital Ocean:

### 1: Download the zip file

### 2: Initialize the Digital Ocean VM:
In terminal, type:
```
ssh -i id_rsa root<digital_ocean_IP>
```
Replace id_rsa with your private key file name and digital_ocean_IP with your Digital Ocean IP address.
You should see command line 'root@ubuntu-s-1vcpu-512mb-10gb-nyc1-01:' or 'root@<digital_ocean_droplet_name>'

### 2: Transfer files to the VM
Copy the contents of the downloaded zip to the digital ocean terminal. In another terminal, type:
```
scp -i ~/.ssh/digitalocean /Users/<path>/webapp.zip root@<digital_ocean_IP>:/root
```
Type the pass phrase when prompted. Upon completion, close this terminal.

### 2: Install PostgreSQL RDBMS and dependencies on VM:
Inside the Digital Ocean VM, navigate to the root folder using 'cd root'.
Then, do the following, step-by-step:
```
apt install unzip
apt install npm
npm install
npm install bcrypt
```

### 3: Unzip the file
```
unzip webapp.zip
```
After unzipping, navigate inside the directory using 'cd webapp'

### 4. Add .env
Create a new file called .env in the root directory of the project using 'vi .env'. Add the following lines to
```
NODE_ENV=development
DB_HOST=127.0.0.1
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=postgres
DB_PORT=5432
PORT=8080
HOSTNAME=localhost
```

### 5. Run the Application
```
node server.js
```
The application should now be running on port 8080.

### 6. Test in Postman
Launch Postman and validate that you can hit the healthz endpoint and application is healthy.
A GET request to <digital_ocean_IP>:8080/healthz should return 200 OK if it is healhty and 503 if it is not healhty.

To test the user API:
1. A POST request to <digital_ocean_IP>:8080/v1/user using the following body
```
POST 147.182.187.159:8080/v1/user
Body: 
{
  "first_name": "Andrea",
  "last_name": "Francis",
  "password": "andy2001",
  "email": "andrea.francis@example.com"
}
```
should return
```
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "first_name": "Andrea",
  "last_name": "Francis",
  "email": "andrea.francis@example.com",
  "account_created": "2016-08-29T09:12:33.001Z",
  "account_updated": "2016-08-29T09:12:33.001Z"
}
```
and '201 User Created' if successful and '400 Bad Request' if unsuccessful.

2. A PUT request to <digital_ocean_IP>:8080/v1/user/self using the following body and 'Basic Auth' Authorization username and password
```
PUT 147.182.187.159:8080/v1/user/self
Body: 
{
  "first_name": "Andrea Lena",
  "last_name": "Francis",
  "password": "andy2001",
  "email": "andrea.francis@example.com"
}

Authorization: Basic Auth
Username: andrea.francis@example.com
Password: andy2001
```
should return '204 No Content' if successful and '400 Bad Request' if unsuccessful.

3. A GET request to <digital_ocean_IP>:8080/v1/user/self using the following 'Basic Auth' Authorization username and password
```
PUT 147.182.187.159:8080/v1/user/self
Authorization: Basic Auth
Username: andrea.francis@example.com
Password: andy2001
```
should return
```
{
  "id": "d290f1ee-6c54-4b01-90e6-d701748f0851",
  "first_name": "Andrea Lena",
  "last_name": "Francis",
  "email": "andrea.francis@example.com",
  "account_created": "2016-08-29T09:12:33.001Z",
  "account_updated": "2016-08-29T09:12:33.001Z"
}
```
and '200 OK' if successful and '400 Bad Request' if unsuccessful.

### 6. Test the application
```
npm test
```

## Assignment 4 & 5
