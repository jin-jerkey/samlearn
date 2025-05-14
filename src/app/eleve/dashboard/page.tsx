'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../component/HeaderEleve';
import Sidebar from '../component/SidebarEleve';
import CourseChatbot from '@/app/components/CourseChatbot';
import { Line, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

// Enregistrer les composants Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

interface EleveData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
}

interface Stats {
  totalCours: number;
  coursTermines: number;
  coursEnCours: number;
  progressionGlobale: number;
  derniereActivite: {
    type: string;
    titre: string;
    date: string;
  }[];
  coursActifs: {
    id: number;
    titre: string;
    progression: number;
  }[];
}

interface TimeStats {
  labels: string[];
  data: number[];
}

export default function DashboardEleve() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [timeStats, setTimeStats] = useState<TimeStats | null>(null);
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
    const fetchStats = async () => {
      if (!eleveData?.id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/eleve/${eleveData.id}/stats`);
        const data = await response.json();
        
        if (data.status === 'success') {
          setStats(data.stats);
          
          // Simuler des données temporelles (à remplacer par de vraies données)
          const last7Days = Array.from({length: 7}, (_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - i);
            return date.toLocaleDateString('fr-FR', { weekday: 'short' });
          }).reverse();
          
          setTimeStats({
            labels: last7Days,
            data: Array.from({length: 7}, () => Math.floor(Math.random() * 5))
          });
        }
      } catch (error) {
        console.error("Erreur lors du chargement des statistiques:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [eleveData]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const timeChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Temps passé sur la plateforme (heures)'
      }
    }
  };

  const progressChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'Progression des cours'
      }
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header 
          toggleSidebar={toggleSidebar}
          userData={eleveData}
        />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">Bienvenue, {eleveData?.prenom}</h1>
                <button
                onClick={() => setIsChatbotVisible(!isChatbotVisible)}
                className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 flex items-center justify-center transition-all duration-200"
                title={isChatbotVisible ? 'Masquer l\'assistant' : 'Afficher l\'assistant'}
                >
                {isChatbotVisible ? (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                  </svg>
                )}
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-5">
              {/* Widget Progression */}
              <div className="bg-white rounded-lg shadow p-6 w-[350px]">
              <h2 className="text-xl font-semibold mb-4">Ma progression</h2>
              <div className="text-4xl font-bold text-orange-600">
                {stats?.progressionGlobale || 0}%
              </div>
              <p className="text-gray-500">Progression globale</p>
              </div>

              {/* Widget Cours en cours */}
              <div className="bg-white rounded-lg shadow p-6 w-[350px] max-h-[300px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Cours en cours</h2>
              {stats?.coursActifs && stats.coursActifs.length > 0 ? (
                <div className="space-y-3">
                {stats.coursActifs.map(cours => (
                  <div key={cours.id} className="flex items-center justify-between">
                  <span className="text-gray-700">{cours.titre}</span>
                  <span className="text-orange-600">{cours.progression}%</span>
                  </div>
                ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucun cours en cours</p>
              )}
              </div>

              {/* Widget dernière activité */}
              <div className="bg-white rounded-lg shadow p-6 w-[350px] max-h-[300px] overflow-y-auto">
              <h2 className="text-xl font-semibold mb-4">Dernière activité</h2>
              {stats?.derniereActivite && stats.derniereActivite.length > 0 ? (
                <div className="space-y-3">
                {stats.derniereActivite.map((activite, index) => (
                  <div key={index} className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-gray-600">{activite.type}</p>
                    <p className="text-gray-800">{activite.titre}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {new Date(activite.date).toLocaleDateString()}
                  </span>
                  </div>
                ))}
                </div>
              ) : (
                <p className="text-gray-500">Aucune activité récente</p>
              )}
              </div>
            </div>

            {/* Graphiques */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow p-6">
                <Line
                  options={timeChartOptions}
                  data={{
                    labels: timeStats?.labels || [],
                    datasets: [
                      {
                        label: 'Temps passé',
                        data: timeStats?.data || [],
                        borderColor: 'rgb(234, 88, 12)',
                        backgroundColor: 'rgba(234, 88, 12, 0.5)',
                      },
                    ],
                  }}
                />
              </div>

              <div className="bg-white rounded-lg shadow p-6">
                <Doughnut
                  options={progressChartOptions}
                  data={{
                    labels: ['Cours terminés', 'Cours restants'],
                    datasets: [
                      {
                        data: [
                          stats?.coursTermines || 0,
                          (stats?.totalCours || 0) - (stats?.coursTermines || 0)
                        ],
                        backgroundColor: [
                          'rgb(234, 88, 12)',
                          'rgb(229, 231, 235)',
                        ],
                      },
                    ],
                  }}
                />
              </div>
            </div>
          </div>
        </main>

        {isChatbotVisible && eleveData && (
          <CourseChatbot userId={eleveData.id.toString()} />
        )}
      </div>
    </div>
  );
}
