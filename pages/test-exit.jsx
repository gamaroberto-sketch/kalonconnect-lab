"use client";

import React, { useEffect } from "react";
import ClientExitScreen from "../components/ClientExitScreen";
import { VideoPanelProvider, useVideoPanel } from "../components/VideoPanelContext";
import { useAuth } from "../components/AuthContext";

// Wrapper implementation to inject test data
const TestContent = () => {
    const { setBranding } = useVideoPanel();
    const { user } = useAuth(); // Attempt to get logged in user (professional)

    useEffect(() => {
        // Inject mock branding or use logged user data
        if (user?.id) {
            setBranding(prev => ({
                ...prev,
                profile: {
                    id: user.id,
                    name: user.name || "Profissional Teste",
                    photo: user.photo,
                    specialty: user.specialty || "Especialista"
                },
                themeColors: {
                    primary: "#0ea5e9",
                    secondary: "#f0f9ff"
                }
            }));
        } else {
            // Fallback for when not logged in (hardcoded ID for testing if needed)
            // You might need to log in as professional for this to work perfectly or pass a known ID
            console.warn("User not logged in. Products might not load unless you are logged in as a Professional.");
        }
    }, [user, setBranding]);

    return (
        <div className="w-full h-screen bg-black">
            <ClientExitScreen />
        </div>
    );
};

export default function TestExitPage() {
    return (
        <VideoPanelProvider>
            <TestContent />
        </VideoPanelProvider>
    );
}
