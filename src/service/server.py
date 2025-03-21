import requests
from flask import Flask, request, jsonify
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash

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
            # D'abord, récupérer l'utilisateur et son mot de passe hashé
            query = """
                SELECT id, nom, prenom, email, niveau, password_hash, last_login 
                FROM eleve 
                WHERE email = %s AND is_active = 1
            """
            cursor.execute(query, (email,))
            user = cursor.fetchone()
            
            # Vérifier si l'utilisateur existe et si le mot de passe correspond
            if user and check_password_hash(user['password_hash'], password):
                # Mise à jour du last_login
                update_query = "UPDATE eleve SET last_login = CURRENT_TIMESTAMP WHERE id = %s"
                cursor.execute(update_query, (user['id'],))
                connection.commit()
                
                return jsonify({
                    "status": "success",
                    "user": {
                        "id": user['id'],
                        "nom": user['nom'],
                        "prenom": user['prenom'],
                        "email": user['email'],
                        "niveau": user['niveau']
                    }
                })
            else:
                return jsonify({"status": "error", "message": "Email ou mot de passe incorrect"}), 401
                
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

# Route pour inscrire un élève
@app.route('/api/register', methods=['POST'])
def register():
    data = request.json
    
    # Vérification des données requises
    required_fields = ['nom', 'prenom', 'email', 'password', 'niveau']
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Tous les champs sont requis"}), 400
        
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifier si l'email existe déjà
            cursor.execute("SELECT id FROM eleve WHERE email = %s", (data['email'],))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "Cet email est déjà utilisé"}), 400
                
            # Hasher le mot de passe
            password_hash = generate_password_hash(data['password'])
            
            # Insérer le nouvel élève
            query = """
                INSERT INTO eleve (nom, prenom, email, password_hash, niveau, created_at, is_active)
                VALUES (%s, %s, %s, %s, %s, CURRENT_TIMESTAMP, 1)
            """
            cursor.execute(query, (
                data['nom'],
                data['prenom'],
                data['email'],
                password_hash,
                data['niveau']
            ))
            connection.commit()
            
            return jsonify({"status": "success", "message": "Inscription réussie"}), 201
                
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
