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

interface Course {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  created_at: string;
}

interface Exam {
  id: number;
  titre: string;
  seuil_reussite: number;
  questions: {
    id: number;
    question: string;
    options: string[];
    points: number;
  }[];
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
  const [courseInfo, setCourseInfo] = useState<Course | null>(null);
  const [examens, setExamens] = useState<Exam[]>([]);
  
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

  useEffect(() => {
    const fetchCourseInfo = async () => {
      if (!coursId) return;
      try {
        const response = await fetch(`http://localhost:5000/api/cours/${coursId}`);
        const data = await response.json();
        if (data.status === 'success') {
          setCourseInfo(data.course);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des informations du cours:', error);
      }
    };

    fetchCourseInfo();
  }, [coursId]);

  useEffect(() => {
    const loadExams = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/examens/cours/${coursId}`);
        const data = await response.json();
        if (data.status === 'success') {
          setExamens(data.exams);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des examens:', error);
      }
    };

    if (coursId) {
      loadExams();
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
              data={`http://localhost:5000/${module.contenu}`}
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
              <div className="flex space-x-4">
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                >
                  Ajouter un module
                </button>
                <button
                  onClick={() => router.push(`/formateur/cour/examen?cours_id=${coursId}`)}
                  className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600"
                >
                  Ajouter un examen
                </button>
              </div>
            </div>

            {/* Résumé du cours lié au module */}
            {courseInfo && (
              <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">{courseInfo.titre}</h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">{courseInfo.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Catégorie</p>
                      <p className="font-medium text-gray-900">{courseInfo.category}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Niveau</p>
                      <p className="font-medium text-gray-900">{courseInfo.difficulty_level}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Durée estimée</p>
                      <p className="font-medium text-gray-900">{courseInfo.duree_estimee} min</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Créé le</p>
                      <p className="font-medium text-gray-900">
                        {new Date(courseInfo.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Liste des modules */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
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

            {/* Section Examens et Quiz */}
            <div className="bg-white rounded-lg shadow-sm p-6 mt-8">
              <h2 className="text-xl font-bold text-gray-800 mb-6">Examens du cours</h2>
              
              <div className="grid grid-cols-2 lg:grid-cols-2 gap-6">
                {examens.map((examen) => (
                  <div key={examen.id} className="bg-gray-50 rounded-lg p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold">{examen.titre}</h3>
                      <span className="px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm">
                        Seuil: {examen.seuil_reussite}%
                      </span>
                    </div>
                    
                    <div className="space-y-4">
                      {examen.questions.map((question, idx) => (
                        <div key={question.id} className="bg-white p-4 rounded-lg border border-gray-200">
                          <div className="flex justify-between items-start mb-2">
                            <p className="font-medium">Question {idx + 1}</p>
                            <span className="text-sm text-gray-500">{question.points} pts</span>
                          </div>
                          <p className="text-gray-700 mb-2">{question.question}</p>
                          <div className="space-y-2">
                            {question.options.map((option, optIdx) => (
                              <div key={optIdx} className="flex items-center space-x-2">
                                <span className="w-6 h-6 flex items-center justify-center bg-gray-100 rounded-full text-sm">
                                  {String.fromCharCode(65 + optIdx)}
                                </span>
                                <span className="text-gray-600">{option}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
              
              {examens.length === 0 && (
                <div className="text-center text-gray-500 py-8">
                  Aucun examen n&apos;a été créé pour ce cours.
                </div>
              )}
            </div>

            {/* Modal de création de module */}
            {isModalOpen && (
              <div className="fixed inset-0 bg-gray-50 bg-opacity-10 flex items-center justify-center">
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
