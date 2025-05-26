import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import {
  HomeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  BookOpenIcon,
  UserIcon
} from "@heroicons/react/24/solid";

const menuItems = [
  { icon: HomeIcon, label: "Dashboard", path: "/admin/dashboard" },
  { icon: UserGroupIcon, label: "Formateurs", path: "/admin/formateurs" },
  { icon: AcademicCapIcon, label: "Élèves", path: "/admin/eleves" },
  { icon: BookOpenIcon, label: "Cours", path: "/admin/cours" },
  { icon: UserIcon, label: "Profil", path: "/admin/profil" },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function SidebarAdmin({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 w-64 bg-gray-900 text-white h-screen overflow-y-auto flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="bg-white p-5 flex justify-center items-center h-20">
          <Image
            src="/logo.png"
            alt="samlearn Logo"
            className="max-h-10"
            width={100}
            height={40}
            priority
          />
        </div>

        <nav className="flex-grow mt-5">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <Link 
                  href={item.path}
                  className={`flex items-center px-6 py-3 text-gray-300 hover:bg-gray-800 hover:text-white transition-colors ${
                    pathname === item.path ? "bg-gray-800 text-white" : ""
                  }`}
                  onClick={toggleSidebar}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  <span>{item.label}</span>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </>
  );
}
