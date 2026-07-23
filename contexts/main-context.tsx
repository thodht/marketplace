import React, { createContext, useContext, useState, useEffect } from 'react';
import { usePiAuth } from '@/contexts/pi-auth-context';
import { useOnboarding } from '@/contexts/onboarding-context';
import { COLLECTIONS, AppUser } from '@/types/index'; // Adjust to where your preferences type is saved

interface MainContextType {
    isReady: boolean;
    appUser: AppUser | null;
}

const MainContext = createContext<MainContextType | undefined>(undefined);

export const MainProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { isAuthenticated, piUser, sdk } = usePiAuth();
    const { finishedOnboarding } = useOnboarding();
    const [isReady, setIsReady] = useState(false);
    const [appUser, setAppUser] = useState<AppUser | null>(null);

    // Fetch from userState once the SDK instance exists
    useEffect(() => {
        // If auth context isn't ready yet, keep waiting
        if (!sdk || !isAuthenticated || !piUser || !finishedOnboarding) {
            return;
        }

        const loadUser = async () => {
            try {
                // Load app user
                const response = await fetch(`/${COLLECTIONS.user}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-User-Id': piUser.uid
                    },
                });
                if (!response.ok) return;
                const data = await response.json();
                setAppUser(data as unknown as AppUser);
            } catch (err: any) {
                console.error('Error loading user:', err);
            } finally {
                setIsReady(true);
            }
        };

        loadUser();
    }, [sdk, isAuthenticated, piUser]);

    const value: MainContextType = {
        isReady,
        appUser,
    };

    return (
        <MainContext.Provider value={value}>{children}</MainContext.Provider>
    );
}

export const useMain = () => {
    const context = useContext(MainContext);
    if (!context) throw new Error('useMain must be used within a MainProvider');
    return context;
};