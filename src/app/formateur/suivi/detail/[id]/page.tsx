'use client';
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Header from '../../../component/Header';
import Sidebar from '../../../component/Sidebar';

interface CourseDetails {
  id: number;
  titre: string;
  description: string;
  category: string;
  difficulty_level: string;
  duree_estimee: number;
  created_at: string;
  modules: Module[];
  examen: Exam | null;
}

interface Module {
  id: number;
  titre: string;
  type: string;
  ordre: number;
}

interface Exam {
  id: number;
  titre: string;
  seuil_reussite: number;
}

interface Student {
  id: number;
  nom: string;
  prenom: string;
  est_termine: boolean;
  examen_complete: boolean;
}

interface Comment {
  id: number;
  eleve_id: number;
  nom: string;
  prenom: string;
  contenu: string;
  note: number;
  created_at: string;
  responses: CommentResponse[];
}

interface CommentResponse {
  id: number;
  formateur_id: number;
  prenom: string;
  nom: string;
  contenu: string;
  created_at: string;
}

interface Formateur {
  id: number;
  nom: string;
  prenom: string;
  email: string;
  specialites: string[];
}

export default function CourseDetail() {
  const [formateurData, setFormateurData] = useState<Formateur | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [courseDetails, setCourseDetails] = useState<CourseDetails | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [replyContent, setReplyContent] = useState('');
  const [activeCommentId, setActiveCommentId] = useState<number | null>(null);
  const params = useParams();

  useEffect(() => {
    const formateur = localStorage.getItem('formateur');
    if (formateur) {
      setFormateurData(JSON.parse(formateur));
    }
  }, []);

  // Charger les détails du cours
  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cours/details/${params.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setCourseDetails(data.course);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchCourseDetails();
  }, [params.id]);

  // Charger les élèves
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/cours/${params.id}/eleves`);
        const data = await response.json();
        if (data.status === 'success') {
          setStudents(data.students);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchStudents();
  }, [params.id]);

  // Charger les commentaires
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/commentaires/cours/${params.id}`);
        const data = await response.json();
        if (data.status === 'success') {
          setComments(data.comments);
        }
      } catch (error) {
        console.error('Erreur:', error);
      }
    };

    fetchComments();
  }, [params.id]);

  const handleReply = async (commentId: number) => {
    if (!replyContent.trim()) return;

    try {
      const response = await fetch('http://localhost:5000/api/reponsecommentaire/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          formateur_id: formateurData?.id,
          commentaire_id: commentId,
          contenu: replyContent,
        }),
      });

      if (response.ok) {
        setReplyContent('');
        setActiveCommentId(null);
        // Recharger les commentaires
        const commentsResp = await fetch(`http://localhost:5000/api/commentaires/cours/${params.id}`);
        const data = await commentsResp.json();
        if (data.status === 'success') {
          setComments(data.comments);
        }
      }
    } catch (error) {
      console.error('Erreur:', error);
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} />
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)} userData={formateurData} />
        
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {courseDetails && (
            <div className="container mx-auto space-y-8">
              {/* Section 1: Informations du cours et modules */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">Informations du cours</h2>
                  <div className="space-y-4">
                    <div>
                      <h3 className="font-medium">{courseDetails.titre}</h3>
                      <p className="text-gray-600">{courseDetails.description}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-gray-500">Catégorie:</span>
                        <p>{courseDetails.category}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Niveau:</span>
                        <p>{courseDetails.difficulty_level}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Durée:</span>
                        <p>{courseDetails.duree_estimee} min</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-6 shadow">
                  <h2 className="text-xl font-bold mb-4">Modules et Examen</h2>
                  <div className="space-y-4">
                    {courseDetails.modules?.map((module) => (
                      <div key={module.id} className="p-3 bg-gray-50 rounded">
                        <p className="font-medium">{module.titre}</p>
                        <p className="text-sm text-gray-500">Type: {module.type}</p>
                      </div>
                    ))}
                    {courseDetails.examen && (
                      <div className="p-3 bg-orange-50 rounded">
                        <p className="font-medium">{courseDetails.examen.titre}</p>
                        <p className="text-sm text-orange-600">
                          Seuil de réussite: {courseDetails.examen.seuil_reussite}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Progression des élèves */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">Progression des élèves</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="font-medium text-green-600 mb-2">Cours terminé</h3>
                    {students.filter(s => s.est_termine).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-green-50 rounded mb-2">
                        <span>{student.prenom} {student.nom}</span>
                        {student.examen_complete && (
                          <span className="text-green-600">✓ Examen complété</span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div>
                    <h3 className="font-medium text-orange-600 mb-2">En cours</h3>
                    {students.filter(s => !s.est_termine).map((student) => (
                      <div key={student.id} className="flex items-center justify-between p-2 bg-orange-50 rounded mb-2">
                        <span>{student.prenom} {student.nom}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Section Commentaires */}
              <div className="bg-white rounded-lg p-6 shadow">
                <h2 className="text-xl font-bold mb-4">Commentaires et avis</h2>
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={`comment-${comment.id}`} className="border-b pb-4">
                      {/* En-tête du commentaire */}
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">{comment.prenom} {comment.nom}</p>
                          <p className="text-gray-600 mt-1">{comment.contenu}</p>
                          <p className="text-sm text-gray-400">{new Date(comment.created_at).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <span 
                              key={`star-${comment.id}-${i}`} 
                              className={`text-lg ${i < comment.note ? 'text-yellow-400' : 'text-gray-300'}`}
                            >
                              ★
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Liste des réponses existantes */}
                      {comment.responses && comment.responses.length > 0 && (
                        <div className="ml-8 space-y-3 mt-3">
                          {comment.responses.map((response) => (
                            <div key={`response-${response.id}`} className="bg-gray-50 rounded-lg p-3">
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-1">
                                <span className="font-medium text-gray-700">
                                  {response.prenom} {response.nom}
                                </span>
                                <span>•</span>
                                <span>{new Date(response.created_at).toLocaleDateString()}</span>
                              </div>
                              <p className="text-gray-700">{response.contenu}</p>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Formulaire de réponse */}
                      {activeCommentId === comment.id ? (
                        <div className="ml-8 mt-4">
                          <textarea
                            value={replyContent}
                            onChange={(e) => setReplyContent(e.target.value)}
                            className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                            placeholder="Votre réponse..."
                            rows={3}
                          />
                          <div className="flex justify-end space-x-2 mt-2">
                            <button
                              onClick={() => {
                                setActiveCommentId(null);
                                setReplyContent('');
                              }}
                              className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                              Annuler
                            </button>
                            <button
                              onClick={() => handleReply(comment.id)}
                              disabled={!replyContent.trim()}
                              className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
                            >
                              Répondre
                            </button>
                          </div>
                        </div>
                      ) : (
                        <button
                          onClick={() => setActiveCommentId(comment.id)}
                          className="ml-8 mt-2 text-orange-600 hover:text-orange-700"
                        >
                          Répondre
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
