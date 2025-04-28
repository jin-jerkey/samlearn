import { useState } from 'react';

interface ChatbotProps {
  userId: string; // ID de l'élève connecté
}

export default function CourseChatbot({ userId }: ChatbotProps) {
  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setMessages(prev => [...prev, { type: 'user', content: question }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          question,
          eleve_id: userId
        })
      });

      const data = await response.json();
      if (data.status === 'success') {
        setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      } else {
        console.error('Erreur:', data.message);
      }
    } catch (error) {
      console.error('Erreur chatbot:', error);
    } finally {
      setIsLoading(false);
      setQuestion('');
    }
  };

  return (
    <div className="fixed bottom-4 right-4 w-80 bg-white rounded-lg shadow-xl">
      <div className="h-96 flex flex-col">
        <div className="bg-orange-600 text-white p-4 rounded-t-lg">
          <h3 className="font-medium">Assistant du cours</h3>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[80%] p-3 rounded-lg ${
                msg.type === 'user' ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && <div className="text-center">...</div>}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-1 px-3 py-2 border rounded-lg"
              placeholder="Posez votre question..."
            />
            <button
              type="submit"
              className="px-4 py-2 bg-orange-600 text-white rounded-lg"
              disabled={isLoading}
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
