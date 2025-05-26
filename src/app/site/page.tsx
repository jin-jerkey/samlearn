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
              <a href="#hero" className="text-gray-700 hover:text-orange-600 transition-colors">Accueil</a>
              <a href="#categories" className="text-gray-700 hover:text-orange-600 transition-colors">Catégories</a>
              <a href="#about" className="text-gray-700 hover:text-orange-600 transition-colors">À propos</a>
              <a href="#contact" className="text-gray-700 hover:text-orange-600 transition-colors">Contact</a>
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

      <main className="flex flex-col gap-8 w-full">
        {/* Section Présentation */}
        <section id="hero" className="relative h-screen w-full flex items-center justify-center">
          <div className="absolute inset-0">
            <Image
              src="/landing/01.png"
              alt="Background"
              fill
              className="object-cover brightness-50"
            />
          </div>
          <div className="relative z-10 text-center text-white px-4">
            <h1 className="text-5xl font-bold mb-4">Bienvenue sur SamLearn</h1>
            <p className="text-xl mb-8">Votre plateforme d&apos;apprentissage personnalisé</p>
            <Link 
              href="/auth" 
              className="bg-orange-600 text-white px-8 py-3 rounded-lg hover:bg-orange-700 transition-colors"
            >
              Commencer maintenant
            </Link>
          </div>
        </section>

        {/* Section Catégories */}
        <section id="categories" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-center mb-12">Nos Catégories de Cours</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {courses.map((course) => (
                <Link href={`/auth?redirect=/cours/${course.id}`} key={course.id}>
                  <div className="flex flex-col bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
                    <div className="relative w-full pt-[56.25%]">
                      <Image
                        src={course.thumbnail}
                        alt={course.title}
                        fill
                        className="absolute top-0 left-0 object-cover"
                      />
                    </div>
                    <div className="p-4">
                      <h3 className="font-medium text-gray-900 line-clamp-2">{course.title}</h3>
                      <div className="mt-2 flex items-center text-sm text-orange-600">
                        <span>{course.author}</span>
                        <span className="mx-2">•</span>
                        <span>{course.duration}</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Section À Propos */}
        <section id="about" className="py-16 px-4">
          <div className="container mx-auto">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="relative h-[500px] w-full">
                <Image
                  src="/landing/03.jpg"
                  alt="À propos de SamLearn"
                  fill
                  className="object-cover rounded-lg"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold mb-6">À Propos de SamLearn</h2>
                <p className="text-gray-600 mb-4">
                  SamLearn est une plateforme d&apos;apprentissage innovante qui utilise l&apos;intelligence 
                  artificielle pour personnaliser votre expérience d&apos;apprentissage.
                </p>
                <p className="text-gray-600 mb-4">
                  Notre mission est de rendre l&apos;éducation accessible à tous en proposant des cours 
                  de qualité et un suivi personnalisé grâce à notre assistant IA.
                </p>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <span className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    </span>
                    Apprentissage personnalisé
                  </li>
                  <li className="flex items-center">
                    <span className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    </span>
                    Assistant IA disponible 24/7
                  </li>
                  <li className="flex items-center">
                    <span className="bg-orange-100 p-2 rounded-full mr-3">
                      <svg className="w-5 h-5 text-orange-600" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"/>
                      </svg>
                    </span>
                    Suivi de progression avancé
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Section Contact */}
        <section id="contact" className="py-16 px-4 bg-gray-50">
          <div className="container mx-auto text-center">
            <h2 className="text-3xl font-bold mb-12">Contactez-nous</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Email</h3>
                <p className="text-gray-600">contact@samlearn.com</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Téléphone</h3>
                <p className="text-gray-600">+33 1 23 45 67 89</p>
              </div>
              <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-sm">
                <div className="bg-orange-100 p-3 rounded-full mb-4">
                  <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold mb-2">Réseaux Sociaux</h3>
                <div className="flex space-x-4">
                  <a href="#" className="text-gray-600 hover:text-orange-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-orange-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                    </svg>
                  </a>
                  <a href="#" className="text-gray-600 hover:text-orange-600">
                    <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.441 16.892c-2.102.144-6.784.144-8.883 0C5.282 16.736 5.017 15.622 5 12c.017-3.629.285-4.736 2.558-4.892 2.099-.144 6.782-.144 8.883 0C18.718 7.264 18.982 8.378 19 12c-.018 3.629-.285 4.736-2.559 4.892zM10 9.658l4.917 2.338L10 14.342V9.658z"/>
                    </svg>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </section>
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
