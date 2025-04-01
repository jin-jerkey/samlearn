'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Image from "next/image";

export default function LoginEleve() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Stockage des informations de l'utilisateur si nécessaire
        localStorage.setItem('user', JSON.stringify(data.user));
        router.push('/eleve/dashboard');
      } else {
        setError(data.message || 'Erreur de connexion');
      }
    } catch {
      setError('Erreur de connexion au serveur');
    }
  };

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
            Connectez-vous en tant que élève
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="text-red-500 text-sm text-center">{error}</div>
          )}
          <div className="space-y-4">
            <div>
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-300"
              >
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 
                          focus:border-transparent transition duration-150"
                placeholder="vous@example.com"
              />
            </div>

            <div>
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-300"
              >
                Mot de passe
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white 
                          placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-orange-500 
                          focus:border-transparent transition duration-150"
                placeholder="••••••••"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md 
                        shadow-sm text-sm font-medium text-white bg-orange-600 hover:bg-orange-700 
                        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 
                        transition duration-150"
            >
              Se connecter
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="#"
                className="font-medium text-orange-500 hover:text-orange-400"
              >
                Mot de passe oublié?
              </Link>
            </div>
            <div className="text-sm">
              <Link
                href="/eleve/loginEleve/registerEleve"
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