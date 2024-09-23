# from flask import Flask, Response, request
# from flask_sqlalchemy import SQLAlchemy
# from sqlalchemy.exc import OperationalError
# from sqlalchemy import text
# import os

# app = Flask(__name__) 
# app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/postgres')

# db = SQLAlchemy(app)

# # Helper function to check database connection
# def check_db_connection():
#     try:
#         # Attempt a simple query to check connection
#         db.session.execute(text('SELECT 1'))  # Wrap the SQL in text()
#         return True
#     except OperationalError:
#         return False

# # /healthz endpoint
# @app.route('/healthz', methods=['GET'])
# def health_check():
#     # Check if the request has any payload and return 400 if it does
#     if request.data:
#         return Response(status=400, headers={'Cache-Control': 'no-cache'})  # Bad Request if there's a payload

#     # Check if the application is connected to the database
#     if check_db_connection():
#         return Response(status=200, headers={'Cache-Control': 'no-cache'})  # OK
#     else:
#         return Response(status=503, headers={'Cache-Control': 'no-cache'})  # Service Unavailable

# if __name__ == '__main__':
#     app.run(debug=True, port=int(os.getenv('PORT', 8080)))


from flask import Flask
from flask_sqlalchemy import SQLAlchemy
import os

app = Flask(__name__) 
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('DATABASE_URL', 'postgresql://localhost/postgres')
db = SQLAlchemy(app)

from healthz_check import register_health_check  # Import after db is defined
register_health_check(app, db)  # Pass both the app and db instances

if __name__ == '__main__':
    app.run(debug=True, port=int(os.getenv('PORT', 8080)))