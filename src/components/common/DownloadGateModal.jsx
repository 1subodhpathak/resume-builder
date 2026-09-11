import { useState } from "react";
import { X, Download, ShieldCheck, Zap, ArrowRight } from "lucide-react";
import { loadRazorpaySdk, createPassOrder, verifyPassPayment } from "../../services/downloadGateService";

export default function DownloadGateModal({
  isOpen,
  onClose,
  clerkUser,
  resourceType = "resume_pdf",
  resourceId = "default",
  resourceName = "Resume PDF",
  onSuccessDownload,
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (!isOpen) return null;

  const handlePayRupee = async () => {
    if (!clerkUser) return;
    setLoading(true);
    setError(null);

    try {
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded) {
        setError("Failed to load payment gateway. Please check your internet connection.");
        setLoading(false);
        return;
      }

      const orderData = await createPassOrder(clerkUser.id, resourceType, resourceId);
      if (!orderData.success || !orderData.orderId) {
        setError(orderData.message || "Failed to initialize ₹1 download pass order.");
        setLoading(false);
        return;
      }

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency || "INR",
        name: "CareerSense",
        description: `₹1 Download Pass - ${resourceName}`,
        order_id: orderData.orderId,
        prefill: {
          name: clerkUser.fullName || clerkUser.firstName || "",
          email: clerkUser.primaryEmailAddress?.emailAddress || "",
        },
        theme: {
          color: "#123B6D",
        },
        handler: async function (response) {
          try {
            setLoading(true);
            const verifyRes = await verifyPassPayment({
              clerkId: clerkUser.id,
              resourceType,
              resourceId,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
            });

            if (verifyRes.success) {
              setLoading(false);
              onSuccessDownload?.();
              onClose();
            } else {
              setError(verifyRes.message || "Payment verification failed.");
              setLoading(false);
            }
          } catch (vErr) {
            console.error("[Download Pass Verification Error]:", vErr);
            setError("Error verifying ₹1 download pass.");
            setLoading(false);
          }
        },
        modal: {
          ondismiss: function () {
            setLoading(false);
          },
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      console.error("[Download pass error]:", err);
      setError("Failed to initiate ₹1 download pass.");
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-950/75 p-4 backdrop-blur-xs animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-400 transition hover:bg-slate-200 hover:text-slate-700"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-[#123B6D]/10 text-[#123B6D] border border-[#123B6D]/20 shadow-xs">
          <Download className="h-7 w-7" />
        </div>

        <div className="mt-4 text-center">
          <span className="inline-block rounded-full border border-amber-300 bg-amber-50 px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-800">
            Free Tier Download Policy
          </span>
          <h3 className="mt-2 text-xl font-black tracking-tight text-slate-900">
            Unlock {resourceName}
          </h3>
          <p className="mt-2 text-xs font-medium leading-relaxed text-slate-500">
            Free tier users get 10,000 one-time AI tokens. Downloading official PDFs or exports requires a nominal activation fee of <strong className="text-slate-900 font-bold">₹1</strong> per document.
          </p>
        </div>

        {error && (
          <div className="mt-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-center text-xs font-semibold text-rose-700">
            {error}
          </div>
        )}

        <div className="mt-6 grid gap-3">
          <button
            type="button"
            onClick={handlePayRupee}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#123B6D] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-[#0d2a4e] active:translate-y-0.5 disabled:opacity-60"
          >
            <ShieldCheck className="h-4 w-4" />
            <span>{loading ? "Processing..." : "Pay ₹1 & Download Instantly"}</span>
          </button>

          <div className="relative my-1 flex items-center justify-center">
            <div className="w-full border-t border-slate-200" />
            <span className="absolute bg-white px-3 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              OR
            </span>
          </div>

          <a
            href="https://careersenseai.com/pricing"
            target="_blank"
            rel="noopener noreferrer"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-5 py-3 text-xs font-bold text-slate-700 transition hover:bg-slate-100"
          >
            <Zap className="h-4 w-4 text-amber-500" />
            <span>Upgrade to Student Plan (Unlimited Free Downloads)</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
