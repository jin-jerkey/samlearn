import { useState } from 'react';

interface Props {
  userId: string;
  courseContext?: string;
}

export default function CourseChatbot({courseContext }: Props) {
  const [messages, setMessages] = useState<Array<{type: 'user' | 'bot', content: string}>>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('http://localhost:5000/api/chatbot/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage,
          courseContext: courseContext
        }),
      });

      const data = await response.json();
      
      if (data.status === 'success') {
        setMessages(prev => [...prev, { type: 'bot', content: data.response }]);
      } else {
        throw new Error(data.message);
      }
    } catch {
      setMessages(prev => [...prev, { 
        type: 'bot', 
        content: "Désolé, je n'ai pas pu traiter votre demande." 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-20 right-6 w-96 bg-white rounded-lg shadow-xl">
      <div className="h-96 flex flex-col">
        <div className="bg-orange-600 text-white p-4 rounded-t-lg">
          <h3 className="text-lg font-semibold">Assistant du cours</h3>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[75%] p-3 rounded-lg ${
                msg.type === 'user' ? 'bg-orange-100' : 'bg-gray-100'
              }`}>
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 p-3 rounded-lg">
                En train d&apos;écrire...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Posez votre question..."
              className="flex-1 p-2 border rounded-lg"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400"
            >
              Envoyer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
