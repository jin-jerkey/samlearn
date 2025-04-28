from ollama import chat

class CourseChatbot:
    def __init__(self):
        self.model_name = 'gemma3:1b'

    def get_response(self, question):
        try:
            # Formatage du message avec le rôle "user"
            messages = [{
                'role': 'user',
                'content': question
            }]

            # Appel au modèle Gemma
            try:
                response = chat(model=self.model_name, messages=messages)
                return response['message']['content']
            except Exception as e:
                print(f"Erreur Ollama: {str(e)}")
                # Retourner un message d'erreur par défaut
                return "Désolé, je ne peux pas répondre pour le moment. Veuillez réessayer."

        except Exception as e:
            print(f"Erreur générale: {str(e)}")
            raise Exception("Erreur de communication avec le modèle IA")
