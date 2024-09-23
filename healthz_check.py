from flask import Response, request
from sqlalchemy.exc import OperationalError
from sqlalchemy import text

def register_health_check(app, db):
    # Helper function to check database connection
    def check_db_connection():
        try:
            db.session.execute(text('SELECT 1'))
            return True
        except OperationalError:
            return False

    # /healthz endpoint
    @app.route('/healthz', methods=['GET'])
    def health_check():
        if request.method == 'GET' and request.data:
            return Response(status=400, headers={'Cache-Control': 'no-cache'})

        if check_db_connection():
            return Response(status=200, headers={'Cache-Control': 'no-cache'})
        else:
            return Response(status=503, headers={'Cache-Control': 'no-cache'})
