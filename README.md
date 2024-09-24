# webapp

This Repository is part of CSYE6225 - Network Structures & Cloud Computing 
- Student Name: Angel Fernandes
- Professor Name: Tejas Parikh
- Term: Fall 2024

## Prerequisites for building and deploying this application locally:
- Server Operating System: Ubuntu 24.04 LTS
- Programming Language: Python
- Relational Database: MySQL or PostgreSQL
- Backend Framework: Any open-source framework such as Spring, Hibernate, etc.
- ORM Framework: Python - SQLAlchemy
- UI Framework: N/A
- CSS: N/A

## Instructions to Build and Deploy this web application:

### 1: Clone the repository
```
git clone <repository-url>
cd webapp
```

### 2. Install Dependencies & Packages
```
python3 -m venv venv
source venv/bin/activate
```
```
pip install -r requirements.txt
```

### 3. Run Database Migrations
Make sure the database is created and ready. You can initialize your database by running the following command inside the Python shell:
```
python
>>> from app import db
>>> db.create_all()
>>> exit()
```

### 4. Run the Application
```
python app.py
```

## Running Tests
Unit tests are available for the /healthz endpoint. You can run the tests using pytest or unittest. To run the tests:
```
pytest test_healthz.py
```