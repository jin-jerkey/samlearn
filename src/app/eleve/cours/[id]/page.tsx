'use client';
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Header from '../../component/HeaderEleve';
import Sidebar from '../../component/SidebarEleve';

interface CourseDetails {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  formateur_nom: string;
  formateur_prenom: string;
  modules: Array<{
    id: number;
    titre: string;
    type: string;
    ordre: number;
  }>;
  examen: {
    id: number;
    titre: string;
    seuil_reussite: number;
  } | null;
  is_inscrit: boolean;
}

export default function CourDetail() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState(null);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const router = useRouter();
  const params = useParams();
  const courseId = params.id;

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/eleve/loginEleve');
      return;
    }
    setEleveData(JSON.parse(user));
  }, [router]);

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        const response = await fetch(`http://localhost:5000/api/cours/${courseId}/details?eleve_id=${user.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setCourseDetails(data.course);
        }
      } catch (error) {
        setError(`Erreur lors du chargement du cours: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
      } finally {
        setIsLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleParticipation = async () => {
    try {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await fetch('http://localhost:5000/api/cours/participer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cours_id: courseId,
          eleve_id: user.id
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Inscription au cours réussie !');
        setCourseDetails(prev => prev ? {...prev, is_inscrit: true} : null);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError(`Erreur lors de l'inscription au cours: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  if (isLoading) return <div>Chargement...</div>;
  if (!courseDetails) return <div>Cours non trouvé</div>;

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={eleveData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto max-w-4xl">
            {error && <div className="bg-red-100 text-red-600 p-3 rounded mb-4">{error}</div>}
            {success && <div className="bg-green-100 text-green-600 p-3 rounded mb-4">{success}</div>}

            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{courseDetails.titre}</h1>
                    <p className="text-gray-600 mb-4">{courseDetails.description}</p>
                  </div>
                  {!courseDetails.is_inscrit && (
                    <button
                      onClick={handleParticipation}
                      className="px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Participer au cours
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="text-sm">
                    <p className="text-gray-500">Formateur</p>
                    <p className="font-medium">{courseDetails.formateur_prenom} {courseDetails.formateur_nom}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Catégorie</p>
                    <p className="font-medium">{courseDetails.category}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Niveau</p>
                    <p className="font-medium">{courseDetails.difficulty_level}</p>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-500">Durée estimée</p>
                    <p className="font-medium">{courseDetails.duree_estimee} minutes</p>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <h2 className="text-xl font-semibold mb-4">Contenu du cours</h2>
                  <div className="space-y-3">
                    {courseDetails.modules.map((module) => (
                      <div 
                        key={module.id}
                        className="flex items-center p-3 bg-gray-50 rounded-lg"
                      >
                        <span className="text-gray-500 mr-4">{module.ordre}.</span>
                        <span className="flex-1">{module.titre}</span>
                        <span className="text-sm text-gray-500">{module.type}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {courseDetails.examen && (
                  <div className="border-t mt-6 pt-6">
                    <div className="bg-orange-50 p-4 rounded-lg">
                      <h3 className="text-lg font-medium text-orange-800">Examen Final</h3>
                      <p className="text-orange-600">
                        Seuil de réussite : {courseDetails.examen.seuil_reussite}%
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
