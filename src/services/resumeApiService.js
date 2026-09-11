const getApiBaseUrl = () => {
  return import.meta.env.VITE_API_URL || 'https://server.datasenseai.com';
};

// Central helper for authenticated requests to data_sense_server
export const authenticatedFetch = async (endpoint, options = {}, getToken = null) => {
  const baseUrl = getApiBaseUrl();
  const url = `${baseUrl}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (typeof getToken === 'function') {
    try {
      const token = await getToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[authenticatedFetch] Could not retrieve Clerk token:', err);
    }
  } else if (typeof window !== 'undefined' && typeof window.clerkGetToken === 'function') {
    try {
      const token = await window.clerkGetToken();
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    } catch (err) {
      console.warn('[authenticatedFetch] Fallback token retrieval error:', err);
    }
  }

  if (typeof window !== 'undefined' && window.clerkUserId) {
    headers['x-clerk-user-id'] = window.clerkUserId;
  }

  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorDetail = '';
    try {
      const errJson = await response.json();
      errorDetail = errJson.error || errJson.message || '';
    } catch {
      // response is not JSON
    }
    throw new Error(errorDetail || `Request failed with status ${response.status}`);
  }

  return response.json();
};

export const fetchAllUserDataFromBackend = async (getToken) => {
  return authenticatedFetch('/careersense/resumebuilder/all', { method: 'GET' }, getToken);
};

export const updateBackendProfile = async (profile, getToken) => {
  return authenticatedFetch('/careersense/resumebuilder/profile', {
    method: 'PUT',
    body: JSON.stringify({ profile })
  }, getToken);
};

export const saveBackendResumeRecord = async (resumeRecord, getToken) => {
  return authenticatedFetch('/careersense/resumebuilder/resumes', {
    method: 'POST',
    body: JSON.stringify(resumeRecord)
  }, getToken);
};

export const deleteBackendResumeRecord = async (resumeId, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/resumes/${resumeId}`, {
    method: 'DELETE'
  }, getToken);
};

export const saveBackendResumeUpload = async (uploadRecord, getToken) => {
  return authenticatedFetch('/careersense/resumebuilder/uploads/resumes', {
    method: 'POST',
    body: JSON.stringify(uploadRecord)
  }, getToken);
};

export const deleteBackendResumeUpload = async (uploadId, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/uploads/resumes/${uploadId}`, {
    method: 'DELETE'
  }, getToken);
};

export const saveBackendJobDescription = async (jdRecord, getToken) => {
  return authenticatedFetch('/careersense/resumebuilder/uploads/job-descriptions', {
    method: 'POST',
    body: JSON.stringify(jdRecord)
  }, getToken);
};

export const deleteBackendJobDescription = async (jdId, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/uploads/job-descriptions/${jdId}`, {
    method: 'DELETE'
  }, getToken);
};

export const logBackendAtsHistory = async (resumeId, jdText, result, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/resumes/${resumeId}/ats-history`, {
    method: 'POST',
    body: JSON.stringify({ jdText, result })
  }, getToken);
};

export const logBackendInterviewPrepHistory = async (resumeId, jdText, result, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/resumes/${resumeId}/interview-prep-history`, {
    method: 'POST',
    body: JSON.stringify({ jdText, result })
  }, getToken);
};

export const markBackendResumePrinted = async (resumeId, getToken) => {
  return authenticatedFetch(`/careersense/resumebuilder/resumes/${resumeId}/mark-printed`, {
    method: 'POST'
  }, getToken);
};
