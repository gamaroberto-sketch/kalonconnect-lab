"use client";

import { useRouter } from "next/router";
import SignupWizard from "../components/SignupWizard";

export default function RegisterPage() {
  const router = useRouter();

  const handleClose = () => {
    router.push('/login');
  };

  const handleSuccess = () => {
    // After successful registration, redirect to dashboard
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-blue-50 p-4">
      <SignupWizard
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    </div>
  );
}
