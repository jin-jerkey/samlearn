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
            
            # Créer les questions du quiz
            quiz_query = """
                INSERT INTO quizzes (examen_id, question, options, reponse_correcte, points)
                VALUES (%s, %s, %s, %s, %s)
            """
            
            for question in data['questions']:
                cursor.execute(quiz_query, (
                    exam_id,
                    question['question'],
                    json.dumps(question['options']),
                    json.dumps(question['reponse_correcte']),
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
            query = """
                SELECT c.*, 
                       f.nom as formateur_nom, 
                       f.prenom as formateur_prenom,
                       ec.est_termine,
                       (
                           SELECT COUNT(*) * 100.0 / (
                               SELECT COUNT(*) 
                               FROM modules 
                               WHERE cours_id = c.id
                           )
                           FROM eleve_progression ep
                           JOIN modules m ON ep.module_id = m.id
                           WHERE ep.eleve_id = ec.eleve_id 
                           AND m.cours_id = c.id 
                           AND ep.est_termine = 1
                       ) as progression
                FROM cours c
                JOIN formateur f ON c.formateur_id = f.id
                JOIN eleve_cours ec ON c.id = ec.cours_id
                WHERE ec.eleve_id = %s
                ORDER BY ec.date_inscription DESC
            """
            cursor.execute(query, (eleve_id,))
            courses = cursor.fetchall()

            # Convertir les champs JSON en objets Python
            for course in courses:
                if course.get('prerequis'):
                    course['prerequis'] = json.loads(course['prerequis'])
                if course.get('mots_cles'):
                    course['mots_cles'] = json.loads(course['mots_cles'])
                # Arrondir la progression à 2 décimales
                if course['progression'] is not None:
                    course['progression'] = round(float(course['progression']), 2)

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

if __name__ == '__main__':
    # Démarrer le serveur sur le port 5000
    app.run(debug=True, port=5000)
