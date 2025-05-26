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

export default function ProfilAdmin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [adminData, setAdminData] = useState<AdminData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({ nom: '', email: '' });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  useEffect(() => {
    const admin = localStorage.getItem('admin');
    if (!admin) {
      router.push('/admin/loginAdmin');
      return;
    }
    const adminInfo = JSON.parse(admin);
    setAdminData(adminInfo);
    setFormData({ nom: adminInfo.nom, email: adminInfo.email });
  }, [router]);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const response = await fetch(`http://localhost:5000/api/admin/update/${adminData?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Profil mis à jour avec succès');
        localStorage.setItem('admin', JSON.stringify({ ...adminData, ...formData }));
        setAdminData({ ...adminData!, ...formData });
        setIsEditing(false);
      } else {
        setError(data.message);
      }
    } catch {
      setError('Erreur lors de la mise à jour du profil');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    try {
      const response = await fetch(`http://localhost:5000/api/admin/password/${adminData?.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword: passwordData.currentPassword,
          newPassword: passwordData.newPassword,
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        setSuccess('Mot de passe mis à jour avec succès');
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
      } else {
        setError(data.message);
      }
    } catch {
      setError('Erreur lors de la mise à jour du mot de passe');
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <SidebarAdmin isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <HeaderAdmin toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} adminData={adminData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-3xl font-semibold text-gray-800 mb-8">Mon Profil</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Informations du profil */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Informations personnelles</h2>
                <form onSubmit={handleUpdateProfile} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Nom</label>
                    <input
                      type="text"
                      value={formData.nom}
                      onChange={(e) => setFormData({...formData, nom: e.target.value})}
                      disabled={!isEditing}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      disabled={!isEditing}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    {!isEditing ? (
                      <button
                        type="button"
                        onClick={() => setIsEditing(true)}
                        className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                      >
                        Modifier
                      </button>
                    ) : (
                      <div className="space-x-2">
                        <button
                          type="button"
                          onClick={() => setIsEditing(false)}
                          className="px-4 py-2 border rounded-lg"
                        >
                          Annuler
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                        >
                          Enregistrer
                        </button>
                      </div>
                    )}
                  </div>
                </form>
              </div>

              {/* Modification du mot de passe */}
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Modifier le mot de passe</h2>
                <form onSubmit={handleUpdatePassword} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Mot de passe actuel</label>
                    <input
                      type="password"
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({...passwordData, currentPassword: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Nouveau mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Confirmer le mot de passe</label>
                    <input
                      type="password"
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                      className="w-full border rounded-lg p-2"
                    />
                  </div>
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg"
                    >
                      Changer le mot de passe
                    </button>
                  </div>
                </form>
              </div>
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-100 text-red-700 rounded-lg">
                {error}
              </div>
            )}
            {success && (
              <div className="mt-4 p-3 bg-green-100 text-green-700 rounded-lg">
                {success}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
