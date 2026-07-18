// /hooks/useTranslation.ts
import { useState, useEffect } from "react";
import { Lang, dictionaries, AppDictionary } from "@/types/languages";

export function useTranslation() {
    const [lang, setLang] = useState<Lang>("en");

    useEffect(() => {
        if (typeof window !== "undefined") {
            const savedLang = localStorage.getItem("app_user_lang") as Lang;
            if (savedLang && Object.keys(dictionaries).includes(savedLang)) {
                setLang(savedLang);
            }
        }
    }, []);

    const changeLanguage = (newLang: Lang) => {
        setLang(newLang);
        if (typeof window !== "undefined") {
            localStorage.setItem("app_user_lang", newLang);
        }
    };

    const t = (key: keyof AppDictionary): string => {
        const currentDict = dictionaries[lang] || dictionaries["en"];
        return currentDict[key] || dictionaries["en"][key] || String(key);
    };

    return {
        t,
        currentLang: lang,
        changeLanguage,
    };
}