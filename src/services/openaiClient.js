export const OPENAI_MODEL = 'gpt-4o-mini';
export const OPENAI_ENHANCEMENT_MODEL = 'gpt-5.6-luna';

const getClerkToken = async () => {
  if (typeof window !== 'undefined' && window.Clerk?.session) {
    try {
      return await window.Clerk.session.getToken();
    } catch {
      return null;
    }
  }
  return null;
};

const getClerkUserId = () => {
  if (typeof window !== 'undefined' && window.Clerk?.user?.id) {
    return window.Clerk.user.id;
  }
  return '';
};

export const createBackendChatCompletion = async ({
  messages,
  model = OPENAI_MODEL,
  temperature,
  max_tokens,
  max_completion_tokens,
  response_format,
  reasoning_effort,
  system,
  operation,
  taskName,
}) => {
  const apiBase =
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_BACKEND_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    'https://server.datasenseai.com';

  const token = await getClerkToken();
  const clerkId = getClerkUserId();

  const headers = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  if (clerkId) {
    headers['x-clerk-user-id'] = clerkId;
  }

  const response = await fetch(
    `${apiBase}/careersense/resumebuilder/ai/chat-completion?clerkId=${encodeURIComponent(clerkId)}`,
    {
      method: 'POST',
      headers,
      body: JSON.stringify({
        messages,
        model,
        temperature,
        max_tokens: max_tokens || max_completion_tokens,
        response_format,
        reasoning_effort,
        system,
        clerkId,
        operation: operation || taskName || 'Resume Generation',
      }),
    }
  );

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.error || `AI completion failed with status ${response.status}`
    );
  }

  return await response.json();
};

export const getOpenAIClient = () => {
  return {
    chat: {
      completions: {
        create: (payload) => createBackendChatCompletion(payload),
      },
    },
  };
};
