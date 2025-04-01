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
}

export default function CoursEleve() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
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
    const fetchCourses = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/cours/disponibles');
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

    fetchCourses();
  }, []);

  const filteredCourses = courses.filter(course => {
    const searchTermLower = searchTerm.toLowerCase();
    return (
      course.titre.toLowerCase().includes(searchTermLower) ||
      course.category.toLowerCase().includes(searchTermLower) ||
      course.mots_cles.some(mot => mot.toLowerCase().includes(searchTermLower))
    );
  });

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={eleveData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto px-4">
            <div className="mb-8">
              <h1 className="text-2xl font-bold text-gray-800 mb-4">Découvrir les cours</h1>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Rechercher par titre, catégorie ou mots-clés..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-4 py-3 pl-10 pr-12 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                <svg
                  className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </div>
            </div>

            {isLoading ? (
              <div className="text-center py-10">Chargement des cours...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
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
                    </div>
                    <div className="p-4 bg-gray-900">
                      <h3 className="font-medium text-orange-600 mb-1 line-clamp-2">
                        {course.titre}
                      </h3>
                      <p className="text-sm text-gray-100 mb-2">
                        Par {course.formateur_prenom} {course.formateur_nom}
                      </p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded-full text-gray-900">
                          {course.category}
                        </span>
                        <span className="text-orange-600">{course.duree_estimee} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {!isLoading && filteredCourses.length === 0 && (
              <div className="text-center py-10 text-gray-500">
                Aucun cours ne correspond à votre recherche.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
