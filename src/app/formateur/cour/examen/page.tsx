'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../component/Header';
import Sidebar from '../../component/Sidebar';

interface QuizQuestion {
  question: string;
  options: string[];
  reponse_correcte: number[];
  points: number;
}

export default function ExamenPage() {
  const [formateurData, setFormateurData] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [examData, setExamData] = useState({
    titre: '',
    seuil_reussite: 50,
  });
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<QuizQuestion>({
    question: '',
    options: ['', '', '', ''],
    reponse_correcte: [],
    points: 1
  });

  const router = useRouter();
  const searchParams = useSearchParams();
  const coursId = searchParams.get('cours_id');

  useEffect(() => {
    const formateur = localStorage.getItem('formateur');
    if (!formateur) {
      router.push('/formateur/loginFormateur');
      return;
    }
    setFormateurData(JSON.parse(formateur));
  }, [router]);

  const handleExamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/api/examen/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          cours_id: coursId,
          ...examData,
          questions: questions
        }),
      });

      if (response.ok) {
        router.push(`/formateur/cour/module?cours_id=${coursId}`);
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  const addQuestion = () => {
    if (!currentQuestion.question || currentQuestion.options.some(opt => !opt) || currentQuestion.reponse_correcte.length === 0) {
      alert('Veuillez remplir tous les champs et sélectionner au moins une réponse correcte');
      return;
    }
    setQuestions([...questions, currentQuestion]);
    setCurrentQuestion({
      question: '',
      options: ['', '', '', ''],
      reponse_correcte: [],
      points: 1
    });
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    setCurrentQuestion({ ...currentQuestion, options: newOptions });
  };

  const toggleCorrectAnswer = (index: number) => {
    const newCorrectAnswers = currentQuestion.reponse_correcte.includes(index)
      ? currentQuestion.reponse_correcte.filter(i => i !== index)
      : [...currentQuestion.reponse_correcte, index];
    setCurrentQuestion({ ...currentQuestion, reponse_correcte: newCorrectAnswers });
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold mb-6">Créer un examen</h1>
            
            <form onSubmit={handleExamSubmit} className="space-y-6">
              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Informations de l&apos;examen</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Titre de l&apos;examen</label>
                    <input
                      type="text"
                      value={examData.titre}
                      onChange={(e) => setExamData({...examData, titre: e.target.value})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Seuil de réussite (%)</label>
                    <input
                      type="number"
                      value={examData.seuil_reussite}
                      onChange={(e) => setExamData({...examData, seuil_reussite: parseInt(e.target.value)})}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                      min="0"
                      max="100"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h2 className="text-xl font-semibold mb-4">Questions</h2>
                
                <div className="space-y-4">
                  {questions.map((q, idx) => (
                    <div key={idx} className="p-4 border rounded">
                      <p className="font-medium">Question {idx + 1}: {q.question}</p>
                      <p className="text-sm text-gray-500">Points: {q.points}</p>
                    </div>
                  ))}

                  <div className="border-t pt-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700">Question</label>
                        <input
                          type="text"
                          value={currentQuestion.question}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, question: e.target.value})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium mb-1">Options et Réponses</label>
                        {currentQuestion.options.map((option, idx) => (
                          <div key={idx} className="flex items-center space-x-2 mt-2">
                            <input
                              type="checkbox"
                              checked={currentQuestion.reponse_correcte.includes(idx)}
                              onChange={() => toggleCorrectAnswer(idx)}
                              className="w-4 h-4 text-orange-600"
                            />
                            <input
                              type="text"
                              value={option}
                              onChange={(e) => handleOptionChange(idx, e.target.value)}
                              className="flex-1 border rounded-lg p-2"
                              placeholder={`Option ${idx + 1}`}
                            />
                          </div>
                        ))}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700">Points</label>
                        <input
                          type="number"
                          value={currentQuestion.points}
                          onChange={(e) => setCurrentQuestion({...currentQuestion, points: parseInt(e.target.value)})}
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-orange-500 focus:ring-orange-500"
                          min="1"
                        />
                      </div>

                      <button
                        type="button"
                        onClick={addQuestion}
                        className="mt-4 px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                      >
                        Ajouter la question
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-4">
                {questions.map((q, idx) => (
                  <div key={idx} className="p-4 border rounded-lg bg-gray-50">
                    <p className="font-medium">Question {idx + 1}: {q.question}</p>
                    <div className="mt-2 space-y-1">
                      {q.options.map((opt, optIdx) => (
                        <div key={optIdx} className="flex items-center space-x-2">
                          <span className={`w-4 h-4 inline-block ${
                            q.reponse_correcte.includes(optIdx) 
                              ? 'bg-green-500' 
                              : 'bg-gray-200'
                          } rounded-full`}></span>
                          <span>{opt}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex justify-end space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Créer l&apos;examen
                </button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  );
}
