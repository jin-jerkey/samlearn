'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '../component/HeaderAdmin';
import SidebarAdmin from '../component/SidebarAdmin';

interface Eleve {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
  created_at: string;
  last_login: string;
  cours_count: number;
  is_active: boolean;
}

export default function ElevesAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState(null);
  const [eleves, setEleves] = useState<Eleve[]>([]);
  const [selectedEleve, setSelectedEleve] = useState<Eleve | null>(null);
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
    loadEleves();
  }, [router]);

  const loadEleves = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/admin/eleves');
      const data = await response.json();
      if (data.status === 'success') {
        setEleves(data.eleves);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des élèves:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eleveId: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élève ?')) {
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/eleve/${eleveId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        await loadEleves();
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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Gestion des Élèves</h1>

            {loading ? (
              <div className="text-center py-4">Chargement...</div>
            ) : (
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <table className="min-w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cours suivis</th>
                      <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {eleves.map((eleve) => (
                      <tr key={eleve.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {eleve.prenom} {eleve.nom}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">{eleve.email}</td>
                        <td className="px-6 py-4 whitespace-nowrap">{eleve.cours_count}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <button
                            onClick={() => {
                              setSelectedEleve(eleve);
                              setIsModalOpen(true);
                            }}
                            className="text-orange-600 hover:text-orange-900 mr-4"
                          >
                            Voir
                          </button>
                          <button
                            onClick={() => handleDelete(eleve.id)}
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

            {isModalOpen && selectedEleve && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                <div className="bg-white rounded-lg p-6 max-w-2xl w-full m-4">
                  <h2 className="text-xl font-bold mb-4">Détails de l&apos;élève</h2>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Nom complet</p>
                      <p className="font-medium">{selectedEleve.prenom} {selectedEleve.nom}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="font-medium">{selectedEleve.email}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveau</p>
                      <p className="font-medium">{selectedEleve.niveau}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Cours suivis</p>
                      <p className="font-medium">{selectedEleve.cours_count}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Date d&apos;inscription</p>
                      <p className="font-medium">{new Date(selectedEleve.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Dernière connexion</p>
                      <p className="font-medium">{selectedEleve.last_login ? new Date(selectedEleve.last_login).toLocaleDateString() : 'Jamais'}</p>
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
