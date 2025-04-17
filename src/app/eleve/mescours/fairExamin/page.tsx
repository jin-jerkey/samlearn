'use client';
import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Header from '../../component/HeaderEleve';
import Sidebar from '../../component/SidebarEleve';

interface Question {
  id: number;
  question: string;
  options: string[];
  points: number;
}

interface Exam {
  id: number;
  titre: string;
  seuil_reussite: number;
  questions: Question[];
}

interface EleveData {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  niveau: string;
}

export default function FairExamin() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const [examData, setExamData] = useState<Exam | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: number]: string[] }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const router = useRouter();
  const searchParams = useSearchParams();
  const coursId = searchParams.get('cours_id');

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (!user) {
      router.push('/eleve/loginEleve');
      return;
    }
    setEleveData(JSON.parse(user));
  }, [router]);

  useEffect(() => {
    const fetchExamData = async () => {
      if (!coursId || !eleveData?.id) return;
      
      try {
        const response = await fetch(`http://localhost:5000/api/examens/cours/${coursId}`);
        const data = await response.json();
        
        if (data.status === 'success' && data.exams.length > 0) {
          setExamData(data.exams[0]);
        }
      } catch (error) {
        console.error('Erreur lors du chargement de l\'examen:', error);
      }
    };

    if (coursId && eleveData) {
      fetchExamData();
    }
  }, [coursId, eleveData]);

  const handleAnswerSelection = (answer: string) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIndex]: [answer]
    });
  };

  const handleSubmitExam = async () => {
    if (!eleveData?.id || !examData) return;
    setIsSubmitting(true);

    try {
      const response = await fetch('http://localhost:5000/api/examen/submit', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          eleve_id: eleveData.id,
          examen_id: examData.id,
          reponses: selectedAnswers,
          seuil_reussite: examData.seuil_reussite
        }),
      });

      const data = await response.json();
      if (data.status === 'success') {
        // Afficher le résultat
        const resultMessage = `Score : ${data.result.score}% - ${
          data.result.est_reussi ? 'Réussi' : 'Échoué'
        }`;
        alert(resultMessage);
        router.push(`/eleve/mescours`);
      } else {
        alert('Erreur lors de la soumission de l\'examen');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Erreur lors de la communication avec le serveur');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!examData) return <div>Chargement...</div>;

  const currentQuestion = examData.questions[currentQuestionIndex];

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={eleveData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="container mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">{examData.titre}</h1>
            
            <div className="flex gap-6">
              {/* Liste des questions - 30% */}
              <div className="w-[30%] bg-white rounded-lg shadow-sm p-4">
                <h2 className="text-lg font-semibold mb-4">Questions</h2>
                <div className="space-y-2">
                  {examData.questions.map((q, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-lg cursor-pointer ${
                        currentQuestionIndex === idx
                          ? 'bg-orange-100 border-orange-500'
                          : selectedAnswers[idx]
                          ? 'bg-gray-100'
                          : ''
                      }`}
                      onClick={() => setCurrentQuestionIndex(idx)}
                    >
                      <span className="text-sm">Question {idx + 1}</span>
                      {selectedAnswers[idx] && (
                        <span className="ml-2 text-green-600">✓</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Contenu de la question et réponses - 70% */}
              <div className="w-[70%] space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                  <h3 className="text-xl font-semibold mb-6">
                    {currentQuestion.question}
                  </h3>
                  <div className="space-y-4">
                    {currentQuestion.options.map((option, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-lg border cursor-pointer ${
                          selectedAnswers[currentQuestionIndex]?.includes(option)
                            ? 'border-orange-500 bg-orange-50'
                            : 'border-gray-200 hover:border-orange-500'
                        }`}
                        onClick={() => handleAnswerSelection(option)}
                      >
                        {option}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                    className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
                    disabled={currentQuestionIndex === 0}
                  >
                    Question précédente
                  </button>
                  {currentQuestionIndex === examData.questions.length - 1 ? (
                    <button
                      onClick={handleSubmitExam}
                      disabled={isSubmitting}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                    >
                      Terminer l&apos;examen
                    </button>
                  ) : (
                    <button
                      onClick={() => setCurrentQuestionIndex(prev => Math.min(examData.questions.length - 1, prev + 1))}
                      className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700"
                    >
                      Question suivante
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
      {/* ajout un espace commentaire poiur envoyer et afficher les commentaire lié au cours */}
    </div>
  );
}
