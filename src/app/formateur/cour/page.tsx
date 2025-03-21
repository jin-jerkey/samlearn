'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import Header from '../component/Header';
import Sidebar from '../component/Sidebar';

interface Course {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  thumbnail?: string;
  mots_cles: string[];
  created_at: string;
}

interface Formateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialites: string[];
}

export default function CourFormateur() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [formateurData, setFormateurData] = useState<Formateur | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
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

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const formateur = JSON.parse(localStorage.getItem('formateur') || '{}');
        const response = await fetch(`http://localhost:5000/api/formateur/cours?formateur_id=${formateur.id}`);
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

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={toggleSidebar} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Mes cours</h1>
              <Link
                href="/formateur/cour/addcour"
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                Ajouter un cours
              </Link>
            </div>

            <div className="mb-6">
              <input
                type="text"
                placeholder="Rechercher par titre, catégorie ou mots-clés..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>

            {isLoading ? (
              <div className="text-center py-10">Chargement...</div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {filteredCourses.map((course) => (
                  <div 
                    key={course.id} 
                    onClick={() => router.push(`/formateur/cour/module?cours_id=${course.id}`)}
                    className="cursor-pointer bg-white rounded-lg shadow-sm overflow-hidden hover:shadow-md transition-shadow"
                  >
                    <div className="relative pt-[56.25%]">
                      <Image
                        src={course.thumbnail || '/default-course.jpg'}
                        alt={course.titre}
                        fill
                        className="object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">{course.titre}</h3>
                      <p className="text-sm text-gray-500 mb-2">{course.category}</p>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-orange-600">{course.difficulty_level}</span>
                        <span>{course.duree_estimee} min</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
