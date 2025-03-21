import requests
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = 'uploads'
ALLOWED_EXTENSIONS = {'pdf', 'mp4', 'webm'}

if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

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

# Route pour la connexion des formateurs
@app.route('/api/formateur/login', methods=['POST'])
def formateur_login():
    data = request.json
    email = data.get('email')
    password = data.get('password')
    
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT id, nom, prenom, email, specialites, qualifications, 
                       methode_pedagogique, bio, password_hash, last_login 
                FROM formateur 
                WHERE email = %s AND is_active = 1
            """
            cursor.execute(query, (email,))
            formateur = cursor.fetchone()
            
            if formateur and check_password_hash(formateur['password_hash'], password):
                # Mise à jour du last_login
                update_query = "UPDATE formateur SET last_login = CURRENT_TIMESTAMP WHERE id = %s"
                cursor.execute(update_query, (formateur['id'],))
                connection.commit()
                
                # Convertir les champs JSON en objets Python
                if formateur['specialites']:
                    formateur['specialites'] = json.loads(formateur['specialites'])
                if formateur['qualifications']:
                    formateur['qualifications'] = json.loads(formateur['qualifications'])
                
                return jsonify({
                    "status": "success",
                    "formateur": {
                        "id": formateur['id'],
                        "nom": formateur['nom'],
                        "prenom": formateur['prenom'],
                        "email": formateur['email'],
                        "specialites": formateur['specialites'],
                        "qualifications": formateur['qualifications'],
                        "methode_pedagogique": formateur['methode_pedagogique'],
                        "bio": formateur['bio']
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

# Route pour inscrire un formateur
@app.route('/api/formateur/register', methods=['POST'])
def register_formateur():
    data = request.json
    
    required_fields = ['nom', 'prenom', 'email', 'password', 'bio', 'specialites', 'qualifications', 'methode_pedagogique']
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Tous les champs sont requis"}), 400
        
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifier si l'email existe déjà
            cursor.execute("SELECT id FROM formateur WHERE email = %s", (data['email'],))
            if cursor.fetchone():
                return jsonify({"status": "error", "message": "Cet email est déjà utilisé"}), 400
                
            # Hasher le mot de passe et convertir les listes en JSON
            password_hash = generate_password_hash(data['password'])
            specialites_json = json.dumps(data['specialites'].split(','))
            qualifications_json = json.dumps(data['qualifications'].split(','))
            
            # Insérer le nouveau formateur
            query = """
                INSERT INTO formateur (
                    nom, prenom, email, password_hash, bio, specialites, 
                    qualifications, methode_pedagogique, created_at, is_active
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP, 1)
            """
            cursor.execute(query, (
                data['nom'],
                data['prenom'],
                data['email'],
                password_hash,
                data['bio'],
                specialites_json,
                qualifications_json,
                data['methode_pedagogique']
            ))
            connection.commit()
            
            return jsonify({"status": "success", "message": "Inscription réussie"}), 201
                
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour créer un cours
@app.route('/api/cours/create', methods=['POST'])
def create_course():
    data = request.json
    required_fields = ['formateur_id', 'titre', 'description', 'category', 
                      'difficulty_level', 'duree_estimee']
    
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Tous les champs requis ne sont pas fournis"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Convertir les listes en JSON
            prerequis_json = json.dumps(data.get('prerequis', [])) if data.get('prerequis') else None
            mots_cles_json = json.dumps(data.get('mots_cles', [])) if data.get('mots_cles') else None
            
            query = """
                INSERT INTO cours (
                    formateur_id, titre, description, category, difficulty_level,
                    langue, duree_estimee, prerequis, mots_cles, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, CURRENT_TIMESTAMP)
            """
            
            cursor.execute(query, (
                data['formateur_id'],
                data['titre'],
                data['description'],
                data['category'],
                data['difficulty_level'],
                data.get('langue', 'Français'),
                data['duree_estimee'],
                prerequis_json,
                mots_cles_json
            ))
            
            connection.commit()
            return jsonify({"status": "success", "message": "Cours créé avec succès"}), 201
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les cours d'un formateur
@app.route('/api/formateur/cours', methods=['GET'])
def get_formateur_courses():
    formateur_id = request.args.get('formateur_id')
    if not formateur_id:
        return jsonify({"status": "error", "message": "ID du formateur requis"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT c.*, 
                       f.nom as formateur_nom, 
                       f.prenom as formateur_prenom
                FROM cours c
                JOIN formateur f ON c.formateur_id = f.id
                WHERE c.formateur_id = %s
                ORDER BY c.created_at DESC
            """
            cursor.execute(query, (formateur_id,))
            courses = cursor.fetchall()

            # Convertir les champs JSON en objets Python
            for course in courses:
                if course.get('prerequis'):
                    course['prerequis'] = json.loads(course['prerequis'])
                if course.get('mots_cles'):
                    course['mots_cles'] = json.loads(course['mots_cles'])

            return jsonify({
                "status": "success",
                "courses": courses
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour créer un module
@app.route('/api/module/create', methods=['POST'])
def create_module():
    if 'cours_id' not in request.form:
        return jsonify({"status": "error", "message": "ID du cours requis"}), 400

    type_module = request.form.get('type')
    titre = request.form.get('titre')
    contenu = request.form.get('contenu')
    ordre = request.form.get('ordre', 1)
    cours_id = request.form.get('cours_id')

    if not all([type_module, titre, cours_id]):
        return jsonify({"status": "error", "message": "Champs requis manquants"}), 400

    # Gérer le fichier si présent
    file_path = None
    if 'fichier' in request.files:
        file = request.files['fichier']
        if file and allowed_file(file.filename):
            filename = secure_filename(file.filename)
            file_path = os.path.join(UPLOAD_FOLDER, filename)
            file.save(file_path)
            contenu = file_path

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                INSERT INTO modules (cours_id, type, titre, contenu, ordre)
                VALUES (%s, %s, %s, %s, %s)
            """
            cursor.execute(query, (cours_id, type_module, titre, contenu, ordre))
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "Module créé avec succès"
            }), 201

        except Error as e:
            if file_path and os.path.exists(file_path):
                os.remove(file_path)
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les modules d'un cours
@app.route('/api/modules/<cours_id>', methods=['GET'])
def get_modules(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT *
                FROM modules
                WHERE cours_id = %s
                ORDER BY ordre ASC
            """
            cursor.execute(query, (cours_id,))
            modules = cursor.fetchall()

            return jsonify({
                "status": "success",
                "modules": modules
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Ajouter une route pour servir les fichiers uploadés
@app.route('/uploads/<path:filename>')
def serve_file(filename):
    return send_from_directory(UPLOAD_FOLDER, filename)

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
