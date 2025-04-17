'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Header from '../component/Header';
import Sidebar from '../component/Sidebar';

interface CourseStats {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  thumbnail?: string;
  nb_eleves: number;
  nb_commentaires: number;
  created_at: string;
}

interface FormateurData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialites: string[];
}

export default function SuiviFormateur() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formateurData, setFormateurData] = useState<FormateurData | null>(null);
  const [courses, setCourses] = useState<CourseStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const formateur = localStorage.getItem('formateur');
    if (!formateur) {
      router.push('/formateur/loginFormateur');
      return;
    }
    setFormateurData(JSON.parse(formateur));
  }, [router]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!formateurData?.id) return;
      try {
        const response = await fetch(`http://localhost:5000/api/formateur/cours/stats/${formateurData.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setCourses(data.courses);
        }
      } catch (error) {
        console.error('Erreur lors du chargement des statistiques:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCourses();
  }, [formateurData]);

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Suivi des cours</h1>

            {isLoading ? (
              <div className="text-center py-10">Chargement des statistiques...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {courses.map((course) => (
                  <div
                    key={course.id}
                    onClick={() => router.push(`/formateur/suivi/detail/${course.id}`)} // Modification du chemin ici
                    className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer"
                  >
                    <div className="relative pt-[56.25%]">
                      <Image
                        src={course.thumbnail || '/default-course.jpg'}
                        alt={course.titre}
                        fill
                        className="object-cover"
                      />
                      <div className="absolute bottom-0 right-0 bg-black bg-opacity-75 px-2 py-1 text-white text-sm">
                        {course.duree_estimee} min
                      </div>
                    </div>

                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
                        {course.titre}
                      </h3>
                      
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" 
                            />
                          </svg>
                          <span>{course.nb_eleves} élèves</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                              d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                            />
                          </svg>
                          <span>{course.nb_commentaires}</span>
                        </div>
                      </div>

                      <div className="mt-2 flex items-center justify-between">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-sm text-gray-600">
                          {course.category}
                        </span>
                        <span className="text-sm text-gray-500">
                          {new Date(course.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && courses.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Aucun cours n&apos;a encore été sélectionné par des élèves.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
