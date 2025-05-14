from ollama import chat

class CourseChatbot:
    def __init__(self):
        self.model_name = 'gemma3:1b'

    def get_response(self, question, course_context=None):
        try:
            # Construire le prompt avec le contexte
            prompt = ""
            if course_context:
                prompt = f"""En tant qu'assistant de cours, utilisez le contexte suivant pour répondre aux questions:

{course_context}

Question: {question}

Réponse:"""
            else:
                prompt = question

            # Formatage du message avec le rôle "user"
            messages = [{
                'role': 'user',
                'content': prompt
            }]

            # Appel au modèle Gemma
            try:
                response = chat(model=self.model_name, messages=messages)
                return response['message']['content']
            except Exception as e:
                print(f"Erreur Ollama: {str(e)}")
                return "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer."

        except Exception as e:
            print(f"Erreur générale: {str(e)}")
            raise Exception("Erreur de communication avec le modèle IA")
