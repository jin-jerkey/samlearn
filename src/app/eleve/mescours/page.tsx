'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../component/HeaderEleve';
import Sidebar from '../component/SidebarEleve';

interface Course {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  thumbnail?: string;
  mots_cles: string[];
  formateur_nom: string;
  formateur_prenom: string;
  progression?: number;
  est_termine: boolean;
}

interface EleveData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
}

export default function MesCoursEleve() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/eleve/loginEleve');
      return;
    }
    setEleveData(JSON.parse(user));
  }, [router]);

  useEffect(() => {
    const fetchMesCours = async () => {
      if (!eleveData?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/eleve/${eleveData.id}/cours`);
        const data = await response.json();
        if (data.status === 'success') {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des cours:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eleveData) {
      fetchMesCours();
    }
  }, [eleveData]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={eleveData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto px-4">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Mes cours</h1>

            {isLoading ? (
              <div className="text-center py-10">Chargement des cours...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                    onClick={() => router.push(`/eleve/cours/${course.id}`)}
                  >
                    <div className="relative pt-[56.25%]">
                      <Image
                        src={course.thumbnail || '/default-course.jpg'}
                        alt={course.titre}
                        fill
                        className="object-cover"
                      />
                      {course.est_termine && (
                        <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-md text-sm">
                          Terminé
                        </div>
                      )}
                    </div>
                    <div className="p-4 bg-gray-900">
                      <h3 className="font-medium text-gray-100 mb-1 line-clamp-2">
                        {course.titre}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        Par {course.formateur_prenom} {course.formateur_nom}
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-600">
                            {course.category}
                          </span>
                          <span className="text-orange-600">{course.duree_estimee} min</span>
                        </div>
                        {typeof course.progression === 'number' && (
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-orange-600 h-2 rounded-full" 
                              style={{ width: `${course.progression}%` }}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && courses.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Vous n&apos;êtes inscrit à aucun cours pour le moment.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
