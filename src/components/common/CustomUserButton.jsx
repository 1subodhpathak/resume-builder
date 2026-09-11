import React, { useState, useRef, useEffect } from "react";
import { useUser, useClerk, SignedIn, SignedOut, SignInButton } from "@clerk/clerk-react";
import { ChevronDown, CircleUserRound, CreditCard, LogOut, User } from "lucide-react";

export default function CustomUserButton({ onOpenDashboard = null }) {
  const { user } = useUser();
  const { signOut } = useClerk();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!menuOpen) return;

    const closeOnOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    const closeOnEscape = (e) => {
      if (e.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("mousedown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("mousedown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, [menuOpen]);

  const displayName = user?.fullName || user?.firstName || "CareerSense member";
  const displayEmail = user?.primaryEmailAddress?.emailAddress || "";
  const initials = displayName
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = async () => {
    setMenuOpen(false);
    await signOut({ redirectUrl: "/" });
  };

  const handleManageProfile = () => {
    setMenuOpen(false);
    if (onOpenDashboard) {
      onOpenDashboard('profile');
    } else if (typeof window !== "undefined") {
      window.location.assign("/dashboard?tab=profile");
    }
  };

  const handleUsageBilling = () => {
    setMenuOpen(false);
    if (onOpenDashboard) {
      onOpenDashboard('billing');
    } else if (typeof window !== "undefined") {
      window.location.assign("/dashboard?tab=billing");
    }
  };

  return (
    <>
      <SignedIn>
        <div ref={menuRef} className="relative inline-block text-left">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="group flex h-10 items-center gap-1.5 rounded-full border border-[#E1E7EF] bg-white p-1 pr-2.5 text-[#071426] shadow-xs transition hover:border-[#123B6D]/40 hover:bg-[#F8FAFC] focus:outline-none"
            aria-label="Open account menu"
            aria-expanded={menuOpen}
            aria-haspopup="menu"
          >
            <span className="flex h-8 w-8 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#071426,#123B6D)] text-xs font-bold text-white shadow-xs">
              {user?.imageUrl ? (
                <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                initials || <User size={14} />
              )}
            </span>
            <ChevronDown
              className={`h-3.5 w-3.5 text-[#64748B] transition-transform duration-200 ${
                menuOpen ? "rotate-180" : ""
              }`}
            />
          </button>

          {menuOpen && (
            <div
              role="menu"
              className="absolute right-0 top-full z-50 mt-2.5 w-72 overflow-hidden rounded-2xl border border-[#E1E7EF] bg-white shadow-2xl shadow-[#071426]/15 animate-in fade-in slide-in-from-top-1 duration-150"
            >
              {/* User Info Header */}
              <div className="flex items-center gap-3 border-b border-[#E1E7EF] bg-[#F8FAFC] px-4 py-3.5">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[linear-gradient(145deg,#071426,#123B6D)] text-sm font-bold text-white shadow-xs">
                  {user?.imageUrl ? (
                    <img src={user.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    initials || <User size={16} />
                  )}
                </span>
                <div className="min-w-0 text-left">
                  <p className="truncate text-sm font-bold text-[#071426]">{displayName}</p>
                  <p className="mt-0.5 truncate text-xs font-medium text-[#64748B]">{displayEmail}</p>
                </div>
              </div>

              {/* Action Menu */}
              <div className="p-2 space-y-0.5">
                <button
                  type="button"
                  role="menuitem"
                  onClick={handleManageProfile}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#334155] transition hover:bg-[#EEF5FB] hover:text-[#123B6D]"
                >
                  <CircleUserRound className="h-4 w-4 text-[#123B6D]" />
                  <span>Manage Profile</span>
                </button>

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleUsageBilling}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-[#334155] transition hover:bg-[#FFF9EC] hover:text-[#9A7225]"
                >
                  <CreditCard className="h-4 w-4 text-[#9A7225]" />
                  <span>Usage & Repository</span>
                </button>

                <div className="my-1.5 h-px bg-[#E1E7EF]" />

                <button
                  type="button"
                  role="menuitem"
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-sm font-semibold text-rose-600 transition hover:bg-rose-50 hover:text-rose-700"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Sign out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </SignedIn>

      <SignedOut>
        <SignInButton mode="modal">
          <button
            type="button"
            className="inline-flex h-10 items-center justify-center rounded-xl bg-[#123B6D] px-4 text-xs font-bold text-white shadow-sm transition hover:bg-[#0c2749] hover:shadow-md"
          >
            Sign In
          </button>
        </SignInButton>
      </SignedOut>
    </>
  );
}
