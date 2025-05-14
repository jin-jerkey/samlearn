import requests
import json
from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
import mysql.connector
from mysql.connector import Error
from werkzeug.security import generate_password_hash, check_password_hash
import os
from werkzeug.utils import secure_filename

 
from ml.course_chatbot import CourseChatbot

app = Flask(__name__)
CORS(app)

UPLOAD_FOLDER = '../public/uploads'  # Chemin relatif vers le dossier public/uploads
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

# Initialiser les modèles
 
chatbot = CourseChatbot()

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

# Route pour récupérer les statistiques des cours d'un formateur
@app.route('/api/formateur/cours/stats/<formateur_id>', methods=['GET'])
def get_formateur_course_stats(formateur_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT 
                    c.*,
                    COUNT(DISTINCT ec.eleve_id) as nb_eleves,
                    COUNT(DISTINCT com.id) as nb_commentaires
                FROM cours c
                LEFT JOIN eleve_cours ec ON c.id = ec.cours_id
                LEFT JOIN commentaires com ON c.id = com.cours_id
                WHERE c.formateur_id = %s
                GROUP BY c.id
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
            # Stocker seulement le nom du fichier dans la base de données
            contenu = filename  # Au lieu du chemin complet

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

# Route pour récupérer un cours par ID
@app.route('/api/cours/<cours_id>', methods=['GET'])
def get_course(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT c.*
                FROM cours c
                WHERE c.id = %s
            """
            cursor.execute(query, (cours_id,))
            course = cursor.fetchone()

            if course:
                # Convertir les champs JSON en objets Python
                if course.get('prerequis'):
                    course['prerequis'] = json.loads(course['prerequis'])
                if course.get('mots_cles'):
                    course['mots_cles'] = json.loads(course['mots_cles'])

                return jsonify({
                    "status": "success",
                    "course": course
                })
            else:
                return jsonify({"status": "error", "message": "Cours non trouvé"}), 404

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour créer un examen
@app.route('/api/examen/create', methods=['POST'])
def create_exam():
    data = request.json
    required_fields = ['cours_id', 'titre', 'seuil_reussite', 'questions']
    
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Tous les champs requis ne sont pas fournis"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Créer l'examen
            exam_query = """
                INSERT INTO examens (cours_id, titre, seuil_reussite)
                VALUES (%s, %s, %s)
            """
            cursor.execute(exam_query, (
                data['cours_id'],
                data['titre'],
                data['seuil_reussite']
            ))
            
            exam_id = cursor.lastrowid
            
            # Créer les questions du quiz avec les réponses correctes
            quiz_query = """
                INSERT INTO quizzes (examen_id, question, options, reponse_correcte, points)
                VALUES (%s, %s, %s, %s, %s)
            """
            
            for question in data['questions']:
                cursor.execute(quiz_query, (
                    exam_id,
                    question['question'],
                    json.dumps(question['options']),
                    json.dumps(question['reponse_correcte']),  # Stocke les index des réponses correctes
                    question.get('points', 1)
                ))
            
            connection.commit()
            return jsonify({
                "status": "success",
                "message": "Examen créé avec succès",
                "exam_id": exam_id
            }), 201
            
        except Error as e:
            connection.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les examens d'un cours
@app.route('/api/examens/cours/<cours_id>', methods=['GET'])
def get_course_exams(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer l'examen et ses questions
            query = """
                SELECT e.*, q.id as question_id, q.question, q.options, q.points
                FROM examens e
                LEFT JOIN quizzes q ON e.id = q.examen_id
                WHERE e.cours_id = %s
            """
            cursor.execute(query, (cours_id,))
            rows = cursor.fetchall()
            
            # Organiser les données
            exams = {}
            for row in rows:
                exam_id = row['id']
                if exam_id not in exams:
                    exams[exam_id] = {
                        'id': exam_id,
                        'titre': row['titre'],
                        'seuil_reussite': row['seuil_reussite'],
                        'questions': []
                    }
                
                if row['question_id']:  # Si la question existe
                    exams[exam_id]['questions'].append({
                        'id': row['question_id'],
                        'question': row['question'],
                        'options': json.loads(row['options']),
                        'points': row['points']
                    })
            
            return jsonify({
                "status": "success",
                "exams": list(exams.values())
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les examens d'un élève
@app.route('/api/formateur/update/<formateur_id>', methods=['PUT'])
def update_formateur(formateur_id):
    data = request.json
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Convertir les listes en JSON si nécessaire
            if 'specialites' in data:
                data['specialites'] = json.dumps(data['specialites'])
            if 'qualifications' in data:
                data['qualifications'] = json.dumps(data['qualifications'])
            
            # Construire la requête de mise à jour dynamiquement
            fields = []
            values = []
            for key, value in data.items():
                if key not in ['id', 'password']:
                    fields.append(f"{key} = %s")
                    values.append(value)
            
            values.append(formateur_id)
            query = f"""
                UPDATE formateur 
                SET {', '.join(fields)}
                WHERE id = %s
            """
            
            cursor.execute(query, values)
            connection.commit()
            
            return jsonify({
                "status": "success",
                "message": "Profil mis à jour avec succès"
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

# Route pour mettre à jour le mot de passe d'un formateur
@app.route('/api/formateur/password/<formateur_id>', methods=['PUT'])
def update_formateur_password(formateur_id):
    data = request.json
    if not all(k in data for k in ('currentPassword', 'newPassword')):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifier l'ancien mot de passe
            cursor.execute("SELECT password_hash FROM formateur WHERE id = %s", (formateur_id,))
            formateur = cursor.fetchone()
            
            if not formateur or not check_password_hash(formateur['password_hash'], data['currentPassword']):
                return jsonify({"status": "error", "message": "Mot de passe actuel incorrect"}), 401
            
            # Mettre à jour avec le nouveau mot de passe
            new_password_hash = generate_password_hash(data['newPassword'])
            cursor.execute(
                "UPDATE formateur SET password_hash = %s WHERE id = %s",
                (new_password_hash, formateur_id)
            )
            connection.commit()
            
            return jsonify({
                "status": "success",
                "message": "Mot de passe mis à jour avec succès"
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les cours disponibles
@app.route('/api/cours/disponibles', methods=['GET'])
def get_available_courses():
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
                ORDER BY c.created_at DESC
            """
            cursor.execute(query)
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

# Route pour récupérer les détails d'un cours
@app.route('/api/cours/<cours_id>/details', methods=['GET'])
def get_course_details(cours_id):
    eleve_id = request.args.get('eleve_id')
    if not eleve_id:
        return jsonify({"status": "error", "message": "ID de l'élève requis"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer les informations du cours
            query = """
                SELECT c.*, f.nom as formateur_nom, f.prenom as formateur_prenom,
                       CASE WHEN ec.eleve_id IS NOT NULL THEN TRUE ELSE FALSE END as is_inscrit
                FROM cours c
                JOIN formateur f ON c.formateur_id = f.id
                LEFT JOIN eleve_cours ec ON c.id = ec.cours_id AND ec.eleve_id = %s
                WHERE c.id = %s
            """
            cursor.execute(query, (eleve_id, cours_id))
            course = cursor.fetchone()

            if not course:
                return jsonify({"status": "error", "message": "Cours non trouvé"}), 404

            # Récupérer les modules
            cursor.execute("""
                SELECT id, titre, type, ordre
                FROM modules
                WHERE cours_id = %s
                ORDER BY ordre
            """, (cours_id,))
            modules = cursor.fetchall()

            # Récupérer l'examen
            cursor.execute("""
                SELECT id, titre, seuil_reussite
                FROM examens
                WHERE cours_id = %s
            """, (cours_id,))
            examen = cursor.fetchone()

            # Construire la réponse
            course['modules'] = modules
            course['examen'] = examen
            
            return jsonify({
                "status": "success",
                "course": course
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour inscrire un élève à un cours
@app.route('/api/cours/participer', methods=['POST'])
def participer_cours():
    data = request.json
    if not all(k in data for k in ('cours_id', 'eleve_id')):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    # Validation des données
    try:
        cours_id = int(data['cours_id'])
        eleve_id = int(data['eleve_id'])
    except (ValueError, TypeError):
        return jsonify({
            "status": "error",
            "message": "Les IDs doivent être des nombres valides"
        }), 400

    connection = create_db_connection()
    if not connection:
        return jsonify({
            "status": "error", 
            "message": "Impossible de se connecter à la base de données"
        }), 500

    try:
        cursor = connection.cursor(dictionary=True)
        
        # Vérifier si le cours existe
        cursor.execute("SELECT id FROM cours WHERE id = %s", (cours_id,))
        if not cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Ce cours n'existe pas"
            }), 404

        # Vérifier si l'élève existe
        cursor.execute("SELECT id FROM eleve WHERE id = %s", (eleve_id,))
        if not cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Cet élève n'existe pas"
            }), 404
        
        # Vérifier si l'élève est déjà inscrit
        cursor.execute("""
            SELECT id FROM eleve_cours 
            WHERE cours_id = %s AND eleve_id = %s
        """, (cours_id, eleve_id))
        
        if cursor.fetchone():
            return jsonify({
                "status": "error",
                "message": "Vous êtes déjà inscrit à ce cours"
            }), 400

        # Inscrire l'élève au cours
        cursor.execute("""
            INSERT INTO eleve_cours (eleve_id, cours_id, date_inscription)
            VALUES (%s, %s, CURRENT_TIMESTAMP)
        """, (eleve_id, cours_id))
        
        connection.commit()

        return jsonify({
            "status": "success",
            "message": "Inscription au cours réussie"
        })

    except mysql.connector.Error as e:
        # Log l'erreur pour le debugging
        print(f"Erreur MySQL: {str(e)}")
        return jsonify({
            "status": "error",
            "message": f"Erreur lors de l'inscription au cours: {str(e)}"
        }), 500
    except Exception as e:
        # Log l'erreur inattendue
        print(f"Erreur inattendue: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Une erreur inattendue est survenue"
        }), 500
    finally:
        if cursor:
            cursor.close()
        if connection:
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les cours d'un élève
@app.route('/api/eleve/<eleve_id>/cours', methods=['GET'])
def get_eleve_courses(eleve_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Requête simplifiée sans la progression pour l'instant
            query = """
                SELECT 
                    c.*,
                    f.nom as formateur_nom,
                    f.prenom as formateur_prenom,
                    ec.est_termine,
                    ec.date_inscription,
                    0 as progression
                FROM eleve_cours ec
                JOIN cours c ON ec.cours_id = c.id
                JOIN formateur f ON c.formateur_id = f.id
                WHERE ec.eleve_id = %s
                ORDER BY ec.date_inscription DESC
            """
            
            cursor.execute(query, (eleve_id,))
            courses = cursor.fetchall()

            # Vérifier si la table eleve_progression existe
            try:
                progression_query = """
                    SELECT 
                        m.cours_id,
                        COUNT(ep.id) * 100.0 / COUNT(m.id) as progression
                    FROM modules m
                    LEFT JOIN eleve_progression ep ON m.id = ep.module_id AND ep.eleve_id = %s AND ep.est_termine = 1
                    GROUP BY m.cours_id
                """
                cursor.execute(progression_query, (eleve_id,))
                progressions = {row['cours_id']: row['progression'] for row in cursor.fetchall()}
                
                # Mettre à jour la progression pour chaque cours
                for course in courses:
                    if course['id'] in progressions:
                        course['progression'] = round(float(progressions[course['id']] or 0), 2)
            except Error:
                # Si la table n'existe pas, on laisse la progression à 0
                pass

            # Formater les données
            formatted_courses = []
            for course in courses:
                course_dict = dict(course)
                if course_dict.get('prerequis'):
                    course_dict['prerequis'] = json.loads(course_dict['prerequis'])
                if course_dict.get('mots_cles'):
                    course_dict['mots_cles'] = json.loads(course_dict['mots_cles'])
                formatted_courses.append(course_dict)

            return jsonify({
                "status": "success",
                "courses": formatted_courses
            })

        except Error as e:
            print(f"Database error: {str(e)}")
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer la progression d'un élève dans un module
@app.route('/api/module/progress/<cours_id>/<eleve_id>', methods=['GET'])
def get_module_progress(cours_id, eleve_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT module_id, est_complete
                FROM eleve_module_progression
                WHERE eleve_id = %s
                AND module_id IN (
                    SELECT id FROM modules WHERE cours_id = %s
                )
            """
            cursor.execute(query, (eleve_id, cours_id))
            progress = cursor.fetchall()
            
            return jsonify({
                "status": "success",
                "progress": progress
            })
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()


# Route pour marquer un module comme terminé
@app.route('/api/module/complete', methods=['POST'])
def complete_module():
    data = request.json
    if not all(k in data for k in ('eleve_id', 'module_id')):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifie si un enregistrement existe déjà
            check_query = """
                SELECT id FROM eleve_module_progression
                WHERE eleve_id = %s AND module_id = %s
            """
            cursor.execute(check_query, (data['eleve_id'], data['module_id']))
            existing = cursor.fetchone()

            if existing:
                # Mise à jour
                query = """
                    UPDATE eleve_module_progression
                    SET est_complete = 1, date_completion = CURRENT_TIMESTAMP
                    WHERE eleve_id = %s AND module_id = %s
                """
            else:
                # Création
                query = """
                    INSERT INTO eleve_module_progression 
                    (eleve_id, module_id, est_complete, date_debut, date_completion)
                    VALUES (%s, %s, 1, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
                """

            cursor.execute(query, (data['eleve_id'], data['module_id']))
            connection.commit()

            return jsonify({
                "status": "success",
                "message": "Progression mise à jour"
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

            
# Route pour soumettre un examen
@app.route('/api/examen/submit', methods=['POST', 'OPTIONS'])
def submit_exam():
    if request.method == 'OPTIONS':
        response = app.make_default_options_response()
        response.headers['Access-Control-Allow-Methods'] = 'POST'
        response.headers['Access-Control-Allow-Headers'] = 'Content-Type'
        return response

    data = request.json
    if not all(k in data for k in ('eleve_id', 'examen_id', 'reponses')):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)

            # 1. Récupérer les questions et les réponses correctes
            cursor.execute("""
                SELECT q.id, q.points, q.reponse_correcte
                FROM quizzes q
                WHERE q.examen_id = %s
            """, (data['examen_id'],))
            questions = cursor.fetchall()

            # 2. Calculer le score
            total_points = sum(q['points'] for q in questions)
            points_obtenus = 0

            # Créer l'entrée dans eleve_examen_resultats
            cursor.execute("""
                INSERT INTO eleve_examen_resultats 
                (eleve_id, examen_id, date_passage)
                VALUES (%s, %s, CURRENT_TIMESTAMP)
            """, (data['eleve_id'], data['examen_id']))
            resultat_id = cursor.lastrowid

            # 3. Vérifier chaque réponse
            for question in questions:
                reponse_donnee = data['reponses'].get(str(question['id']), [])
                reponse_correcte = json.loads(question['reponse_correcte'])
                est_correcte = set(reponse_donnee) == set(reponse_correcte)

                if est_correcte:
                    points_obtenus += question['points']

                # Enregistrer la réponse
                cursor.execute("""
                    INSERT INTO eleve_quiz_reponses 
                    (eleve_id, quiz_id, examen_resultat_id, reponse_donnee, est_correcte)
                    VALUES (%s, %s, %s, %s, %s)
                """, (
                    data['eleve_id'], 
                    question['id'], 
                    resultat_id,
                    json.dumps(reponse_donnee),
                    est_correcte
                ))

            # 4. Calculer le pourcentage et mettre à jour le résultat
            score = (points_obtenus / total_points * 100) if total_points > 0 else 0
            est_reussi = score >= data.get('seuil_reussite', 50)

            cursor.execute("""
                UPDATE eleve_examen_resultats 
                SET score = %s, est_reussi = %s
                WHERE id = %s
            """, (score, est_reussi, resultat_id))

            # 5. Si réussi, marquer le cours comme terminé
            if est_reussi:
                cursor.execute("""
                    UPDATE eleve_cours 
                    SET est_termine = 1 
                    WHERE eleve_id = %s AND cours_id = (
                        SELECT cours_id FROM examens WHERE id = %s
                    )
                """, (data['eleve_id'], data['examen_id']))

            connection.commit()

            return jsonify({
                "status": "success",
                "result": {
                    "score": round(score, 2),
                    "est_reussi": est_reussi
                }
            })

        except Error as e:
            connection.rollback()
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour ajouter un commentaire
@app.route('/api/commentaire/create', methods=['POST'])
def create_comment():
    data = request.json
    required_fields = ['eleve_id', 'cours_id', 'contenu', 'note']
    
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifier si l'élève a déjà terminé le cours
            cursor.execute("""
                SELECT est_termine 
                FROM eleve_cours 
                WHERE eleve_id = %s AND cours_id = %s
            """, (data['eleve_id'], data['cours_id']))
            
            cours_status = cursor.fetchone()
            if not cours_status or not cours_status['est_termine']:
                return jsonify({
                    "status": "error",
                    "message": "Vous devez terminer le cours avant de pouvoir le commenter"
                }), 403
            
            # Ajouter le commentaire
            query = """
                INSERT INTO commentaires (eleve_id, cours_id, contenu, note)
                VALUES (%s, %s, %s, %s)
            """
            
            cursor.execute(query, (
                data['eleve_id'],
                data['cours_id'],
                data['contenu'],
                data['note']
            ))
            
            connection.commit()
            return jsonify({
                "status": "success",
                "message": "Commentaire ajouté avec succès"
            }), 201
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les commentaires d'un cours
@app.route('/api/commentaires/cours/<cours_id>', methods=['GET'])
def get_course_comments(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer les commentaires avec les informations de l'élève
            comments_query = """
                SELECT 
                    c.*,
                    e.nom,
                    e.prenom,
                    e.email
                FROM commentaires c
                JOIN eleve e ON c.eleve_id = e.id
                WHERE c.cours_id = %s
                ORDER BY c.created_at DESC
            """
            cursor.execute(comments_query, (cours_id,))
            comments = cursor.fetchall()

            # Pour chaque commentaire, récupérer les réponses avec les informations du formateur
            for comment in comments:
                responses_query = """
                    SELECT 
                        r.*,
                        f.nom as formateur_nom,
                        f.prenom as formateur_prenom
                    FROM reponsecommentaires r
                    JOIN formateur f ON r.formateur_id = f.id
                    WHERE r.commentaire_id = %s
                    ORDER BY r.created_at ASC
                """
                cursor.execute(responses_query, (comment['id'],))
                comment['responses'] = cursor.fetchall()

            return jsonify({
                "status": "success",
                "comments": comments
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour créer une réponse à un commentaire
@app.route('/api/reponsecommentaire/create', methods=['POST'])
def create_comment_response():
    data = request.json
    required_fields = ['formateur_id', 'commentaire_id', 'contenu']
    
    if not all(field in data for field in required_fields):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Ajouter la réponse
            query = """
                INSERT INTO reponsecommentaires (formateur_id, commentaire_id, contenu)
                VALUES (%s, %s, %s)
            """
            
            cursor.execute(query, (
                data['formateur_id'],
                data['commentaire_id'],
                data['contenu']
            ))
            
            connection.commit()
            return jsonify({
                "status": "success",
                "message": "Réponse ajoutée avec succès"
            }), 201
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les réponses d'un commentaire
@app.route('/api/reponsecommentaires/<commentaire_id>', methods=['GET'])
def get_comment_responses(commentaire_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            query = """
                SELECT r.*, f.nom, f.prenom
                FROM reponsecommentaires r
                JOIN formateur f ON r.formateur_id = f.id
                WHERE r.commentaire_id = %s
                ORDER BY r.created_at ASC
            """
            cursor.execute(query, (commentaire_id,))
            responses = cursor.fetchall()
            
            return jsonify({
                "status": "success",
                "responses": responses
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les statistiques d'un élève
@app.route('/api/eleve/<eleve_id>/stats', methods=['GET'])
def get_eleve_stats(eleve_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Statistiques globales
            stats = {
                'progressionGlobale': 0,
                'coursActifs': [],
                'derniereActivite': [],
            }

            # Calculer la progression globale
            cursor.execute("""
                SELECT 
                    COUNT(DISTINCT ec.cours_id) as total_cours,
                    COUNT(DISTINCT CASE WHEN ec.est_termine = 1 THEN ec.cours_id END) as cours_termines
                FROM eleve_cours ec
                WHERE ec.eleve_id = %s
            """, (eleve_id,))
            cours_stats = cursor.fetchone()
            
            if cours_stats and cours_stats['total_cours'] > 0:
                stats['progressionGlobale'] = round((cours_stats['cours_termines'] / cours_stats['total_cours']) * 100)

            # Récupérer les cours actifs avec leur progression
            cursor.execute("""
                SELECT 
                    c.id,
                    c.titre,
                    COALESCE(
                        (SELECT COUNT(*) * 100.0 / NULLIF(total_modules.total, 0)
                        FROM eleve_module_progression emp
                        JOIN modules m ON emp.module_id = m.id
                        WHERE m.cours_id = c.id AND emp.eleve_id = %s AND emp.est_complete = 1),
                        0
                    ) as progression
                FROM cours c
                JOIN eleve_cours ec ON c.id = ec.cours_id
                JOIN (
                    SELECT cours_id, COUNT(*) as total
                    FROM modules
                    GROUP BY cours_id
                ) total_modules ON c.id = total_modules.cours_id
                WHERE ec.eleve_id = %s AND ec.est_termine = 0
                ORDER BY ec.date_inscription DESC
                LIMIT 3
            """, (eleve_id, eleve_id))
            stats['coursActifs'] = [
                {
                    'id': row['id'],
                    'titre': row['titre'],
                    'progression': round(float(row['progression']), 1)
                }
                for row in cursor.fetchall()
            ]

            # Récupérer les dernières activités
            cursor.execute("""
                SELECT 
                    'Module complété' as type,
                    m.titre,
                    c.titre as cours_titre,
                    emp.date_completion as date
                FROM eleve_module_progression emp
                JOIN modules m ON emp.module_id = m.id
                JOIN cours c ON m.cours_id = c.id
                WHERE emp.eleve_id = %s AND emp.est_complete = 1
                UNION ALL
                SELECT 
                    'Examen passé' as type,
                    e.titre,
                    c.titre as cours_titre,
                    eer.date_passage as date
                FROM eleve_examen_resultats eer
                JOIN examens e ON eer.examen_id = e.id
                JOIN cours c ON e.cours_id = c.id
                WHERE eer.eleve_id = %s
                ORDER BY date DESC
                LIMIT 5
            """, (eleve_id, eleve_id))
            stats['derniereActivite'] = [
                {
                    'type': row['type'],
                    'titre': f"{row['titre']} ({row['cours_titre']})",
                    'date': row['date'].strftime('%Y-%m-%d %H:%M:%S')
                }
                for row in cursor.fetchall()
            ]

            return jsonify({
                "status": "success",
                "stats": stats
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour mettre à jour les informations de l'élève
@app.route('/api/eleve/update/<eleve_id>', methods=['PUT'])
def update_eleve(eleve_id):
    data = request.json
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Construire la requête de mise à jour dynamiquement
            fields = []
            values = []
            for key, value in data.items():
                if key not in ['id', 'password', 'password_hash']:
                    fields.append(f"{key} = %s")
                    values.append(value)
            
            values.append(eleve_id)
            query = f"""
                UPDATE eleve 
                SET {', '.join(fields)}
                WHERE id = %s
            """
            
            cursor.execute(query, values)
            connection.commit()
            
            # Récupérer les informations mises à jour
            cursor.execute("""
                SELECT id, nom, prenom, email, niveau
                FROM eleve
                WHERE id = %s
            """, (eleve_id,))
            
            updated_eleve = cursor.fetchone()
            
            return jsonify({
                "status": "success",
                "message": "Profil mis à jour avec succès",
                "user": updated_eleve
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour changer le mot de passe de l'élève
@app.route('/api/eleve/password/<eleve_id>', methods=['PUT'])
def update_eleve_password(eleve_id):
    data = request.json
    if not all(k in data for k in ('currentPassword', 'newPassword')):
        return jsonify({"status": "error", "message": "Données manquantes"}), 400

    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Vérifier l'ancien mot de passe
            cursor.execute("SELECT password_hash FROM eleve WHERE id = %s", (eleve_id,))
            eleve = cursor.fetchone()
            
            if not eleve or not check_password_hash(eleve['password_hash'], data['currentPassword']):
                return jsonify({"status": "error", "message": "Mot de passe actuel incorrect"}), 401
            
            # Mettre à jour avec le nouveau mot de passe
            new_password_hash = generate_password_hash(data['newPassword'])
            cursor.execute(
                "UPDATE eleve SET password_hash = %s WHERE id = %s",
                (new_password_hash, eleve_id)
            )
            connection.commit()
            
            return jsonify({
                "status": "success",
                "message": "Mot de passe mis à jour avec succès"
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
    
    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

# Route pour récupérer les détails d'un cours avec les modules et l'examen
@app.route('/api/cours/details/<cours_id>', methods=['GET'])
def get_course_with_modules(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer les informations du cours
            course_query = """
                SELECT c.*, f.nom as formateur_nom, f.prenom as formateur_prenom
                FROM cours c
                JOIN formateur f ON c.formateur_id = f.id
                WHERE c.id = %s
            """
            cursor.execute(course_query, (cours_id,))
            course = cursor.fetchone()

            if not course:
                return jsonify({"status": "error", "message": "Cours non trouvé"}), 404

            # Récupérer les modules
            modules_query = """
                SELECT id, titre, type, ordre
                FROM modules
                WHERE cours_id = %s
                ORDER BY ordre ASC
            """
            cursor.execute(modules_query, (cours_id,))
            modules = cursor.fetchall()

            # Récupérer l'examen
            exam_query = """
                SELECT id, titre, seuil_reussite
                FROM examens
                WHERE cours_id = %s
            """
            cursor.execute(exam_query, (cours_id,))
            exam = cursor.fetchone()

            # Construire la réponse
            course['modules'] = modules
            course['examen'] = exam

            return jsonify({
                "status": "success",
                "course": course
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

# Route pour récupérer les élèves d'un cours
@app.route('/api/cours/<cours_id>/eleves', methods=['GET'])
def get_course_students(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            query = """
                SELECT 
                    e.id,
                    e.nom,
                    e.prenom,
                    ec.est_termine,
                    CASE WHEN er.est_reussi = 1 THEN true ELSE false END as examen_complete
                FROM eleve e
                JOIN eleve_cours ec ON e.id = ec.eleve_id
                LEFT JOIN examens ex ON ex.cours_id = ec.cours_id
                LEFT JOIN eleve_examen_resultats er ON er.examen_id = ex.id AND er.eleve_id = e.id
                WHERE ec.cours_id = %s
                ORDER BY e.nom, e.prenom
            """
            cursor.execute(query, (cours_id,))
            students = cursor.fetchall()

            return jsonify({
                "status": "success",
                "students": students
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()
            
# Route pour récupérer les commentaires d'un cours avec les réponses
@app.route('/api/cours/<cours_id>/comments', methods=['GET'])
def get_course_comments_with_responses(cours_id):
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer les commentaires avec les informations de l'élève
            comments_query = """
                SELECT 
                    c.*,
                    e.nom,
                    e.prenom
                FROM commentaires c
                JOIN eleve e ON c.eleve_id = e.id
                WHERE c.cours_id = %s
                ORDER BY c.created_at DESC
            """
            cursor.execute(comments_query, (cours_id,))
            comments = cursor.fetchall()

            # Pour chaque commentaire, récupérer les réponses
            for comment in comments:
                responses_query = """
                    SELECT 
                        r.*,
                        f.nom,
                        f.prenom
                    FROM reponsecommentaires r
                    JOIN formateur f ON r.formateur_id = f.id
                    WHERE r.commentaire_id = %s
                    ORDER BY r.created_at ASC
                """
                cursor.execute(responses_query, (comment['id'],))
                comment['responses'] = cursor.fetchall()

            return jsonify({
                "status": "success",
                "comments": comments
            })

        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

    return jsonify({"status": "error", "message": "Erreur de connexion à la base de données"}), 500

 
    connection = create_db_connection()
    if connection:
        try:
            cursor = connection.cursor(dictionary=True)
            
            # Récupérer l'historique de l'élève
            cursor.execute("""
                SELECT c.* 
                FROM cours c
                JOIN eleve_cours ec ON c.id = ec.cours_id
                WHERE ec.eleve_id = %s
            """, (eleve_id,))
            
            user_history = cursor.fetchall()
            
            # Récupérer tous les cours disponibles
            cursor.execute("SELECT * FROM cours")
            all_courses = cursor.fetchall()
            
            # Préparer et obtenir les recommandations
            recommender.prepare_features(all_courses)
            recommendations = recommender.get_recommendations(eleve_id, user_history)
            
            return jsonify({
                "status": "success",
                "recommendations": recommendations
            })
            
        except Error as e:
            return jsonify({"status": "error", "message": str(e)}), 500
        finally:
            cursor.close()
            connection.close()

# Route pour le chatbot
@app.route('/api/chatbot/query', methods=['POST'])
def chatbot_query():
    try:
        data = request.json
        if not data or 'question' not in data:
            return jsonify({
                "status": "error",
                "message": "Question manquante"
            }), 400

        try:
            # Appel direct au chatbot
            response = chatbot.get_response(data['question'])
            
            return jsonify({
                "status": "success",
                "response": response
            })
        except Exception as e:
            print(f"Erreur du chatbot: {str(e)}")
            return jsonify({
                "status": "error",
                "message": "Le service de chat est temporairement indisponible"
            }), 503

    except Exception as e:
        print(f"Erreur inattendue: {str(e)}")
        return jsonify({
            "status": "error",
            "message": "Une erreur inattendue s'est produite"
        }), 500

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
