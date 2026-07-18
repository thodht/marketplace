import React, { createContext, useContext, useState, useEffect } from 'react';
import { buildPiSdk, PiSdk } from '@/lib/piSdk';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { UserPreferences } from '@/types/index'; // Adjust to where your preferences type is saved

interface PreferencesContextType {
    preferences: UserPreferences | null;
    isLoading: boolean;
    needsOnboarding: boolean;
    updatePreference: (key: keyof UserPreferences, value: any) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const authContext = usePiAuth();
    const [sdk, setSdk] = useState<PiSdk | null>(null);
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(true);

    // Initialize the SDK Client-Side Singleton
    useEffect(() => {
        const sdkInstance = buildPiSdk();
        setSdk(sdkInstance);
    }, []);

    // Fetch from userState once the SDK instance exists
    useEffect(() => {
        if (!sdk) return;

        if (!authContext.isAuthenticated) {
            return;
        }
        const loadUserlPreferences = async () => {
            try {
                // Optional safety check: ensure authentication status before accessing state endpoints
                const loggedIn = sdk.auth.isLoggedIn();
                if (!loggedIn) {
                    console.warn("User is not explicitly logged into the Pi SDK.");
                }

                // Fetch the global user preferences record using the storage api namespace
                const savedRecord = await sdk.userState.get(authContext.user.uid);

                if (savedRecord && savedRecord.blob) {
                    // Cast the storage record value map safely to your type schema
                    setPreferences(savedRecord.blob as unknown as UserPreferences);
                    setNeedsOnboarding(false);
                } else {
                    // Record doesn't exist yet -> trigger user onboarding flow
                    setNeedsOnboarding(true);
                }
            } catch (error) {
                console.error("Failed to retrieve user state preferences:", error);
                setNeedsOnboarding(true);
            } finally {
                setIsLoading(false);
            }
        };

        loadUserlPreferences();
    }, [sdk]);

    // Updates specific preference slots incrementally
    const updatePreference = async (key: keyof UserPreferences, value: any) => {
        if (!sdk || !preferences) return;

        const updated = { ...preferences, [key]: value };
        setPreferences(updated);

        // Cast the object into Record<string, unknown> to satisfy PiUserStateApi parameters
        await sdk.userState.set(authContext.user.uid, updated as unknown as Record<string, unknown>);
    };

    const completeOnboarding = async () => {
        setNeedsOnboarding(false);
    }

    return (
        <PreferencesContext.Provider value={{ preferences, isLoading, needsOnboarding, updatePreference, completeOnboarding }}>
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
    return context;
};