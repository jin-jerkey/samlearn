"use client";
import Link from "next/link";
import Image from "next/image";

export default function Auth() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8 bg-gray-800 p-8 rounded-xl shadow-2xl">
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <Image
              src="/logop.png"
              alt="Logo"
              className="h-16 w-auto bg-amber-50"
              width={80}
              height={64}
            />
          </div>
          <h2 className="text-3xl font-bold text-white">Connexion</h2>
          <p className="mt-2 text-sm text-gray-400">
            Connectez-vous en tant que ...
          </p>
        </div>

        <form className="mt-8 space-y-6">
          <div>
            <Link
              href="/eleve/loginEleve"
              className="font-medium text-orange-500 hover:text-orange-400"
            >
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                        shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 
                        transition duration-150"
              >
                ELEVE
              </button>
            </Link>
          </div>

          <div>
            <Link
              href="/formateur/loginFormateur"
              className="font-medium text-orange-500 hover:text-orange-400"
            >
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                        shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 
                        transition duration-150"
              >
                FORMATEUR
              </button>
            </Link>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/admin"
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                Créer un compte
              </Link>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
