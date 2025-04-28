"use client";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../../component/HeaderEleve";
import Sidebar from "../../component/SidebarEleve";
import CourseChatbot from "@/app/components/CourseChatbot";

interface Module {
  id: number;
  type: "document" | "texte" | "vidéo";
  titre: string;
  contenu: string;
  ordre: number;
}

interface Course {
  id: number;
  titre: string;
  modules: Module[];
}

interface ModuleProgress {
  module_id: number;
  est_complete: boolean;
}

interface Comment {
  id: number;
  eleve_id: number;
  contenu: string;
  note: number;
  created_at: string;
  nom: string;
  prenom: string;
  responses?: Response[];
}

interface Response {
  id: number;
  formateur_id: number;
  contenu: string;
  created_at: string;
  nom: string;
  prenom: string;
}

export default function FaireCour() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  interface EleveData {
    id: number;
    nom: string;
    prenom: string;
    email: string;
    niveau: string;
    [key: string]: number | string | boolean | undefined;
  }
  const [eleveData, setEleveData] = useState<EleveData | null>(null);
  const [courseData, setCourseData] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentModuleIndex, setCurrentModuleIndex] = useState(0);
  const [moduleProgress, setModuleProgress] = useState<ModuleProgress[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [rating, setRating] = useState(5);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isChatbotVisible, setIsChatbotVisible] = useState(false);

  const router = useRouter();
  const searchParams = useSearchParams();
  const coursId = searchParams.get("cours_id");

  useEffect(() => {
    const user = localStorage.getItem("user");
    if (!user) {
      router.push("/eleve/loginEleve");
      return;
    }
    setEleveData(JSON.parse(user));
  }, [router]);

  useEffect(() => {
    const fetchCourseData = async () => {
      if (!coursId || !eleveData?.id) return;

      try {
        // Récupérer les détails du cours
        const courseResponse = await fetch(
          `http://localhost:5000/api/cours/${coursId}/details?eleve_id=${eleveData.id}`
        );
        const courseData = await courseResponse.json();

        if (courseData.status === "success") {
          setCourseData(courseData.course);
          setModules(courseData.course.modules || []);
        }
      } catch (error) {
        console.error("Erreur lors du chargement du cours:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (coursId && eleveData) {
      fetchCourseData();
    }
  }, [coursId, eleveData]);

  useEffect(() => {
    const fetchModuleProgress = async () => {
      if (!eleveData?.id || !coursId) return;
      try {
        const response = await fetch(
          `http://localhost:5000/api/module/progress/${coursId}/${eleveData.id}`
        );
        const data = await response.json();
        if (data.status === "success") {
          setModuleProgress(data.progress);
        }
      } catch (error) {
        console.error("Erreur lors du chargement de la progression:", error);
      }
    };

    if (eleveData && coursId) {
      fetchModuleProgress();
    }
  }, [eleveData, coursId]);

  useEffect(() => {
    const loadComments = async () => {
      if (!coursId) return;
      try {
        const response = await fetch(
          `http://localhost:5000/api/commentaires/cours/${coursId}`
        );
        const data = await response.json();
        if (data.status === "success") {
          setComments(data.comments);
        }
      } catch (error) {
        console.error("Erreur lors du chargement des commentaires:", error);
      }
    };

    loadComments();
  }, [coursId]);

  const handleModuleComplete = async (moduleId: number) => {
    if (!eleveData?.id) return;
    try {
      const response = await fetch(
        "http://localhost:5000/api/module/complete",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eleve_id: eleveData.id,
            module_id: moduleId,
          }),
        }
      );

      if (response.ok) {
        setModuleProgress((prev) => [
          ...prev,
          { module_id: moduleId, est_complete: true },
        ]);
      }
    } catch (error) {
      console.error("Erreur lors de la completion du module:", error);
    }
  };

  const handleNext = async () => {
    if (currentModuleIndex < modules.length - 1) {
      await handleModuleComplete(modules[currentModuleIndex].id);
      setCurrentModuleIndex((prev) => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentModuleIndex > 0) {
      setCurrentModuleIndex((prev) => prev - 1);
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eleveData?.id || !coursId) return;
    setIsSubmittingComment(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/commentaire/create",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            eleve_id: eleveData.id,
            cours_id: coursId,
            contenu: newComment,
            note: rating,
          }),
        }
      );

      const data = await response.json();
      if (data.status === "success") {
        // Rafraîchir les commentaires
        const commentsResponse = await fetch(
          `http://localhost:5000/api/commentaires/cours/${coursId}`
        );
        const commentsData = await commentsResponse.json();
        if (commentsData.status === "success") {
          setComments(commentsData.comments);
        }
        setNewComment("");
        setRating(5);
      }
    } catch (error) {
      console.error("Erreur lors de l'envoi du commentaire:", error);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const renderModule = (module: Module) => {
    switch (module.type) {
      case "document":
        return (
          <div className="h-[400px] w-full">
            <object
              data={`http://localhost:5000/${module.contenu}`}
              type="application/pdf"
              className="w-full h-full"
            >
              <p>
                Le PDF ne peut pas être affiché.
                <a
                  href={`http://localhost:5000/${module.contenu}`}
                  target="_blank"
                  className="text-orange-600 hover:text-orange-700"
                >
                  Cliquez ici pour le télécharger
                </a>
              </p>
            </object>
          </div>
        );
      case "vidéo":
        return (
          <video controls className="w-full max-h-[400px]">
            <source
              src={`http://localhost:5000/${module.contenu}`}
              type="video/mp4"
            />
            Votre navigateur ne supporte pas la lecture de vidéos.
          </video>
        );
      default:
        return <div className="prose max-w-none">{module.contenu}</div>;
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar
        isOpen={isSidebarOpen}
        toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <div className="flex-1 flex flex-col overflow-hidden">
        <Header
          toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
          userData={eleveData}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-bold text-gray-800">
              Bienvenue, {eleveData?.prenom}
            </h1>
            <button
              onClick={() => setIsChatbotVisible(!isChatbotVisible)}
              className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-orange-600 text-white shadow-lg hover:bg-orange-700 flex items-center justify-center transition-all duration-200"
              title={
                isChatbotVisible
                  ? "Masquer l'assistant"
                  : "Afficher l'assistant"
              }
            >
              {isChatbotVisible ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                  />
                </svg>
              )}
            </button>
          </div>

          {courseData && (
            <div className="container mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 mb-6">
                {courseData.titre}
              </h1>

              <div className="flex gap-6">
                {/* Liste des modules - 30% */}
                <div className="w-[30%] bg-white rounded-lg shadow-sm p-4">
                  <h2 className="text-lg font-semibold mb-4">
                    Modules du cours
                  </h2>
                  <div className="space-y-2">
                    {modules.map((module, index) => {
                      const isComplete = moduleProgress.some(
                        (p) => p.module_id === module.id && p.est_complete
                      );
                      return (
                        <div
                          key={module.id}
                          className={`flex items-center p-3 rounded-lg cursor-pointer
                            ${currentModuleIndex === index ? "bg-gray-100" : ""}
                            ${isComplete ? "text-blue-600" : "text-gray-600"}`}
                          onClick={() => setCurrentModuleIndex(index)}
                        >
                          <div className="mr-3">
                            {isComplete ? (
                              <svg
                                className="w-5 h-5 text-blue-600"
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                />
                              </svg>
                            ) : (
                              <div className="w-5 h-5 border-2 border-gray-300 rounded-full" />
                            )}
                          </div>
                          <span className="text-sm">{module.titre}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Contenu du module - 70% */}
                <div className="w-[70%] space-y-6">
                  <div className="bg-white rounded-lg shadow-sm p-6 min-h-[400px]">
                    {modules[currentModuleIndex] && (
                      <>
                        <h3 className="text-xl font-semibold mb-4">
                          {modules[currentModuleIndex].titre}
                        </h3>
                        {renderModule(modules[currentModuleIndex])}
                      </>
                    )}
                  </div>

                  <div className="flex justify-between">
                    <button
                      onClick={handlePrevious}
                      className={`px-4 py-2 rounded-lg ${
                        currentModuleIndex === 0
                          ? "bg-gray-300 cursor-not-allowed"
                          : "bg-gray-600 text-white hover:bg-gray-700"
                      }`}
                      disabled={currentModuleIndex === 0}
                    >
                      Précédent
                    </button>
                    {currentModuleIndex === modules.length - 1 ? (
                      <button
                        onClick={() =>
                          router.push(
                            `/eleve/mescours/fairExamin?cours_id=${coursId}`
                          )
                        }
                        className="px-4 py-2 rounded-lg bg-green-600 text-white hover:bg-green-700"
                      >
                        Passer l&apos;examen
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        className="px-4 py-2 rounded-lg bg-orange-600 text-white hover:bg-orange-700"
                      >
                        Suivant
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Section Commentaires */}
              <div className="mt-8 bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-semibold mb-6">Commentaires</h2>

                {/* Formulaire de commentaire */}
                <form onSubmit={handleCommentSubmit} className="mb-8">
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Note
                    </label>
                    <div className="flex gap-2">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          onClick={() => setRating(star)}
                          className={`text-2xl ${
                            star <= rating ? "text-yellow-400" : "text-gray-300"
                          }`}
                        >
                          ★
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Votre commentaire
                    </label>
                    <textarea
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Partagez votre expérience..."
                      required
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={isSubmittingComment}
                    className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
                  >
                    {isSubmittingComment
                      ? "Envoi..."
                      : "Publier le commentaire"}
                  </button>
                </form>

                {/* Liste des commentaires */}
                <div className="space-y-6">
                  {comments.map((comment) => (
                    <div key={comment.id} className="border-b pb-4">
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <p className="font-medium">
                            {comment.prenom} {comment.nom}
                          </p>
                          <div className="flex text-yellow-400">
                            {Array.from({ length: comment.note }).map(
                              (_, i) => (
                                <span key={i}>★</span>
                              )
                            )}
                          </div>
                        </div>
                        <span className="text-sm text-gray-500">
                          {new Date(comment.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-gray-700">{comment.contenu}</p>
                      {/* Réponses du formateur */}
                      {comment.responses && comment.responses.length > 0 && (
                        <div className="ml-8 mt-4 space-y-3">
                          {comment.responses.map((response) => (
                            <div
                              key={`response-${response.id}`}
                              className="bg-gray-50 rounded-lg p-4 border-l-4 border-orange-500"
                            >
                              <div className="flex items-center gap-2 text-sm text-gray-500 mb-2">
                                <span className="font-medium text-gray-700">
                                  {response.prenom} {response.nom} (Formateur)
                                </span>
                                <span>•</span>
                                <span>
                                  {new Date(
                                    response.created_at
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <p className="text-gray-700">
                                {response.contenu}
                              </p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                  {comments.length === 0 && (
                    <p className="text-gray-500 text-center">
                      Aucun commentaire pour le moment.
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        {isChatbotVisible && eleveData && (
          <CourseChatbot userId={eleveData.id.toString()} />
        )}
      </div>
    </div>
  );
}
