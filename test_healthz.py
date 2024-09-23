# # works only with pytest, not unittest
# import pytest
# from flask import Flask
# from app import app, db
# from unittest.mock import patch
# from sqlalchemy.exc import OperationalError

# @pytest.fixture
# def client():
#     with app.test_client() as client:
#         with app.app_context():
#             db.create_all()
#         yield client

# def test_health_check_successful_db_connection(client):
#     """
#     Test /healthz endpoint with a successful database connection.
#     Mock the db.session.execute call to simulate a successful connection.
#     """
#     with patch('app.db.session.execute', return_value=True):
#         response = client.get('/healthz')
    
#     assert response.status_code == 200
#     assert response.headers['Cache-Control'] == 'no-cache'
#     assert response.data == b''  # No payload expected in the response

# def test_health_check_failed_db_connection(client):
#     """
#     Test /healthz endpoint with a failed database connection.
#     Mock the db.session.execute to simulate a failed connection.
#     """
#     with patch('app.db.session.execute', side_effect=OperationalError('', '', '')):
#         response = client.get('/healthz')
    
#     assert response.status_code == 503
#     assert response.headers['Cache-Control'] == 'no-cache'
#     assert response.data == b''  # No payload expected in the response

# def test_health_check_with_payload(client):
#     """
#     Test /healthz endpoint when a payload is provided in the request.
#     """
#     response = client.get('/healthz', data='payload')
    
#     assert response.status_code == 400
#     assert response.headers['Cache-Control'] == 'no-cache'
#     assert response.data == b''  # No payload expected in the response

# def test_health_check_wrong_method(client):
#     """
#     Test /healthz endpoint with a method other than GET.
#     """
#     response = client.post('/healthz')
    
#     assert response.status_code == 405  # Method not allowed


# THIS WORKS with both pytest and 'python -m unittest'
import unittest
import pytest
from flask import Flask
from app import app, db
from unittest.mock import patch
from sqlalchemy.exc import OperationalError

class TestHealthCheck(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        cls.app = app
        cls.app.config['TESTING'] = True
        # cls.app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://localhost/postgres'  # Use a test database
        cls.client = app.test_client()
        with app.app_context():
            db.create_all()

    def test_health_check_successful_db_connection(self):
        """
        Test /healthz endpoint with a successful database connection.
        Mock the db.session.execute call to simulate a successful connection.
        """
        with patch('app.db.session.execute', return_value=True):
            response = self.client.get('/healthz')
        
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.headers['Cache-Control'], 'no-cache')
        self.assertEqual(response.data, b'')

    def test_health_check_failed_db_connection(self):
        """
        Test /healthz endpoint with a failed database connection.
        Mock the db.session.execute to simulate a failed connection.
        """
        with patch('app.db.session.execute', side_effect=OperationalError('', '', '')):
            response = self.client.get('/healthz')
        
        self.assertEqual(response.status_code, 503)
        self.assertEqual(response.headers['Cache-Control'], 'no-cache')
        self.assertEqual(response.data, b'')

    def test_health_check_with_payload(self):
        """
        Test /healthz endpoint when a payload is provided in the request.
        """
        response = self.client.get('/healthz', data='payload')
        
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.headers['Cache-Control'], 'no-cache')
        self.assertEqual(response.data, b'')

    def test_health_check_wrong_method(self):
        """
        Test /healthz endpoint with a method other than GET.
        """
        response = self.client.post('/healthz')
        
        self.assertEqual(response.status_code, 405)

if __name__ == '__main__':
    unittest.main()