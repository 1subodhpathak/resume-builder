import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ClerkProvider } from '@clerk/clerk-react'
import App from './App.jsx'
import './index.css'
import { HelmetProvider } from 'react-helmet-async'
import { ThemeProvider } from './theme/ThemeProvider.jsx'
import CSLogo from './assets/cs_logo.png'

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    {PUBLISHABLE_KEY ? (
      <ClerkProvider
        publishableKey={PUBLISHABLE_KEY}
        appearance={{
          variables: {
            colorPrimary: '#123B6D',
            colorText: '#0f172a',
            colorTextSecondary: '#64748b',
            colorBackground: '#ffffff',
            colorInputBackground: '#f8fafc',
            colorInputText: '#0f172a',
            borderRadius: '0.875rem',
            fontFamily: 'inherit',
          },
          layout: {
            logoImageUrl: CSLogo,
            socialButtonsPlacement: 'top',
            socialButtonsVariant: 'blockButton',
            unsafe_disableDevelopmentModeWarnings: true,
          },
          elements: {
            modalBackdrop: 'bg-slate-950/60 backdrop-blur-sm',
            modalContent: 'mx-4',
            cardBox: 'overflow-hidden rounded-3xl shadow-2xl shadow-slate-950/20',
            card: 'border border-slate-200/80 shadow-none',
            logoImage: 'h-10 w-auto object-contain',
            headerTitle: 'text-2xl font-bold tracking-tight text-slate-900',
            headerSubtitle: 'text-sm text-slate-500',
            socialButtonsBlockButton: 'h-12 border-slate-200 bg-white text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50',
            dividerLine: 'bg-slate-200',
            dividerText: 'text-xs font-medium text-slate-400',
            formFieldLabel: 'text-xs font-semibold text-slate-700',
            formFieldInput: 'h-12 border-slate-200 bg-slate-50 text-sm text-slate-900 shadow-none focus:border-[#123B6D] focus:ring-[#123B6D]/20',
            formButtonPrimary: 'h-12 bg-[#123B6D] text-sm font-semibold shadow-md shadow-[#123B6D]/20 hover:bg-[#0e2d53]',
            footerActionText: 'text-sm text-slate-500',
            footerActionLink: 'text-sm font-semibold text-[#123B6D] hover:text-[#0b1f3a]',
            footer: 'hidden',
            userButtonPopoverFooter: 'hidden',
            userProfileFooter: 'hidden',
          },
        }}
      >
        <BrowserRouter>
          <HelmetProvider>
            <ThemeProvider>
              <App />
            </ThemeProvider>
          </HelmetProvider>
        </BrowserRouter>
      </ClerkProvider>
    ) : (
      <BrowserRouter>
        <HelmetProvider>
          <ThemeProvider>
            <App />
          </ThemeProvider>
        </HelmetProvider>
      </BrowserRouter>
    )}
  </React.StrictMode>,
)
