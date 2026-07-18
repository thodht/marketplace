import React, { useState, useEffect } from "react";
import { Globe, ArrowRight } from "lucide-react";
import { buildPiSdk } from '@/lib/piSdk';
//import { usePreferences } from '@/contexts/preferences-context';
import { Lang, LANG_NAMES } from "@/types/languages";
import { useTranslation } from "@/hooks/use-translation";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { usePreferences } from "@/contexts/preferences-context";

interface OnboardingProps {
    onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
    const authContext = usePiAuth();
    const prefContext = usePreferences();
    const { t, currentLang, changeLanguage } = useTranslation();
    const [selectedLang, setSelectedLang] = useState<Lang>(currentLang);
    const [displayName, setDisplayName] = useState("");
    const [showConfirm, setShowConfirm] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");

    useEffect(() => {
        if (currentLang) {
            setSelectedLang(currentLang);
        }
    }, [currentLang]);

    const handleSelection = (langCode: Lang) => {
        setSelectedLang(langCode);
        changeLanguage(langCode);
    };

    // Simple validation before showing the confirmation dialog
    const handleContinueClick = (e: React.SyntheticEvent) => {
        e.preventDefault(); +
            setErrorMsg('');

        const trimmedName = displayName.trim();
        if (!trimmedName) {
            setErrorMsg(t("onboarding.name.error"));
            return;
        }
        if (trimmedName.length < 2) {
            setErrorMsg(t("onboarding.name.warning"));
            return;
        }
        setDisplayName(trimmedName);
        setShowConfirm(true);
    };

    const handleConfirmSubmit = async () => {
        setIsSubmitting(true);
        setErrorMsg('');
        try {
            // 1. Call our backend route to check/create user and save their name
            const response = await fetch('/api/user/onboard', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'X-User-Id': authContext.user.uid
                },
                body: JSON.stringify({
                    username: authContext.user?.username,
                    displayName: displayName,
                    rating: 0,
                    reviewCount: 0,
                    userImage: null,
                    joinedDate: Date.now()
                }),
            });

            if (!response.ok) {
                throw new Error(t("onboarding.error"));
            }

            // 2. Construct the initial preferences
            const initialPreferences = {
                lang: selectedLang,
                displayName: displayName,
                location: null,
                lat: 0,
                lng: 0,
            };
            const sdk = buildPiSdk();
            // Save to the authenticated backend storage
            await sdk.userState.set(authContext.user.uid, initialPreferences as unknown as Record<string, unknown>);
        } catch (err: any) {
            console.error('Onboarding Error:', err);
            setErrorMsg(t("onboarding.unknown.error"));
            setShowConfirm(false);
        } finally {
            setIsSubmitting(false);
            prefContext.completeOnboarding();
        }
    };

    return (
        <div className="min-h-screen flex flex-col justify-start gap-y-6 bg-slate-50 px-6 py-8 font-sans max-w-md mx-auto border-x border-slate-200 shadow-sm">
            {/* Top Branding Section */}
            <div className="flex flex-col items-center text-center mt-6">
                <div className="h-16 w-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-4 shadow-sm border border-purple-200">
                    <Globe className="h-8 w-8" />
                </div>
                <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{t("onboarding.choose.lang")}</h1>
            </div>

            {/* Form elements sit tightly below the header */}
            <form onSubmit={handleContinueClick} className="flex-1 flex flex-col gap-y-6">
                {/* Language Selection Grid - Cleaned up spacing */}
                <div className="grid grid-cols-1 gap-3 w-full">
                    {Object.entries(LANG_NAMES).map(([code, name]) => {
                        const isSelected = (selectedLang === code);
                        return (
                            <button
                                key={code}
                                type="button"
                                onClick={() => handleSelection(code as Lang)}
                                className={`flex items-center justify-between p-4 rounded-xl border-2 transition-all duration-200 text-left active:scale-[0.99] 
                                ${isSelected ?
                                        "border-purple-600 bg-purple-50/50 text-purple-900 shadow-sm"
                                        : "border-slate-200 bg-white text-slate-700 hover:border-slate-300 shadow-xs"
                                    }`}
                            >
                                <div className="flex flex-col">
                                    <span className="font-semibold text-base">{name}</span>
                                </div>

                                {/* Radial Checkbox Indicators */}
                                <div className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-colors
                                 ${isSelected ? "border-purple-600 bg-purple-600" : "border-slate-300"
                                    }`}>
                                    {isSelected && (
                                        <div className="h-2 w-2 rounded-full bg-white" />
                                    )}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Display Name Input */}
                <div className="border-t border-gray-100 pt-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">{t("onboarding.name")}</label>
                    <input
                        type="text"
                        value={displayName}
                        onChange={(e) => setDisplayName(e.target.value)}
                        placeholder={t("onboarding.name.holder")}
                        maxLength={40}
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-gray-800 placeholder-gray-400 text-sm"
                    />
                    <p className="text-xs text-amber-600 mt-2 font-medium">⚠️ {t("onboarding.name.info")}</p>
                </div>

                {errorMsg && (
                    <p className="text-sm text-red-500 text-center font-medium bg-red-50 py-2 rounded-lg">{errorMsg}</p>
                )}

                {/* CTA Continue Action Bar - mt-auto drops this cleanly down to the viewport bottom */}
                <div className="w-full mb-4">
                    <button
                        type="submit"
                        className="w-full bg-purple-600 text-white font-semibold py-4 px-6 rounded-xl shadow-md shadow-purple-200 hover:bg-purple-700 active:bg-purple-800 transition-all flex items-center justify-center gap-2"
                    >
                        <span>{t("onboarding.continue")}</span>
                        <ArrowRight className="h-4 w-4" />
                    </button>

                    {/* Visual reassurance footer */}
                    <p className="text-center text-xs text-slate-400 mt-3">{t("onboarding.remind")}</p>
                </div>
            </form>

            {/* Confirmation Modal */}
            {showConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl animate-in fade-in zoom-in-95 duration-150">
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{t("onboarding.confirm.heading")}</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            {t("onboarding.confirm.message")} <strong className="text-gray-900">"{displayName}"</strong>?
                        </p>
                        <div className="flex space-x-3">
                            <button
                                type="button"
                                onClick={() => setShowConfirm(false)}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 border border-gray-200 text-gray-600 rounded-xl text-sm font-semibold hover:bg-gray-50 transition-all disabled:opacity-50"
                            >{t("onboarding.cancel")}
                            </button>
                            <button
                                type="button"
                                onClick={handleConfirmSubmit}
                                disabled={isSubmitting}
                                className="flex-1 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl text-sm font-semibold shadow-sm transition-all disabled:opacity-50 flex justify-center items-center"
                            >
                                {isSubmitting ? (
                                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                                ) : (t("onboarding.confirm"))}
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
}