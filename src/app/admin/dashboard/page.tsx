'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import HeaderAdmin from '../component/HeaderAdmin';
import SidebarAdmin from '../component/SidebarAdmin';

interface AdminData {
  id: number;
  nom: string;
  email: string;
}

interface DashboardStats {
  totalFormateurs: number;
  totalEleves: number;
  totalCours: number;
  nouveauxEleves: number;
  nouveauxCours: number;
  tauxReussite: number;
}

export default function DashboardAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin');
      return;
    }
    setAdminData(JSON.parse(admin));
  }, [router]);

  useEffect(() => {
    // Simuler le chargement des statistiques
    // À remplacer par un vrai appel API
    setStats({
      totalFormateurs: 25,
      totalEleves: 150,
      totalCours: 45,
      nouveauxEleves: 12,
      nouveauxCours: 5,
      tauxReussite: 85
    });
  }, []);

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarAdmin isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} adminData={adminData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">Tableau de bord administrateur</h1>

            {/* Statistiques générales */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500">Total Formateurs</h3>
                  <span className="text-orange-600 text-2xl font-bold">{stats?.totalFormateurs}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500">Total Élèves</h3>
                  <span className="text-orange-600 text-2xl font-bold">{stats?.totalEleves}</span>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-500">Total Cours</h3>
                  <span className="text-orange-600 text-2xl font-bold">{stats?.totalCours}</span>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Actions rapides</h2>
                <div className="space-y-4">
                  <button onClick={() => router.push('/admin/formateurs')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    Gérer les formateurs
                  </button>
                  <button onClick={() => router.push('/admin/eleves')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    Gérer les élèves
                  </button>
                  <button onClick={() => router.push('/admin/cours')} className="w-full text-left px-4 py-2 bg-gray-50 hover:bg-gray-100 rounded-lg">
                    Gérer les cours
                  </button>
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-4">Statistiques récentes</h2>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nouveaux élèves</span>
                    <span className="text-orange-600">+{stats?.nouveauxEleves}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Nouveaux cours</span>
                    <span className="text-orange-600">+{stats?.nouveauxCours}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Taux de réussite global</span>
                    <span className="text-orange-600">{stats?.tauxReussite}%</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
