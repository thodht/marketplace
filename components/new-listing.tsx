"use client";

import React, { useState, useEffect } from "react";
import { X, Upload, AlertCircle } from "lucide-react";
import { usePiAuth } from "@/contexts/pi-auth-context";
import { CATEGORIES, COLLECTIONS } from "@/types/index";
import { useTranslation } from '@/hooks/use-translation';
import { useOnboarding } from '@/contexts/onboarding-context';
import { storage } from '@/lib/firebase-client';
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

interface NewListingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

export function NewListingModal({ isOpen, onClose, onSuccess }: NewListingModalProps) {
    const { t } = useTranslation();
    const { piUser } = usePiAuth();
    const { preferences } = useOnboarding();

    // Core Form Fields
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [price, setPrice] = useState("");
    const [listingCount, setListingCount] = useState<number>(1);
    const [images, setImages] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    // UI States
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [errorMsg, setErrorMsg] = useState("");
    const [showConfirmClose, setShowConfirmClose] = useState(false);

    // Check if user has modified anything to guard closing
    const isDirty = title || description || categoryId || price || listingCount > 1 || images.length > 0;

    useEffect(() => {
        // 1. Create fresh preview URLs for current files
        const createdUrls = images.map((file) =>
            typeof file === "string" ? file : URL.createObjectURL(file)
        );

        setImagePreviews(createdUrls);

        // 2. Cleanup only revokes the URLs created in THIS specific render cycle
        return () => {
            createdUrls.forEach((url) => {
                if (url.startsWith("blob:")) {
                    URL.revokeObjectURL(url);
                }
            });
        };
    }, [images]);

    if (!isOpen) return null;

    // Handle Image Upload Selections
    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files) return;

        const chosenFiles = Array.from(e.target.files);

        // Check if new addition exceeds limit of 6f
        if (images.length + chosenFiles.length > 6) {
            setErrorMsg(t("new.listing.upload.exceeding"));
            return;
        }

        setErrorMsg("");
        const updatedFiles = [...images, ...chosenFiles];
        setImages(updatedFiles);

        // Generate blob preview URLs for thumbnail view
        const newPreviews = chosenFiles.map((file) => URL.createObjectURL(file));
        setImagePreviews([...imagePreviews, ...newPreviews]);
    };

    const removeImage = (indexToRemove: number) => {
        setImages((prev) => prev.filter((_, i) => i !== indexToRemove));
    };

    // Safe Close Request Check
    const handleRequestClose = () => {
        if (isDirty) {
            setShowConfirmClose(true);
        } else {
            resetAndClose();
        }
    };

    const resetAndClose = () => {
        setTitle("");
        setDescription("");
        setCategoryId("");
        setPrice("");
        setListingCount(1);
        setImages([]);
        setImagePreviews([]);
        setErrorMsg("");
        setShowConfirmClose(false);
        onClose();
    };

    const handleSubmit = async (e: React.SubmitEvent) => {
        setIsSubmitting(true);
        setErrorMsg("");

        try {
            // 1. In production, upload your files array to Firebase Storage here
            // For now, we simulate uploaded image URLs:
            let uploadedUrls: string[] = [];
            for (const file of images) {
                const uniqueFileName = `${Date.now()}_${file.name}`;
                // 2. Establish a reference path point inside your Cloud Storage bucket
                const storageRef = ref(storage, `images/${uniqueFileName}`);
                const snapshot = await uploadBytes(storageRef, file);

                // 4. Retrieve the accessible public download web URL string
                const uploadedUrl = await getDownloadURL(snapshot.ref);
                uploadedUrls.push(uploadedUrl);
            }

            // 2. Build backend submission payload matching the updated Listing Interface
            const payload = {
                categoryId: categoryId,
                title: title,
                description: description,
                listingCount: listingCount,
                status: "open",
                displayed: true,
                images: uploadedUrls,
                thumbnail: uploadedUrls[0],
                sellerId: piUser.uid,
                sellerDisplayName: preferences?.displayName,
                sellerRating: null,
                buyerId: null,
                buyerDisplayName: null,
                pendingUser: null,
                origPrice: price,
                adjustedPrice: null,
                finalizedPrice: null,
                isPromoted: false,
                promotedPlanId: null,
                promotedUntil: null,
                createdAt: Date.now()
            };

            const res = await fetch(`/${COLLECTIONS.listing}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    'X-User-Id': piUser.uid
                },
                body: JSON.stringify(payload),
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(`${t("new.listing.error01")}: ${errorData.error}`);
            }

            onSuccess();
            resetAndClose();
        } catch (err: any) {
            setErrorMsg(`${t("new.listing.error02")}: ${err.message}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-fade-in">
            <div className="relative flex h-full max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-2xl overflow-hidden">

                {/* Header */}
                <div className="flex items-center justify-between border-b px-6 py-4">
                    <h2 className="text-xl font-bold text-gray-900">{t("new.listing.heading")}</h2>
                    <button onClick={handleRequestClose} className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100 transition">
                        <X className="h-6 w-6" />
                    </button>
                </div>

                {/* Scrollable Form Body */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-5">
                    {/* Title */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("new.listing.name")} *</label>
                        <input
                            type="text"
                            required
                            value={title}
                            onChange={(e) => setTitle(e.target.value.trim())}
                            placeholder={t("new.listing.name.holder")}
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">{t("category.heading")} *</label>
                        <select
                            required
                            value={categoryId}
                            onChange={(e) => setCategoryId(e.target.value)}
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none bg-white"
                        >
                            <option value="">{t("category.none")}</option>
                            {CATEGORIES.map((cat) => (
                                <option key={cat.id} value={cat.id}>{t(`${cat.id}` as any)}</option>
                            ))}
                        </select>
                    </div>

                    {/* Dynamic Row: Price & Count */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* Price Input with 7 Decimal Cap */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("new.listing.price")} (Pi) *</label>
                            <input
                                type="number"
                                step="0.0000001"
                                max="99999"
                                required
                                value={price}
                                onChange={(e) => {
                                    // Handle Price changes limiting to 7 decimal places
                                    const value = e.target.value;
                                    if (value === "" || /^\d*\.?\d{0,7}$/.test(value)) {
                                        setPrice(value);
                                    }
                                }}
                                placeholder="0.0000000"
                                className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none"
                            />
                        </div>

                        {/* Item Count Field with Custom Control Buttons */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("new.listing.count")}</label>
                            <div className="flex h-[46px] items-center rounded-xl border border-gray-300 overflow-hidden">
                                <input
                                    type="number"
                                    min="1"
                                    max="99999"
                                    defaultValue={1}
                                    onChange={(e) => {
                                        // Limit count to 5 digits.
                                        if (e.target.value.length > 5) {
                                            e.target.value = e.target.value.slice(0, 5);
                                            setListingCount(parseInt(e.target.value));
                                        }
                                    }}
                                    className="h-full flex-1 text-center font-medium text-gray-900 border-none outline-none focus:ring-0 text-sm"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        {/*<label className="block text-sm font-semibold text-gray-700 mb-1">{t("new.listing.desc")}</label>*/}
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold text-gray-700">{t("new.listing.desc")}</label>
                            <span className="text-xs text-gray-500 font-medium">({description?.length || 0}/2000)</span>
                        </div>
                        <textarea
                            rows={3}
                            maxLength={2000}
                            value={description}
                            onChange={(e) => setDescription(e.target.value.trim())}
                            placeholder={t("new.listing.desc.holder")}
                            className="w-full rounded-xl border border-gray-300 p-3 text-sm focus:border-indigo-500 focus:outline-none resize-none"
                        />
                    </div>

                    {/* Upload Multiple Images Box */}
                    <div>
                        <div className="flex items-center justify-between mb-1">
                            <label className="block text-sm font-semibold text-gray-700">{t("new.listing.image.heading")}</label>
                            <span className="text-xs text-gray-500 font-medium">{images.length}/6</span>
                        </div>

                        {/* File Inputs Trigger Area */}
                        {images.length < 6 && (
                            <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-4 cursor-pointer hover:bg-indigo-50/40 hover:border-indigo-400 transition mb-3">
                                <Upload className="h-6 w-6 text-gray-400 mb-1" />
                                <span className="text-xs font-semibold text-indigo-600">{t("new.listing.upload.desc")}</span>
                                <input
                                    type="file"
                                    multiple
                                    accept="image/*"
                                    className="hidden"
                                    onChange={handleImageChange}
                                />
                            </label>
                        )}
                        {errorMsg && (
                            <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm text-red-600">
                                <AlertCircle className="h-5 w-5 flex-shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        {/* Thumbnail Preview Layout */}
                        {imagePreviews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2 mt-2">
                                {imagePreviews.map((url, index) => (
                                    <div key={index} className="relative aspect-square rounded-lg overflow-hidden border bg-gray-50 group">
                                        <img src={url} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(index)}
                                            className="absolute top-1 right-1 rounded-full bg-black/70 p-1 text-white hover:bg-black transition opacity-90"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t flex gap-3">
                        <button
                            type="button"
                            disabled={isSubmitting}
                            onClick={handleRequestClose}
                            className="flex-1 rounded-xl border border-gray-300 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition active:scale-[0.98]"
                        >
                            {t("new.listing.cancel")}
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex-1 rounded-xl bg-indigo-600 py-3 text-sm font-semibold text-white hover:bg-indigo-700 transition disabled:opacity-50 active:scale-[0.98]"
                        >
                            {isSubmitting ? t("new.listing.publishing") : t("new.listing.publish")}
                        </button>
                    </div>
                </form>

                {/* Confirmation Interception Backdrop Alert Box */}
                {
                    showConfirmClose && (
                        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 p-6 animate-fade-in">
                            <div className="w-full max-w-xs rounded-2xl bg-white p-5 text-center shadow-xl border">
                                <h3 className="text-base font-bold text-gray-900 mb-2">{t("new.listing.discard.heading")}</h3>
                                <p className="text-xs text-gray-500 mb-4">{t("new.listing.discard.msg")}</p>
                                <div className="flex gap-2">
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmClose(false)}
                                        className="flex-1 rounded-lg border bg-gray-50 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100"
                                    >
                                        {t("new.listing.continue")}
                                    </button>
                                    <button
                                        type="button"
                                        onClick={resetAndClose}
                                        className="flex-1 rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700"
                                    >
                                        {t("new.listing.discard")}
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

            </div >
        </div >
    );
}