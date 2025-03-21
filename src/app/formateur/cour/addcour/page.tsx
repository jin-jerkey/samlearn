'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../../component/Header';
import Sidebar from '../../component/Sidebar';

interface FormateurData {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  specialites: string[];
}

export default function AddCourFormateur() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formateurData, setFormateurData] = useState<FormateurData | null>(null);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    category: '',
    difficulty_level: '',
    langue: 'Français',
    duree_estimee: '',
    prerequis: '',
    mots_cles: ''
  });
  const [error, setError] = useState('');
  const router = useRouter();

  useEffect(() => {
    // Vérifier si le formateur est connecté
    const formateur = localStorage.getItem('formateur');
    if (!formateur) {
      router.push('/formateur/loginFormateur');
      return;
    }
    setFormateurData(JSON.parse(formateur));
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formateurData) return;

    try {
      const response = await fetch('http://localhost:5000/api/cours/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          formateur_id: formateurData.id,
          prerequis: formData.prerequis.split(','),
          mots_cles: formData.mots_cles.split(',')
        }),
      });

      const data = await response.json();

      if (response.ok) {
        router.push('/formateur/cour');
      } else {
        setError(data.message || 'Erreur lors de la création du cours');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-semibold text-gray-900 mb-6">Création d&apos;un nouveau cours</h1>

            <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 space-y-6">
              {error && <div className="text-red-500 text-sm">{error}</div>}

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Titre du cours</label>
                  <input
                    type="text"
                    name="titre"
                    required
                    value={formData.titre}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Description</label>
                  <textarea
                    name="description"
                    required
                    rows={4}
                    value={formData.description}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Catégorie</label>
                    <select
                      name="category"
                      required
                      value={formData.category}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                      <option value="">Sélectionnez une catégorie</option>
                      <option value="Mathématiques">Mathématiques</option>
                      <option value="Physique">Physique</option>
                      <option value="Chimie">Chimie</option>
                      <option value="SVT">SVT</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Niveau de difficulté</label>
                    <select
                      name="difficulty_level"
                      required
                      value={formData.difficulty_level}
                      onChange={handleChange}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="2ndAe">2nd Ae</option>
                        <option value="2ndAa">2nd Aa</option>
                        <option value="2ndC">2nd C</option>
                        <option value="1ereAe">1ere Ae</option>
                        <option value="1ereAa">1ere Aa</option>
                        <option value="1ereC">1ere C</option>
                        <option value="1ereD">1ere D</option>
                        <option value="TleAe">Tle Ae</option>
                        <option value="TleAa">Tle Aa</option>
                        <option value="TleC">Tle C</option>
                        <option value="TleD">Tle D</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Durée estimée (en minutes)</label>
                  <input
                    type="number"
                    name="duree_estimee"
                    required
                    value={formData.duree_estimee}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Prérequis (séparés par des virgules)</label>
                  <input
                    type="text"
                    name="prerequis"
                    value={formData.prerequis}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    placeholder="ex: algèbre, géométrie"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">Mots-clés (séparés par des virgules)</label>
                  <input
                    type="text"
                    name="mots_cles"
                    value={formData.mots_cles}
                    onChange={handleChange}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                    placeholder="ex: mathématiques, équations"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Créer le cours
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
