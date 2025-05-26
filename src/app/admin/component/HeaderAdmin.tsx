import { Bars3Icon, ArrowRightOnRectangleIcon } from "@heroicons/react/24/solid";
import { useRouter } from "next/navigation";

interface HeaderProps {
  toggleSidebar: () => void;
  adminData: {
    nom: string;
    email: string;
  } | null;
}

export default function HeaderAdmin({ toggleSidebar, adminData }: HeaderProps) {
  const router = useRouter();
  
  const handleLogout = () => {
    localStorage.removeItem('admin');
    router.push('/admin');
  };

  return (
    <header className="bg-white p-4 shadow-md">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={toggleSidebar}
            className="lg:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <h1 className="text-xl font-semibold text-gray-800 ml-2">Administration</h1>
        </div>

        <div className="flex items-center space-x-4">
          {adminData && (
            <div className="hidden md:flex items-center space-x-3">
              <div className="text-right">
                <div className="text-gray-800 font-medium">
                  {adminData.nom}
                </div>
                <div className="text-sm text-gray-500">{adminData.email}</div>
              </div>
              <div className="h-8 w-8 rounded-full bg-orange-500 flex items-center justify-center text-white font-medium">
                {adminData.nom[0]}
              </div>
            </div>
          )}

          <button
            onClick={handleLogout}
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-gray-700 transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="hidden md:inline">Déconnexion</span>
          </button>
        </div>
      </div>
    </header>
  );
}
