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

interface Stats {
  totalCours: number;
  coursTermines: number;
  coursEnCours: number;
  examensReussis: number;
  totalExamens: number;
  tauxReussite: number;
}

export default function ProfileEleve() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const [formData, setFormData] = useState<Partial<EleveData>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [stats, setStats] = useState<Stats | null>(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  
  const router = useRouter();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/eleve/loginEleve');
      return;
    }
    const userData = JSON.parse(user);
    setEleveData(userData);
    setFormData(userData);
    fetchStats(userData.id);
  }, [router]);

  const fetchStats = async (eleveId: number) => {
    try {
      const response = await fetch(`http://localhost:5000/api/eleve/${eleveId}/stats`);
      const data = await response.json();
      if (data.status === 'success') {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Erreur lors du chargement des statistiques:', error);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eleveData?.id) return;

    try {
      const response = await fetch(`http://localhost:5000/api/eleve/update/${eleveData.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Profil mis à jour avec succès');
        localStorage.setItem('user', JSON.stringify({...eleveData, ...formData}));
        setIsEditing(false);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Erreur lors de la mise à jour');
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/eleve/password/${eleveData?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Mot de passe modifié avec succès');
        setIsChangingPassword(false);
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Erreur lors de la modification du mot de passe');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={eleveData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto max-w-4xl">
            {/* Stats Cards */}
            {stats && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Cours suivis</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold">{stats.totalCours}</span>
                    <span className="text-green-500">
                      {stats.coursTermines} terminés
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Examens réussis</h3>
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-2xl font-bold">{stats.examensReussis}/{stats.totalExamens}</span>
                    <span className="text-orange-500">
                      {stats.tauxReussite}%
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-gray-500 text-sm">Cours en cours</h3>
                  <div className="mt-2">
                    <span className="text-2xl font-bold">{stats.coursEnCours}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Profile Form */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-2xl font-bold mb-6">Mon Profil</h2>
              
              {error && <div className="mb-4 text-red-500">{error}</div>}
              {success && <div className="mb-4 text-green-500">{success}</div>}

              {!isEditing && !isChangingPassword ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Nom</h3>
                      <p className="mt-1 text-sm text-gray-900">{eleveData?.nom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Prénom</h3>
                      <p className="mt-1 text-sm text-gray-900">{eleveData?.prenom}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Email</h3>
                      <p className="mt-1 text-sm text-gray-900">{eleveData?.email}</p>
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-gray-500">Niveau</h3>
                      <p className="mt-1 text-sm text-gray-900">{eleveData?.niveau}</p>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Modifier le profil
                    </button>
                    <button
                      onClick={() => setIsChangingPassword(true)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                </div>
              ) : isEditing ? (
                <form onSubmit={handleUpdate} className="space-y-6">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Nom</label>
                      <input
                        type="text"
                        value={formData.nom || ''}
                        onChange={(e) => setFormData({...formData, nom: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Prénom</label>
                      <input
                        type="text"
                        value={formData.prenom || ''}
                        onChange={(e) => setFormData({...formData, prenom: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        value={formData.email || ''}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">Niveau</label>
                      <select
                        value={formData.niveau || ''}
                        onChange={(e) => setFormData({...formData, niveau: e.target.value})}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        required
                      >
                        <option value="">Sélectionnez un niveau</option>
                        <option value="2ndAe">2nd Ae</option>
                        <option value="2ndAa">2nd Aa</option>
                        <option value="2ndC">2nd C</option>
                        <option value="1ereAe">1ere Ae</option>
                        <option value="1ereAa">1ere Aa</option>
                        <option value="1ereC">1ere C</option>
                        <option value="1ereD">1ere D</option>
                        <option value="TleAe">Tle Ae</option>
                        <option value="TleAa">Tle Aa</option>
                        <option value="TleC">Tle C</option>
                        <option value="TleD">Tle D</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Enregistrer les modifications
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              ) : (
                <form onSubmit={handlePasswordChange} className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">Confirmer le nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>

                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Changer le mot de passe
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsChangingPassword(false)}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    >
                      Annuler
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
