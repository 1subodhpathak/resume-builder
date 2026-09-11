import { getOpenAIClient, OPENAI_MODEL } from './openaiClient';
import { recordAiTokenUsage } from './resumeRepositoryService';

export const CORA_MAX_QUESTION_CHARS = 240;
export const CORA_MAX_QUESTION_WORDS = 40;
export const CORA_MAX_ANSWER_WORDS = 70;

const CORA_INSTRUCTIONS = `You are Cora, CareerSense's concise career assistant.
Answer the user's question directly, with special expertise in resumes, job applications, interviews, career planning, and how to use CareerSense.
Use plain, practical language. Give the answer in no more than 70 words and usually 2–3 short sentences.
Do not claim that CareerSense guarantees interviews, employment, or an ATS score. If a request is unsafe, decline briefly and offer a safe alternative.`;

const limitWords = (value, maximum) => {
  const words = String(value || '').trim().split(/\s+/).filter(Boolean);
  if (words.length <= maximum) return words.join(' ');
  return `${words.slice(0, maximum).join(' ')}…`;
};

export const askCora = async (question) => {
  const normalizedQuestion = String(question || '').trim();
  if (!normalizedQuestion) throw new Error('Enter a question for Cora.');
  if (normalizedQuestion.length > CORA_MAX_QUESTION_CHARS) {
    throw new Error(`Keep your question under ${CORA_MAX_QUESTION_CHARS} characters.`);
  }
  if (normalizedQuestion.split(/\s+/).length > CORA_MAX_QUESTION_WORDS) {
    throw new Error(`Keep your question under ${CORA_MAX_QUESTION_WORDS} words.`);
  }

  const openai = getOpenAIClient();
  const completion = await openai.chat.completions.create({
    model: OPENAI_MODEL,
    messages: [
      { role: 'system', content: CORA_INSTRUCTIONS },
      { role: 'user', content: normalizedQuestion },
    ],
    max_tokens: 150,
    temperature: 0.3,
    operation: 'Cora Career Assistant',
  });

  recordAiTokenUsage({
    provider: 'openai',
    source: 'cora',
    operation: 'answer_career_question',
    model: completion?.model || OPENAI_MODEL,
    usage: completion?.usage,
    metadata: { inputCharacters: normalizedQuestion.length },
  });

  const rawAnswer = completion?.choices?.[0]?.message?.content || '';
  const answer = limitWords(rawAnswer, CORA_MAX_ANSWER_WORDS);
  if (!answer) throw new Error('Cora could not create an answer. Please try again.');
  return answer;
};
