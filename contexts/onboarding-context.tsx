import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { COLLECTIONS, UserPreferences, AppUser } from '@/types/index'; // Adjust to where your preferences type is saved

interface OnboardingContextType {
    preferences: UserPreferences | null;
    isLoading: boolean;
    needsOnboarding: boolean;
    finishedOnboarding: boolean;
    updatePreference: (key: keyof UserPreferences, value: any) => Promise<void>;
    saveUserPreferences: (userPrefs: UserPreferences) => Promise<void>;
    completeOnboarding: () => Promise<void>;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    lang: 'en',
    displayName: null,
    location: null
};

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { sdk, isAuthenticated, piUser } = usePiAuth();
    const [preferences, setPreferences] = useState<UserPreferences | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [needsOnboarding, setNeedsOnboarding] = useState<boolean>(true);
    const [finishedOnboarding, setFinishedOnboarding] = useState<boolean>(false);
    const [appUser, setAppUser] = useState<AppUser | null>(null);

    // Fetch from userState once the SDK instance exists
    useEffect(() => {
        if (!sdk) return;

        // If auth context isn't ready yet, keep waiting
        if (!isAuthenticated || !piUser) {
            return;
        }

        const loadUserPreferences = async () => {
            setIsLoading(true);
            try {
                // Fetch the global user preferences record using the storage api namespace
                const savedRecord = await sdk.userState.get(piUser.uid);

                if (savedRecord && savedRecord.blob) {
                    // Cast the storage record value map safely to your type schema
                    setPreferences(savedRecord.blob as unknown as UserPreferences);
                    setNeedsOnboarding(false);
                    setIsLoading(false);
                    const response = await fetch(`/${COLLECTIONS.user}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                            'X-User-Id': piUser.uid
                        },
                    });
                    if (response.ok) {
                        setFinishedOnboarding(true);
                    }
                    return;
                }
                else {
                    setNeedsOnboarding(true);
                }
            } catch (error) {
                console.error("Failed to retrieve user state preferences:", error);
                setNeedsOnboarding(true);
            }
        };

        loadUserPreferences();
    }, [piUser]);

    // Helper function dedicated purely to network/SDK persistence
    const savePreferencesToStorage = async (newPreferences: UserPreferences) => {
        try {
            // Option A: If updating via the @pi-sdk/user-state plugin bridge
            if (sdk?.userState) {
                await sdk.userState.set(piUser.uid, newPreferences as unknown as Record<string, unknown>);
            }
        } catch (error) {
            console.error("Failed to sync preferences to backend storage:", error);
            // Optional: Roll back UI state here or trigger a toast warning if needed
        }
    };

    const updatePreference = async (key: keyof UserPreferences, value: any) => {
        setPreferences((preferences) => {
            const baseConf = preferences || DEFAULT_PREFERENCES;
            const updatedPref = {
                ...baseConf,
                [key]: value
            };
            savePreferencesToStorage(updatedPref as UserPreferences);
            return updatedPref;
        });
    }
    const saveUserPreferences = async (userPrefs: UserPreferences) => {
        if (!sdk) return;
        setPreferences(userPrefs);
        try {
            await sdk.userState.set(piUser.uid, userPrefs as unknown as Record<string, unknown>);
        } catch (err) {
            console.error("Failed to persist preferences to storage:", err);
        }
    };

    const completeOnboarding = async () => {
        setNeedsOnboarding(false);
        setFinishedOnboarding(true);
        setIsLoading(false);
    }

    const value: OnboardingContextType = {
        preferences,
        isLoading,
        needsOnboarding,
        finishedOnboarding,
        appUser,
        updatePreference,
        saveUserPreferences,
        completeOnboarding
    };

    return (
        <OnboardingContext.Provider value={value}>{children}</OnboardingContext.Provider>
    );
};

export const useOnboarding = () => {
    const context = useContext(OnboardingContext);
    if (!context) throw new Error('usePreferences must be used within a PreferencesProvider');
    return context;
};