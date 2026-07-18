"use client";

// Builds the Pi SDK from the modular @swetate npm packages and adapts it to the
// SDKLiteInstance surface the rest of this template already consumes (usePiAuth().sdk,
// lib/pi-payment.ts, generated app code).
//
// Phase 1: authentication and user-state are served by the @swetate packages by default.
// Payments, ads, products and purchase-restore continue to flow through SDKLite until
// @swetate/payments and @swetate/ads are published, at which point the SDKLite fallback is
// removed and this becomes a single SDK. Keeping the SDKLiteInstance shape means no app
// code, locked file, or V0 prompt has to change in the meantime.

import { createPiSDK } from "@swetate/core";
import { PiUser, authPlugin } from "@swetate/auth";
import { UserStateRecord, userStatePlugin } from "@swetate/user-state";
import { PI_NETWORK_CONFIG } from "@/lib/system-config";

// The public surfaces the @pi-sdk plugins mount on the instance. createPiSDK types the
// instance as an open record, so we narrow the two namespaces we use.
interface PiAuthApi {
    login: (scopes?: string[]) => Promise<PiUser>;
    getUser: () => PiUser | null;
    isLoggedIn: () => boolean;
}

interface PiUserStateApi {
    get: (key: string) => Promise<UserStateRecord | null>;
    set: (key: string, blob: Record<string, unknown>) => Promise<void>;
    delete: (key: string) => Promise<void>;
    keys: () => Promise<string[]>;
}

export interface PiSdk {
    auth: PiAuthApi;
    userState: PiUserStateApi;
}

/**
 * Construct the @pi-sdk instance with the auth and user-state plugins. The plugins mount
 * `auth` and `userState`, and core auto-namespaces their requests to /pi/{plugin}/{version}
 * against the build-time backend URL.
 */
export function buildPiSdk(): PiSdk {
    const pi = createPiSDK({ backendUrl: process.env.NODE_ENV === 'production' ? PI_NETWORK_CONFIG.PROD_BACKEND_URL : PI_NETWORK_CONFIG.DEV_BACKEND_URL });
    pi.use(authPlugin());
    pi.use(userStatePlugin());
    return pi as unknown as PiSdk;
}

declare global {
    interface Window {
        Pi: {
            init: (config: { version: string; sandbox?: boolean }) => Promise<void>;
        };
    }
}