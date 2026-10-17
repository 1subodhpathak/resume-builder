const API_BASE = import.meta.env.VITE_API_URL || "https://server.datasenseai.com";

let cachedSubscription = null;
let lastFetchTime = 0;

export const getSubscriptionStatus = async (clerkId, forceRefresh = false) => {
  if (!clerkId) {
    return {
      plan: 'free',
      tokensRemaining: 30000,
      lifetimeTokens: 30000,
      status: 'active',
      isPaidPlan: false
    };
  }

  const now = Date.now();
  if (!forceRefresh && cachedSubscription && (now - lastFetchTime < 10000)) {
    return cachedSubscription;
  }

  try {
    const res = await fetch(`${API_BASE}/careersense/subscription/status?clerkId=${encodeURIComponent(clerkId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": clerkId
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch subscription status: ${res.status}`);
    }

    const data = await res.json();
    const plan = (data.plan || 'free').toLowerCase();
    const isPaidPlan = ['student', 'intern', 'partner', 'pro', 'starter', 'team'].includes(plan);

    cachedSubscription = {
      plan: data.plan || 'free',
      tokensRemaining: typeof data.tokensRemaining === 'number' ? data.tokensRemaining : 30000,
      lifetimeTokens: data.lifetimeTokens || data.tokensRemaining || 30000,
      hasSeenWelcomeModal: data.hasSeenWelcomeModal ?? false,
      tokenRenewalDate: data.tokenRenewalDate,
      planExpiresAt: data.planExpiresAt,
      billingCycle: data.billingCycle || 'monthly',
      status: data.status || 'active',
      isPaidPlan
    };
    lastFetchTime = now;
    return cachedSubscription;
  } catch (err) {
    console.warn('[getSubscriptionStatus error]:', err.message);
    return cachedSubscription || {
      plan: 'free',
      tokensRemaining: 30000,
      lifetimeTokens: 30000,
      hasSeenWelcomeModal: true,
      status: 'active',
      isPaidPlan: false
    };
  }
};

export const dismissWelcomeModal = async (clerkId) => {
  if (!clerkId) return;
  try {
    await fetch(`${API_BASE}/careersense/subscription/dismiss-welcome-modal`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": clerkId
      },
      body: JSON.stringify({ clerkId })
    });
  } catch (err) {
    console.warn('[dismissWelcomeModal error]:', err.message);
  }
};

export const getSubscriptionLedger = async (clerkId) => {
  if (!clerkId) return { success: false, ledger: [] };

  try {
    const res = await fetch(`${API_BASE}/careersense/subscription/ledger?clerkId=${encodeURIComponent(clerkId)}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "x-clerk-user-id": clerkId
      }
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch subscription ledger: ${res.status}`);
    }

    const data = await res.json();
    return { success: true, ledger: Array.isArray(data.ledger) ? data.ledger : [] };
  } catch (err) {
    console.warn('[getSubscriptionLedger error]:', err.message);
    return { success: false, ledger: [] };
  }
};

export const POINTS_PER_USD = 20000;

export const formatUsd = (value) => `$${(Number(value) || 0).toFixed(4)}`;

export const isResumeBuilderLedgerService = (serviceId = '') => {
  if (!serviceId) return false;
  const s = String(serviceId).toLowerCase().trim();

  // Explicitly exclude other CareerSense tools/projects
  if (
    s.startsWith('ats_') ||
    s.startsWith('cover_letter') ||
    s.startsWith('coverletter') ||
    s === 'cover letter' ||
    s.startsWith('certifi') ||
    s.startsWith('razorpay') ||
    s.startsWith('upgrade') ||
    s === 'onboarding' ||
    s === 'monthly_renewal'
  ) {
    return false;
  }

  // Include all ResumeBuilder operations
  return (
    s.includes('resume') ||
    s.includes('tailor') ||
    s.includes('extract') ||
    s.includes('enhanc') ||
    s.includes('analysis') ||
    s.includes('prep') ||
    s.includes('rewrite') ||
    s.includes('bullet') ||
    s.includes('summary') ||
    s.includes('builder') ||
    s.includes('job description') ||
    s === 'calculate_ats_score' ||
    s === 'generate_interview_prep'
  );
};

export const calculateResumeBuilderUsage = (ledger = [], localUsage = [], resumes = []) => {
  let totalTokens = 0;

  const validServerEntries = (ledger || []).filter((entry) =>
    isResumeBuilderLedgerService(entry.serviceId)
  );

  if (validServerEntries.length > 0) {
    validServerEntries.forEach((entry) => {
      totalTokens += Math.abs(entry.amount || 0);
    });
  } else if (Array.isArray(localUsage) && localUsage.length > 0) {
    localUsage.forEach((entry) => {
      totalTokens += Number(entry.totalTokens) || 0;
    });
  } else if (Array.isArray(resumes) && resumes.length > 0) {
    resumes.forEach((rec) => {
      const genLen = JSON.stringify(rec.resumeData || {}).length;
      totalTokens += Math.max(800, Math.round(genLen / 4));
    });
  }

  const totalBillUsd = totalTokens / POINTS_PER_USD;
  return {
    totalTokens,
    totalBillUsd,
    formattedBill: formatUsd(totalBillUsd)
  };
};




