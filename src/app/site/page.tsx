import Image from "next/image";
import Link from "next/link";
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import coursesData from '@/data/courses.json';

export default function Home() {
  const { courses } = coursesData;

  return (
    <div className="grid grid-rows items-center justify-items-center min-h-screen p-5 gap-8 sm:p-10">
        <header className="fixed top-0 left-0 right-0 z-50 bg-white shadow-sm w-full flex items-center justify-between px-4 h-[80px]">
          <div className="flex items-center">
            <Image
              src="/logo.png"
              alt="Logo"
              width={120}
              height={40}
              priority
            />
          </div>
          
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-gray-700 hover:text-gray-900">Accueil</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Catégories</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">À propos</a>
            <a href="#" className="text-gray-700 hover:text-gray-900">Contact</a>
          </nav>

          <button className="md:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>

        <div className="flex items-center gap-4">
          <Link href="/auth"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg hover:bg-gray-100 text-biic-blue transition-colors"
          >
            <ArrowRightOnRectangleIcon className="h-5 w-5" />
            <span className="hidden md:inline">connexion</span>
          </Link>
        </div>
        </header>

      <main className="flex flex-col gap-[32px] row-start-2 items-center w-full px-4 pt-[80px]">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full">
          {courses.map((course) => (
            <div key={course.id} className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
              <div className="relative w-full pt-[56.25%]"> {/* 16:9 aspect ratio */}
                <Image
                  src={course.thumbnail}
                  alt={course.title}
                  fill
                  className="absolute top-0 left-0 object-cover"
                />
              </div>
              <div className="p-4 bg-gray-900">
                <h3 className="font-medium text-gray-100 line-clamp-2">{course.title}</h3>
                <div className="mt-2 flex items-center text-sm text-orange-600">
                  <span>{course.author}</span>
                  <span className="mx-2">•</span>
                  <span>{course.duration}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <footer className="row-start-3 w-full flex justify-between items-center px-4 py-2 bg-gray-900">
        <div>
          <p className="text-sm text-gray-100">© 2024 Tous droits réservés</p>
        </div>
        <div className="flex gap-4">
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Mentions légales</a>
          <a href="#" className="text-sm text-gray-600 hover:text-gray-900">Politique de confidentialité</a>
        </div>
      </footer>
    </div>
  );
}
