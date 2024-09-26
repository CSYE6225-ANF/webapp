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
