import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error

app = Flask(__name__)
CORS(app)

# Configuration de la base de données
db_config = {
    'host': 'localhost',
    'user': 'root',
    'password': '',
    'database': 'samlearn'
}

# Fonction pour créer une connexion à la base de données
def create_db_connection():
    try:
        connection = mysql.connector.connect(**db_config)
        print("Connexion à MySQL réussie")
        return connection
    except Error as e:
        print(f"Erreur lors de la connexion à MySQL: {e}")
        return None

# Route exemple pour la page d'accueil
@app.route('/')
def home():
    return jsonify({"message": "Bienvenue sur le serveur!"})

# Route exemple pour une requête POST
@app.route('/api/data', methods=['POST'])
def receive_data():
    data = request.json
    return jsonify({"status": "success", "received": data})

# Route pour la vérification des identifiants
@app.route('/api/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            # Requête SQL pour vérifier les identifiants
            query = "SELECT * FROM eleves WHERE email = %s AND password = %s"
            cursor.execute(query, (email, password))
            user = cursor.fetchone()
            
            if user:
                return jsonify({
                    "status": "success",
                    "user": {
                        "id": user['id'],
                        "nom": user['nom'],
                        "email": user['email']
                    }
                })
            else:
                return jsonify({"status": "error", "message": "Identifiants invalides"}), 401
                
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer tous les cours
@app.route('/api/courses', methods=['GET'])
def get_courses():
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute("SELECT * FROM courses")
            courses = cursor.fetchall()
            return jsonify({"status": "success", "courses": courses})
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
