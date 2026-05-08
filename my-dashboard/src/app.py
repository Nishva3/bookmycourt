from flask import Flask, request, jsonify
import mysql.connector
from flask_cors import CORS
from werkzeug.security import generate_password_hash, check_password_hash

app = Flask(__name__)
CORS(app)

# MySQL connection
db = mysql.connector.connect(
    host="localhost",
    user="root",
    password="Tatasky@15", 
    database="BookmyCourt"
)
cursor = db.cursor()

# ---------------------- REGISTER ----------------------
@app.route('/register', methods=['POST'])
def register():
    data = request.json
    name = data.get('name')
    email = data.get('email')
    mobile = data.get('mobile')   # ✅ new field
    password = data.get('password')

    if not name or not email or not mobile or not password:
        return jsonify({'message': 'All fields are required'}), 400

    cursor.execute("SELECT * FROM userss WHERE email = %s", (email,))
    if cursor.fetchone():
        return jsonify({'message': 'User already exists'}), 409

    try:
        hashed_password = generate_password_hash(password)

        cursor.execute("INSERT INTO userss (name, email, mobile, password) VALUES (%s, %s, %s, %s)",
                       (name, email, mobile, hashed_password))
        db.commit()
        return jsonify({'message': 'User registered successfully'}), 201
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Registration failed: {str(e)}'}), 500

# ---------------------- LOGIN ----------------------
@app.route('/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')

    cursor.execute("SELECT password FROM userss WHERE email = %s", (email,))
    user = cursor.fetchone()

    if not user:
        return jsonify({'message': 'User not registered yet'}), 404  # ✅ clearer

    if check_password_hash(user[0], password):
        return jsonify({'message': 'Login successful'}), 200
    else:
        return jsonify({'message': 'Invalid password'}), 401


# ---------------------- USER LIST ----------------------
@app.route('/api/users')
def get_users():
    dict_cursor = db.cursor(dictionary=True)
    dict_cursor.execute("SELECT id, name, email, mobile FROM userss")  # ✅ include mobile
    users = dict_cursor.fetchall()
    dict_cursor.close()
    return jsonify(users)

# ---------------------- BOOKING ----------------------
@app.route('/confirm-booking', methods=['POST'])
def confirm_booking():
    try:
        cursor.execute("UPDATE booking_count SET count = count + 1 WHERE id = 1")
        db.commit()
        return jsonify({'message': 'Booking confirmed and count incremented'}), 200
    except Exception as e:
        db.rollback()
        return jsonify({'message': f'Error: {str(e)}'}), 500

@app.route('/booking-count', methods=['GET'])
def get_booking_count():
    try:
        cursor.execute("SELECT count FROM booking_count WHERE id = 1")
        result = cursor.fetchone()
        return jsonify({'count': result[0]}), 200
    except Exception as e:
        return jsonify({'message': f'Error: {str(e)}'}), 500

# ---------------------- MAIN ----------------------
if __name__ == '__main__':
    app.run(debug=True)
