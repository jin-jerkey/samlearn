'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '../component/HeaderAdmin';
import SidebarAdmin from '../component/SidebarAdmin';

interface Formateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  bio: string;
  specialites: string[];
  qualifications: string[];
  methode_pedagogique: string;
  cours_count: number;
  created_at: string;
  last_login: string;
}

export default function FormateursAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [formateurs, setFormateurs] = useState<Formateur[]>([]);
  const [selectedFormateur, setSelectedFormateur] = useState<Formateur | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin');
      return;
    }
    setAdminData(JSON.parse(admin));
    loadFormateurs();
  }, [router]);

  const loadFormateurs = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/formateurs');
      const data = await response.json();
      if (data.status === 'success') {
        setFormateurs(data.formateurs);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des formateurs:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (formateurId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action supprimera également tous ses cours et contenus associés.')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/formateur/${formateurId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        await loadFormateurs();
      }
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarAdmin isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} adminData={adminData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Formateurs</h1>

            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {formateurs.map((formateur) => (
                      <tr key={formateur.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {formateur.prenom} {formateur.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{formateur.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{formateur.cours_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedFormateur(formateur);
                              setIsModalOpen(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => handleDelete(formateur.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Supprimer
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Modal des détails du formateur */}
            {isModalOpen && selectedFormateur && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
                  <h2 className="text-xl font-bold mb-4">Détails du formateur</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium">{selectedFormateur.prenom} {selectedFormateur.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedFormateur.email}</p>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Bio</p>
                      <p className="font-medium">{selectedFormateur.bio}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Spécialités</p>
                      <ul className="list-disc list-inside">
                        {selectedFormateur.specialites.map((spec, index) => (
                          <li key={index}>{spec}</li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Qualifications</p>
                      <ul className="list-disc list-inside">
                        {selectedFormateur.qualifications.map((qual, index) => (
                          <li key={index}>{qual}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="col-span-2">
                      <p className="text-sm text-gray-500">Méthode pédagogique</p>
                      <p className="font-medium">{selectedFormateur.methode_pedagogique}</p>
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end">
                    <button
                      onClick={() => setIsModalOpen(false)}
                      className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                    >
                      Fermer
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
