"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";
type Language = "id" | "en";

interface PublicSettingsContextType {
  theme: Theme;
  language: Language;
  setTheme: (theme: Theme) => void;
  setLanguage: (language: Language) => void;
  toggleTheme: () => void;
  t: (key: string) => string;
}

const PublicSettingsContext = createContext<
  PublicSettingsContextType | undefined
>(undefined);

// Simple translations for public pages
const translations = {
  id: {
    // Landing Page
    smartHome: "Smart Home",
    tagline: "Kontrol Rumah Pintar Anda dengan Mudah",
    description:
      "Platform IoT terpadu untuk mengelola semua perangkat pintar Anda dari satu tempat. Aman, mudah, dan powerful.",
    getStarted: "Mulai Sekarang",
    learnMore: "Pelajari Lebih Lanjut",
    features: "Fitur Unggulan",
    securePrivate: "Aman & Privat",
    secureDesc: "Keamanan tingkat enterprise dengan enkripsi end-to-end",
    realTimeControl: "Kontrol Real-time",
    realTimeDesc:
      "Kontrol dan monitoring perangkat secara real-time dari mana saja",
    roleBasedAccess: "Akses Berbasis Role",
    roleBasedDesc: "Sistem manajemen user dengan role-based access control",
    automation: "Otomasi Cerdas",
    automationDesc:
      "Buat scene dan automation untuk menghemat waktu dan energi",
    energyMonitoring: "Monitoring Energi",
    energyMonitoringDesc: "Pantau konsumsi energi dan hemat biaya listrik",
    multiDevice: "Multi-Device Support",
    multiDeviceDesc: "Dukung berbagai jenis perangkat IoT ESP32",
    readyToStart: "Siap Memulai?",
    readyDesc:
      "Bergabunglah dengan ribuan pengguna yang sudah mempercayai Smart Home",
    signUp: "Daftar Gratis",
    alreadyHaveAccount: "Sudah punya akun?",
    login: "Masuk",

    // Auth Pages
    signIn: "Masuk",
    signInDesc: "Masuk ke akun Anda untuk melanjutkan",
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Konfirmasi Password",
    forgotPassword: "Lupa password?",
    continueWith: "Atau lanjutkan dengan",
    continueWithGoogle: "Lanjutkan dengan Google",
    dontHaveAccount: "Belum punya akun?",
    registerNow: "Daftar sekarang",

    // Register
    createAccount: "Buat Akun Baru",
    registerDesc: "Daftar untuk mulai menggunakan Smart Home",
    registerWithGoogle: "Daftar dengan Google",
    orRegisterWith: "Atau daftar dengan email",
    minChars: "Minimal 8 karakter",
    repeatPassword: "Ulangi password",
    registerButton: "Daftar Sekarang",
    registering: "Mendaftar...",
    agreeToTerms: "Dengan mendaftar, Anda menyetujui",
    termsOfService: "Syarat & Ketentuan",
    and: "dan",
    privacyPolicy: "Kebijakan Privasi",
    kami: "kami",

    // Forgot Password
    forgotPasswordTitle: "Lupa Password",
    forgotPasswordDesc: "Masukkan email Anda. Kami akan kirim instruksi reset.",
    emailAddress: "Alamat Email",
    sendResetLink: "Kirim Link Reset",
    sending: "Mengirim...",
    backToLogin: "Kembali ke Login",

    // Common
    loading: "Memuat...",
    copyright: "Hak Cipta Dilindungi",
    allRightsReserved: "Semua Hak Dilindungi",
  },
  en: {
    // Landing Page
    smartHome: "Smart Home",
    tagline: "Control Your Smart Home with Ease",
    description:
      "Unified IoT platform to manage all your smart devices from one place. Secure, easy, and powerful.",
    getStarted: "Get Started",
    learnMore: "Learn More",
    features: "Key Features",
    securePrivate: "Secure & Private",
    secureDesc: "Enterprise-grade security with end-to-end encryption",
    realTimeControl: "Real-time Control",
    realTimeDesc: "Control and monitor devices in real-time from anywhere",
    roleBasedAccess: "Role-based Access",
    roleBasedDesc: "User management system with role-based access control",
    automation: "Smart Automation",
    automationDesc: "Create scenes and automations to save time and energy",
    energyMonitoring: "Energy Monitoring",
    energyMonitoringDesc:
      "Monitor energy consumption and save on electricity costs",
    multiDevice: "Multi-Device Support",
    multiDeviceDesc: "Support various types of ESP32 IoT devices",
    readyToStart: "Ready to Start?",
    readyDesc: "Join thousands of users who trust Smart Home",
    signUp: "Sign Up Free",
    alreadyHaveAccount: "Already have an account?",
    login: "Sign In",

    // Auth Pages
    signIn: "Sign In",
    signInDesc: "Sign in to your account to continue",
    username: "Username",
    email: "Email",
    password: "Password",
    confirmPassword: "Confirm Password",
    forgotPassword: "Forgot password?",
    continueWith: "Or continue with",
    continueWithGoogle: "Continue with Google",
    dontHaveAccount: "Don't have an account?",
    registerNow: "Register now",

    // Register
    createAccount: "Create New Account",
    registerDesc: "Register to start using Smart Home",
    registerWithGoogle: "Sign up with Google",
    orRegisterWith: "Or register with email",
    minChars: "Minimum 8 characters",
    repeatPassword: "Repeat password",
    registerButton: "Register Now",
    registering: "Registering...",
    agreeToTerms: "By registering, you agree to our",
    termsOfService: "Terms of Service",
    and: "and",
    privacyPolicy: "Privacy Policy",
    kami: "",

    // Forgot Password
    forgotPasswordTitle: "Forgot Password",
    forgotPasswordDesc: "Enter your email. We'll send reset instructions.",
    emailAddress: "Email Address",
    sendResetLink: "Send Reset Link",
    sending: "Sending...",
    backToLogin: "Back to Login",

    // Common
    loading: "Loading...",
    copyright: "Copyright",
    allRightsReserved: "All Rights Reserved",
  },
};

export function PublicSettingsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setThemeState] = useState<Theme>("dark");
  const [language, setLanguageState] = useState<Language>("id");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Load from localStorage
    const savedTheme = localStorage.getItem("public-theme") as Theme;
    const savedLanguage = localStorage.getItem("public-language") as Language;

    if (savedTheme) setThemeState(savedTheme);
    if (savedLanguage) setLanguageState(savedLanguage);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    // Apply theme
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(theme);
    localStorage.setItem("public-theme", theme);
  }, [theme, mounted]);

  useEffect(() => {
    if (!mounted) return;
    localStorage.setItem("public-language", language);
  }, [language, mounted]);

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
  };

  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  const toggleTheme = () => {
    setThemeState((prev) => (prev === "light" ? "dark" : "light"));
  };

  const t = (key: string): string => {
    return translations[language][key as keyof typeof translations.id] || key;
  };

  return (
    <PublicSettingsContext.Provider
      value={{ theme, language, setTheme, setLanguage, toggleTheme, t }}
    >
      {children}
    </PublicSettingsContext.Provider>
  );
}

export function usePublicSettings() {
  const context = useContext(PublicSettingsContext);
  if (!context) {
    throw new Error(
      "usePublicSettings must be used within PublicSettingsProvider",
    );
  }
  return context;
}
