'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../component/Header';
import Sidebar from '../../component/Sidebar';

interface Module {
  id: number;
  type: 'document' | 'texte' | 'vidéo';
  titre: string;
  contenu: string;
  ordre: number;
  created_at: string;
  url?: string;
}

export default function ModuleCourFormateur() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formateurData, setFormateurData] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modules, setModules] = useState<Module[]>([]);
  const [formData, setFormData] = useState({
    type: 'texte',
    titre: '',
    contenu: '',
    ordre: 1,
    fichier: null as File | null
  });
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const coursId = searchParams.get('cours_id');

  useEffect(() => {
    // Vérifier si le formateur est connecté
    const formateur = localStorage.getItem('formateur');
    if (!formateur) {
      router.push('/formateur/loginFormateur');
      return;
    }
    setFormateurData(JSON.parse(formateur));
  }, [router]);

  useEffect(() => {
    const loadModules = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/modules/${coursId}`);
        const data = await response.json();
        if (data.status === 'success') {
          setModules(data.modules);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des modules:', error);
      }
    };

    if (coursId) {
      loadModules();
    }
  }, [coursId]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formDataToSend = new FormData();
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null) {
        if (typeof value === 'number') {
          formDataToSend.append(key, value.toString());
        } else {
          formDataToSend.append(key, value);
        }
      }
    });
    formDataToSend.append('cours_id', coursId!);

    try {
      const response = await fetch('http://localhost:5000/api/module/create', {
        method: 'POST',
        body: formDataToSend
      });

      if (response.ok) {
        setIsModalOpen(false);
        // Rafraîchir la liste des modules
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const getModuleIcon = (type: string) => {
    switch (type) {
      case 'document':
        return '📄';
      case 'vidéo':
        return '🎥';
      default:
        return '📝';
    }
  };

  const renderModuleContent = (module: Module) => {
    switch (module.type) {
      case 'document':
        return (
          <div className="h-[400px] w-full">
            <object
              data={`http://localhost:5000/uploads/${module.contenu}`}
              type="application/pdf"
              className="w-full h-full"
            >
              <p>Le PDF ne peut pas être affiché. 
                <a 
                  href={`http://localhost:5000/uploads/${module.contenu}`}
                  target="_blank"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Cliquez ici pour le télécharger
                </a>
              </p>
            </object>
          </div>
        );
      case 'vidéo':
        return (
          <video
            controls
            className="w-full h-[240px] bg-black"
          >
            <source src={`http://localhost:5000/uploads/${module.contenu}`} type="video/mp4" />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        );
      default:
        return (
          <p className="text-gray-600 line-clamp-3">{module.contenu}</p>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Modules du cours</h1>
              <button
                onClick={() => setIsModalOpen(true)}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
              >
                Ajouter un module
              </button>
            </div>

            {/* Liste des modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {modules.map((module) => (
                <div
                  key={module.id}
                  className="bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                >
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-2xl">{getModuleIcon(module.type)}</span>
                      <span className="text-sm text-gray-500">Module {module.ordre}</span>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900 mt-2">{module.titre}</h3>
                  </div>
                  <div className="p-4">
                    {renderModuleContent(module)}
                  </div>
                </div>
              ))}
            </div>

            {/* Modal de création de module */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                <div className="bg-white rounded-lg p-6 w-full max-w-xl">
                  <h2 className="text-xl font-bold mb-4">Nouveau module</h2>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-1">Type</label>
                      <select
                        value={formData.type}
                        onChange={(e) => setFormData({...formData, type: e.target.value as 'document' | 'texte' | 'vidéo'})}
                        className="w-full border rounded-lg p-2"
                      >
                        <option value="texte">Texte</option>
                        <option value="document">Document PDF</option>
                        <option value="vidéo">Vidéo</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">Titre</label>
                      <input
                        type="text"
                        value={formData.titre}
                        onChange={(e) => setFormData({...formData, titre: e.target.value})}
                        className="w-full border rounded-lg p-2"
                      />
                    </div>

                    {formData.type === 'texte' ? (
                      <div>
                        <label className="block text-sm font-medium mb-1">Contenu</label>
                        <textarea
                          value={formData.contenu}
                          onChange={(e) => setFormData({...formData, contenu: e.target.value})}
                          className="w-full border rounded-lg p-2"
                          rows={6}
                        />
                      </div>
                    ) : (
                      <div>
                        <label className="block text-sm font-medium mb-1">Fichier</label>
                        <input
                          type="file"
                          onChange={(e) => setFormData({...formData, fichier: e.target.files?.[0] || null})}
                          className="w-full"
                          accept={formData.type === 'document' ? '.pdf' : 'video/*'}
                        />
                      </div>
                    )}

                    <div className="flex justify-end space-x-2">
                      <button
                        type="button"
                        onClick={() => setIsModalOpen(false)}
                        className="px-4 py-2 border rounded-lg"
                      >
                        Annuler
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                      >
                        Créer
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
