import Link from "next/link";
import { usePathname } from "next/navigation";
import Image from 'next/image';
import { useState } from 'react';
import {
  HomeIcon,
  CogIcon,
  UserPlusIcon,
} from "@heroicons/react/24/solid";

// Définition de tous les éléments du menu
const allMenuItems = [
  { icon: HomeIcon, label: "Tableau de bord", path: "/eleve/dashboard" },
  { icon: CogIcon, label: "Cours disponibles", path: "/eleve/cours" },
  { icon: CogIcon, label: "Mes cours", path: "/eleve/mescours" },
  { icon: UserPlusIcon, label: "Mon profil", path: "/eleve/profil" },
];

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Sidebar({ isOpen, toggleSidebar }: SidebarProps) {
  const pathname = usePathname();
  const [menuItems,  ] = useState(allMenuItems);

 

  return (
    <>
      {/* Overlay pour mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-30 lg:hidden"
          onClick={toggleSidebar}
        />
      )}

      <aside
        className={`fixed lg:sticky top-0 w-50 bg-biic-blue text-white h-screen overflow-y-auto flex flex-col z-40 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0 bg-gray-900"
        }`}
      >
        {/* Logo */}
        <div className="bg-white p-5 flex justify-center items-center h-20">
            <Image
                src="/logo.png"
                alt="samlearn Logo"
                className="max-h-10"
                width={100}
                height={100}
                priority
            />
        </div>

        {/* Menu Items */}
        <nav className="flex-grow">
          <ul>
            {menuItems.map((item) => (
              <li
                key={item.label}
                className={`px-5 py-4 flex items-center cursor-pointer hover:bg-orange-600 ${
                  pathname === item.path ? "bg-biic-red" : ""
                }`}
              >
                <Link 
                  href={item.path} 
                  className="flex items-center w-full"
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