'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function RegisterFormateur() {
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    bio: '',
    specialites: '',
    qualifications: '',
    methode_pedagogique: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/formateur/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/formateur/loginFormateur');
      } else {
        setError(data.message || 'Erreur lors de l\'inscription');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">Inscription Formateur</h2>
          <p className="mt-2 text-sm text-gray-400">Créez votre compte formateur</p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center">{error}</div>}
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="nom" className="text-sm font-medium text-gray-300">Nom</label>
                <input
                  id="nom"
                  name="nom"
                  type="text"
                  required
                  value={formData.nom}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
              <div>
                <label htmlFor="prenom" className="text-sm font-medium text-gray-300">Prénom</label>
                <input
                  id="prenom"
                  name="prenom"
                  type="text"
                  required
                  value={formData.prenom}
                  onChange={handleChange}
                  className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                            placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="text-sm font-medium text-gray-300">Email</label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="password" className="text-sm font-medium text-gray-300">Mot de passe</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500"
              />
            </div>

            <div>
              <label htmlFor="specialites" className="text-sm font-medium text-gray-300">Spécialités</label>
              <select
              id="specialites"
              name="specialites"
              required
              multiple
              value={formData.specialites.split(',')}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, specialites: values.join(',') });
              }}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              size={5}
              >
              <option value="Mathématiques">Mathématiques</option>
              <option value="Physique">Physique</option>
              <option value="Chimie">Chimie</option>
              <option value="Informatique">Informatique</option>
              <option value="Biologie">Biologie</option>
              <option value="Français">Français</option>
              <option value="Anglais">Anglais</option>
              <option value="Histoire">Histoire</option>
              <option value="Géographie">Géographie</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs options</p>
            </div>

            <div>
              <label htmlFor="qualifications" className="text-sm font-medium text-gray-300">Qualifications</label>
              <select
              id="qualifications"
              name="qualifications"
              required
              multiple
              value={formData.qualifications.split(',')}
              onChange={(e) => {
                const values = Array.from(e.target.selectedOptions, option => option.value);
                setFormData({ ...formData, qualifications: values.join(',') });
              }}
              className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              size={5}
              >
              <option value="Licence">Licence</option>
              <option value="Master">Master</option>
              <option value="Doctorat">Doctorat</option>
              <option value="CAPES">CAPES</option>
              <option value="Agrégation">Agrégation</option>
              <option value="Certification professionnelle">Certification professionnelle</option>
              <option value="Formation pédagogique">Formation pédagogique</option>
              </select>
              <p className="text-xs text-gray-400 mt-1">Maintenez Ctrl (Cmd sur Mac) pour sélectionner plusieurs options</p>
            </div>

            <div>
              <label htmlFor="methode_pedagogique" className="text-sm font-medium text-gray-300">Méthode Pédagogique</label>
              <select
                id="methode_pedagogique"
                name="methode_pedagogique"
                required
                value={formData.methode_pedagogique}
                onChange={handleChange}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              >
                <option value="">Sélectionnez une méthode</option>
                <option value="Interactive">Interactive</option>
                <option value="Pratique">Pratique</option>
                <option value="Théorique">Théorique</option>
                <option value="Mixte">Mixte</option>
              </select>
            </div>

            <div>
              <label htmlFor="bio" className="text-sm font-medium text-gray-300">Biographie</label>
              <textarea
                id="bio"
                name="bio"
                required
                value={formData.bio}
                onChange={handleChange}
                rows={4}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white"
              ></textarea>
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                      shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 
                      focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
          >
            S&apos;inscrire
          </button>

          <div className="text-sm text-center">
            <Link href="/formateur/loginFormateur" className="font-medium text-orange-500 hover:text-orange-400">
              Déjà inscrit ? Se connecter
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
