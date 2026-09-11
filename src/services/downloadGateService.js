const API_BASE = import.meta.env.VITE_API_URL || "https://server.datasenseai.com";

export const loadRazorpaySdk = () => {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const checkDownloadPass = async (clerkId, resourceType, resourceId = "default") => {
  if (!clerkId) return { canDownload: false, error: "Not signed in" };

  try {
    const res = await fetch(`${API_BASE}/careersense/download/check-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkId, resourceType, resourceId }),
    });
    return await res.json();
  } catch (err) {
    console.error("[checkDownloadPass error]:", err);
    return { canDownload: false, error: err.message };
  }
};

export const createPassOrder = async (clerkId, resourceType, resourceId = "default") => {
  try {
    const res = await fetch(`${API_BASE}/careersense/download/create-pass-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ clerkId, resourceType, resourceId }),
    });
    return await res.json();
  } catch (err) {
    console.error("[createPassOrder error]:", err);
    return { success: false, message: err.message };
  }
};

export const verifyPassPayment = async (payload) => {
  try {
    const res = await fetch(`${API_BASE}/careersense/download/verify-pass`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch (err) {
    console.error("[verifyPassPayment error]:", err);
    return { success: false, message: err.message };
  }
};
