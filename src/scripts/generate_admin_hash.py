from werkzeug.security import generate_password_hash

# Mot de passe en clair
password = "admin123"

# Générer le hash avec méthode pbkdf2:sha256
password_hash = generate_password_hash(password, method='pbkdf2:sha256')

print("Hash généré pour admin123 :")
print(password_hash)
