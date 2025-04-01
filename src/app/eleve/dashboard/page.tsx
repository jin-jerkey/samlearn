'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '../component/HeaderEleve';
import Sidebar from '../component/SidebarEleve';

interface EleveData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
}

export default function DashboardEleve() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/eleve/loginEleve');
      return;
    }
    setEleveData(JSON.parse(user));
  }, [router]);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

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
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Bienvenue, {eleveData?.prenom}</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Widget Progression */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Ma progression</h2>
                <div className="text-4xl font-bold text-orange-600">0%</div>
                <p className="text-gray-500">Progression globale</p>
              </div>

              {/* Widget Cours en cours */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Cours en cours</h2>
                <p className="text-gray-500">Aucun cours en cours</p>
              </div>

              {/* Widget dernière activité */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold mb-4">Dernière activité</h2>
                <p className="text-gray-500">Aucune activité récente</p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
