import { Lang } from "@/types/languages";

// ============================================================================
// TYPE HELPERS
// ==========================================

// Strict status types for marketplace items
export type ListingStatus = 'open' | 'pending' | 'sold';

// Strict status for offers
export type OfferStatus = 'offered' | 'declined' | 'accepted';

export const CATEGORIES: Category[] = [
    { id: 'electronics', name: 'Electronics', icon: 'laptop', bgcolor: 'bg-blue-100' },
    { id: 'fashion', name: 'Fashion', icon: 'shirt', bgcolor: 'bg-pink-100' },
    { id: 'vehicles', name: 'Vehicles', icon: 'car', bgcolor: 'bg-red-100' },
    { id: 'food', name: 'Food', icon: 'utensils', bgcolor: 'bg-yellow-100' },
    { id: 'services', name: 'Services', icon: 'handshake', bgcolor: 'bg-green-100' },
    { id: 'others', name: 'Others', icon: 'circle-ellipsis', bgcolor: 'bg-purple-100' },
];

export const PROMOTION_PLANS: PromotionPlan[] = [
    {
        id: 'basic_boost',
        name: '3-Day Quick Boost',
        durationDays: 3,
        pricePi: 1,
        description: 'Get featured on the homepage carousel for 3 days.',
    },
    {
        id: 'premium_boost',
        name: '7-Day Mega Boost',
        durationDays: 7,
        pricePi: 2,
        description: 'Top placement in search results and homepage grid for 7 days.',
    },
    {
        id: 'monthly_boost',
        name: '30-Day Elite Visibility',
        durationDays: 30,
        pricePi: 7,
        description: 'Maximum visibility across the entire app for a full month.',
    },
];

// ============================================================================
// DATABASE SCHEMAS (PERSISTENT STORAGE & FIRESTORE)
// ============================================================================
// 1. PRODUCT CATEGORIES
export interface Category {
    id: string;
    name: string;
    icon: string;    // e.g., Lucide icon name or image path
    bgcolor: string; // e.g., Tailwind class 'bg-blue-100' or hex '#f0f0f0'
}

// 2. USERS
export interface User {
    id: string;              // Pi User UID
    username: string;        // Unique Pi username (e.g., "alex99")
    displayName?: string;   // Friendly name (e.g., "Alex Smith") - Optional fallback
    rating: number;
    reviewCount: number;
    userImage: string | null;
    joinedDate: number;          // Firestore Server Timestamp or number
}

// 3. FAVORITES (Independent Collection)
export interface Favorite {
    id: string;              // Composite ID: `${username}_${listingId}`
    username: string;        // The Pi user who liked it
    listingId: string;       // The targeted listing
    createdAt: number;
}

// 4. LISTINGS
export interface Listing {
    id: string;
    categoryId: string;
    title: string;
    description: string;
    status: ListingStatus;    // 'open', 'pending', or 'sold'
    displayed: boolean;       // Control feed visibility (Seller deletes set this to false)
    images: string[];
    thumbnail: string | null; // thumbnail displayed in home page and chat room

    // Seller Context (Denormalized names for instant display)
    sellerId: string;
    sellerUsername: string;
    sellerDisplayName: string | null;
    sellerRating: number;

    // Buyer & Lockout Context
    buyerId: string | null;
    buyerUsername: string | null;
    buyerDisplayName: string | null;
    pendingUser: string | null; // Exclusive Checkout Lock (Blocks other buyers when status is 'pending')

    // Pricing
    origPrice: number;
    adjustedPrice: number;
    finalizedPrice: number;

    // Promotion
    isPromoted: boolean;
    promotedPlanId?: string; // References 'basic_boost', 'premium_boost', etc.
    promotedUntil?: number;  // millisecond timestamp

    createdAt: number;
}

// 5. OFFERS (Subcollection inside Listing or separate indexed collection)
export interface Offer {
    id: string;
    listingId: string;
    offeredPrice: number;
    offerMessage: string;
    status: OfferStatus;       // Set to true when seller accepts this specific offer

    // Buyer Context
    buyerId: string;
    buyerUsername: string;
    buyerDisplayName: string | null;
    createdAt: number;
}

// 6. REVIEWS
export interface Review {
    id: string;
    listingId: string;
    listingTitle: string;     // Denormalized so the profile grid shows what item was reviewed
    rating: number;           // Integer 1 to 5
    reviewText: string;

    // Target of review
    sellerId: string;         // Crucial field allowing instant queries on a Seller's profile page

    // Author of review
    reviewerId: string;       // Buyer's Pi UID
    reviewerUsername: string;
    reviewerDisplayName: string | null;
    createdAt: number;
}

// 7. CHAT ROOMS
export interface ChatRoom {
    id: string;               // Composite ID: `${listingId}_${buyerId}` to prevent redundant rooms
    listingId: string;
    listingTitle: string;     // Denormalized for inbox preview
    thumbnail: string;        // Denormalized thumbnail for inbox preview

    // Participants
    buyerId: string;
    buyerUsername: string;
    buyerDisplayName: string | null;

    sellerId: string;
    sellerUsername: string;
    sellerDisplayName: string | null;

    // Inbox Preview Metadata
    lastMessage: string;      // Snippet showing the last text sent
    updatedAt: number;           // Crucial for sorting inbox by newest conversation
}

// 8. CHAT MESSAGES (Subcollection inside: chatRooms/{roomId}/messages/)
export interface ChatMessage {
    id: string;               // Auto-generated by Firestore
    message: string;
    senderId: string;         // Sender's Pi UID
    senderUsername: string;
    createdAt: number;           // Order chronological sequence
}

// 9. PROMOTION PURCHASES
export interface PromotionPlan {
    id: string;
    name: string;
    durationDays: number;
    pricePi: number; // The cost in Pi
    description: string;
}

export interface Purchase {
    id: string;               // Payment UUID from Pi SDK Payment Callback (e.g., 'd290f1d...')
    piTxId: string;           // Pi Network Blockchain Transaction ID (the actual ledger hash)
    promoter: string;         // Pi username
    listingId: string;
    listingTitle: string;     // Denormalized for rapid history page rendering
    promotionPlanId: string;  // Matches PromotionPlan.id ('basic_boost', 'premium_boost', etc.)
    purchasedAt: number;      // UNIX timestamp ms
    expiryDate: number;       // UNIX timestamp ms
}

// 10. NOTIFICATIONS
export interface Notification {
    id: string;
    recipientId: string;     // <-- Required: Pi UID of the user who should see this notification
    roomId: string;
    offerId?: string;
    title: string;
    body: string;
    read: boolean;
    createdAt: number;
}

// 11. PREFERENCES
export interface UserPreferences {
    lang: Lang;
    displayName: string | null;
    location: string | null;
    lat: number;
    lng: number;
}

// ---- storage keys ----
export const KEYS = {
    user_prefs: "user_prefs",
} as const;

export const COLLECTIONS = {
    userPrefs: "UserPreferences",
    users: "Users",
    listings: "Listings"
}
/*export const CAPS = {
    listings: 40,
    offers: 60,
    threads: 40,
    messages: 80,
    reviews: 120,
    notifs: 60,
    photos: 6,
};

export const ME_ID = "me";
export const PROMOTE_COST = 2; // Pi
export const PROMOTE_DAYS = 7;

// ---- helpers ----
export function uid(): string {
    return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function clampNum(v: unknown, min: number, max: number, fallback: number): number {
    const n = typeof v === "number" && Number.isFinite(v) ? v : Number(v);
    if (!Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

export function cleanStr(v: unknown, max = 400): string {
    if (typeof v !== "string") return "";
    return v.replace(/[<>]/g, "").slice(0, max);
}

export function formatPi(n: number): string {
    const rounded = Math.round(n * 100) / 100;
    return rounded % 1 === 0 ? String(rounded) : rounded.toFixed(2);
}

export function normalize(s: string): string {
    return s.toLowerCase().trim();
}

// distance in km using equirectangular approximation
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
    const R = 6371;
    const x = ((bLng - aLng) * Math.PI) / 180 * Math.cos((((aLat + bLat) / 2) * Math.PI) / 180);
    const y = ((bLat - aLat) * Math.PI) / 180;
    return Math.sqrt(x * x + y * y) * R;
}

export function formatDistance(km: number): string {
    if (km < 1) return `${Math.max(1, Math.round(km * 1000))} m`;
    if (km < 10) return `${km.toFixed(1)} km`;
    return `${Math.round(km)} km`;
}

export function categoryById(id: string): CategoryMeta {
    return CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[CATEGORIES.length - 1];
}

export function isPromoted(l: Listing, now: number): boolean {
    return l.promotedUntil > now;
}

// ---- seed data ----
// Base location (used as fallback user location too).
export const DEFAULT_LOCATION = { label: "Downtown", lat: 40.7128, lng: -74.006 };

export const SEED_SELLERS: Seller[] = [
    { id: "s_amelia", name: "Amelia R.", rating: 4.8, reviewCount: 42, joinedAt: Date.now() - 400 * 86400000 },
    { id: "s_kenji", name: "Kenji T.", rating: 4.6, reviewCount: 27, joinedAt: Date.now() - 300 * 86400000 },
    { id: "s_marco", name: "Marco B.", rating: 4.9, reviewCount: 61, joinedAt: Date.now() - 520 * 86400000 },
    { id: "s_lena", name: "Lena P.", rating: 4.5, reviewCount: 18, joinedAt: Date.now() - 210 * 86400000 },
    { id: "s_oscar", name: "Oscar M.", rating: 4.7, reviewCount: 33, joinedAt: Date.now() - 360 * 86400000 },
    { id: "s_priya", name: "Priya N.", rating: 5.0, reviewCount: 12, joinedAt: Date.now() - 90 * 86400000 },
];

export const SELLER_MAP = new Map(SEED_SELLERS.map((s) => [s.id, s]));

interface SeedListingDef {
    id: string;
    sellerId: string;
    titleKey: string;
    descKey: string;
    price: number;
    category: CategoryId;
    hue: number;
    ageMin: number; // minutes ago
    dLat: number;
    dLng: number;
    promoted?: boolean;
}

const SEED_DEFS: SeedListingDef[] = [
    { id: "l_iphone", sellerId: "s_amelia", titleKey: "seed.iphone.t", descKey: "seed.iphone.d", price: 320, category: "electronics", hue: 265, ageMin: 22, dLat: 0.004, dLng: 0.006, promoted: true },
    { id: "l_bike", sellerId: "s_marco", titleKey: "seed.bike.t", descKey: "seed.bike.d", price: 145, category: "vehicles", hue: 120, ageMin: 95, dLat: -0.01, dLng: 0.012, promoted: true },
    { id: "l_sofa", sellerId: "s_lena", titleKey: "seed.sofa.t", descKey: "seed.sofa.d", price: 210, category: "home", hue: 40, ageMin: 180, dLat: 0.02, dLng: -0.008, promoted: true },
    { id: "l_jacket", sellerId: "s_priya", titleKey: "seed.jacket.t", descKey: "seed.jacket.d", price: 55, category: "fashion", hue: 330, ageMin: 40, dLat: 0.006, dLng: 0.003 },
    { id: "l_car", sellerId: "s_oscar", titleKey: "seed.car.t", descKey: "seed.car.d", price: 4200, category: "vehicles", hue: 210, ageMin: 320, dLat: -0.03, dLng: 0.02 },
    { id: "l_lamp", sellerId: "s_kenji", titleKey: "seed.lamp.t", descKey: "seed.lamp.d", price: 28, category: "home", hue: 150, ageMin: 65, dLat: 0.009, dLng: -0.004 },
    { id: "l_lego", sellerId: "s_amelia", titleKey: "seed.lego.t", descKey: "seed.lego.d", price: 40, category: "others", hue: 20, ageMin: 500, dLat: 0.015, dLng: 0.018 },
    { id: "l_books", sellerId: "s_lena", titleKey: "seed.books.t", descKey: "seed.books.d", price: 18, category: "others", hue: 300, ageMin: 1440, dLat: -0.005, dLng: 0.009 },
    { id: "l_laptop", sellerId: "s_marco", titleKey: "seed.laptop.t", descKey: "seed.laptop.d", price: 480, category: "electronics", hue: 265, ageMin: 150, dLat: 0.011, dLng: 0.001 },
    { id: "l_table", sellerId: "s_oscar", titleKey: "seed.table.t", descKey: "seed.table.d", price: 90, category: "home", hue: 40, ageMin: 2880, dLat: -0.02, dLng: -0.015 },
    { id: "l_guitar", sellerId: "s_kenji", titleKey: "seed.guitar.t", descKey: "seed.guitar.d", price: 130, category: "others", hue: 190, ageMin: 220, dLat: 0.008, dLng: 0.014 },
    { id: "l_shoes", sellerId: "s_priya", titleKey: "seed.shoes.t", descKey: "seed.shoes.d", price: 62, category: "fashion", hue: 330, ageMin: 75, dLat: 0.003, dLng: -0.006 },
];

export function buildSeedListings(now: number): Listing[] {
    return SEED_DEFS.map((d) => {
        const seller = SELLER_MAP.get(d.sellerId)!;
        return {
            id: d.id,
            sellerId: d.sellerId,
            sellerName: seller.name,
            title: d.titleKey, // resolved via i18n at render time (seed.* keys)
            description: d.descKey,
            price: d.price,
            category: d.category,
            status: "active" as ListingStatus,
            createdAt: now - d.ageMin * 60000,
            lat: DEFAULT_LOCATION.lat + d.dLat,
            lng: DEFAULT_LOCATION.lng + d.dLng,
            locationLabel: DEFAULT_LOCATION.label,
            promotedUntil: d.promoted ? now + 3 * 86400000 : 0,
            photoCount: 0,
            hue: d.hue,
            mine: false,
        };
    });
}

export const SEED_LISTING_IDS = new Set(SEED_DEFS.map((d) => d.id));

// ---- Pi Network ad rotation (static, in-app) ----
export const PI_ADS = [
    { id: "ad1", titleKey: "ad.wallet.t", bodyKey: "ad.wallet.b", hue: 285 },
    { id: "ad2", titleKey: "ad.browser.t", bodyKey: "ad.browser.b", hue: 260 },
    { id: "ad3", titleKey: "ad.kyc.t", bodyKey: "ad.kyc.b", hue: 300 },
];

// ---- defaults + sanitizers ----
export function defaultPrefs(): Prefs {
    return {
        lang: "en",
        displayName: "",
        displayNameSet: false,
        onboarded: false,
        locationLabel: DEFAULT_LOCATION.label,
        lat: DEFAULT_LOCATION.lat,
        lng: DEFAULT_LOCATION.lng,
        lastTab: "home",
    };
}

const LANGS = new Set(["en", "zh", "ru", "vi"]);
const TABS = new Set(["home", "sell", "messages", "notifications", "profile"]);

export function sanitizePrefs(blob: unknown): Prefs {
    const d = defaultPrefs();
    if (!blob || typeof blob !== "object") return d;
    const b = blob as Record<string, unknown>;
    return {
        lang: LANGS.has(b.lang as string) ? (b.lang as Lang) : d.lang,
        displayName: cleanStr(b.displayName, 40),
        displayNameSet: b.displayNameSet === true,
        onboarded: b.onboarded === true,
        locationLabel: cleanStr(b.locationLabel, 60) || d.locationLabel,
        lat: clampNum(b.lat, -90, 90, d.lat),
        lng: clampNum(b.lng, -180, 180, d.lng),
        lastTab: TABS.has(b.lastTab as string) ? (b.lastTab as TabId) : d.lastTab,
    };
}

const STATUSES = new Set(["active", "pending", "sold"]);

export function sanitizeListing(raw: unknown): Listing | null {
    if (!raw || typeof raw !== "object") return null;
    const b = raw as Record<string, unknown>;
    const id = cleanStr(b.id, 40);
    if (!id) return null;
    const category = CATEGORY_IDS.has(b.category as string) ? (b.category as CategoryId) : "others";
    return {
        id,
        sellerId: ME_ID,
        sellerName: cleanStr(b.sellerName, 40) || "You",
        title: cleanStr(b.title, 80),
        description: cleanStr(b.description, 1000),
        price: clampNum(b.price, 0, 10_000_000, 0),
        category,
        status: STATUSES.has(b.status as string) ? (b.status as ListingStatus) : "active",
        createdAt: clampNum(b.createdAt, 0, Date.now() + 86400000, Date.now()),
        lat: clampNum(b.lat, -90, 90, DEFAULT_LOCATION.lat),
        lng: clampNum(b.lng, -180, 180, DEFAULT_LOCATION.lng),
        locationLabel: cleanStr(b.locationLabel, 60),
        promotedUntil: clampNum(b.promotedUntil, 0, Date.now() + 400 * 86400000, 0),
        photoCount: clampNum(b.photoCount, 0, CAPS.photos, 0),
        hue: clampNum(b.hue, 0, 360, 265),
        boundBuyerId: b.boundBuyerId ? cleanStr(b.boundBuyerId, 40) : undefined,
        mine: true,
    };
}

export function sanitizeListings(blob: unknown): Listing[] {
    const arr = (blob && typeof blob === "object" && Array.isArray((blob as any).items)) ? (blob as any).items : [];
    const out: Listing[] = [];
    for (const raw of arr) {
        const l = sanitizeListing(raw);
        if (l) out.push(l);
        if (out.length >= CAPS.listings) break;
    }
    return out;
}

const OFFER_STATUSES = new Set(["pending", "accepted", "declined", "countered"]);

export function sanitizeOffers(blob: unknown): Offer[] {
    const arr = (blob && typeof blob === "object" && Array.isArray((blob as any).items)) ? (blob as any).items : [];
    const out: Offer[] = [];
    for (const raw of arr) {
        if (!raw || typeof raw !== "object") continue;
        const b = raw as Record<string, unknown>;
        const id = cleanStr(b.id, 40);
        const listingId = cleanStr(b.listingId, 40);
        if (!id || !listingId) continue;
        const historyRaw = Array.isArray(b.history) ? b.history : [];
        const history: OfferMessage[] = historyRaw.slice(0, 20).map((h: any) => ({
            id: cleanStr(h?.id, 40) || uid(),
            fromMe: h?.fromMe === true,
            price: clampNum(h?.price, 0, 10_000_000, 0),
            message: cleanStr(h?.message, 300),
            createdAt: clampNum(h?.createdAt, 0, Date.now() + 86400000, Date.now()),
            kind: h?.kind === "counter" ? "counter" : "offer",
        }));
        out.push({
            id,
            listingId,
            buyerId: cleanStr(b.buyerId, 40) || ME_ID,
            sellerId: cleanStr(b.sellerId, 40) || "",
            status: OFFER_STATUSES.has(b.status as string) ? (b.status as OfferStatus) : "pending",
            currentPrice: clampNum(b.currentPrice, 0, 10_000_000, 0),
            history,
            createdAt: clampNum(b.createdAt, 0, Date.now() + 86400000, Date.now()),
            updatedAt: clampNum(b.updatedAt, 0, Date.now() + 86400000, Date.now()),
            iAmBuyer: b.iAmBuyer !== false,
        });
        if (out.length >= CAPS.offers) break;
    }
    return out;
}

export function sanitizeThreads(blob: unknown): Thread[] {
    const arr = (blob && typeof blob === "object" && Array.isArray((blob as any).items)) ? (blob as any).items : [];
    const out: Thread[] = [];
    for (const raw of arr) {
        if (!raw || typeof raw !== "object") continue;
        const b = raw as Record<string, unknown>;
        const id = cleanStr(b.id, 90);
        const listingId = cleanStr(b.listingId, 40);
        if (!id || !listingId) continue;
        const msgsRaw = Array.isArray(b.messages) ? b.messages : [];
        const messages: ChatMessage[] = msgsRaw.slice(-CAPS.messages).map((m: any) => ({
            id: cleanStr(m?.id, 40) || uid(),
            fromMe: m?.fromMe === true,
            text: cleanStr(m?.text, 800),
            createdAt: clampNum(m?.createdAt, 0, Date.now() + 86400000, Date.now()),
        }));
        out.push({
            id,
            listingId,
            otherId: cleanStr(b.otherId, 40),
            otherName: cleanStr(b.otherName, 40) || "User",
            iAmSeller: b.iAmSeller === true,
            messages,
            updatedAt: clampNum(b.updatedAt, 0, Date.now() + 86400000, Date.now()),
        });
        if (out.length >= CAPS.threads) break;
    }
    return out;
}

export function sanitizeReviews(blob: unknown): Review[] {
    const arr = (blob && typeof blob === "object" && Array.isArray((blob as any).items)) ? (blob as any).items : [];
    const out: Review[] = [];
    for (const raw of arr) {
        if (!raw || typeof raw !== "object") continue;
        const b = raw as Record<string, unknown>;
        const id = cleanStr(b.id, 40);
        if (!id) continue;
        out.push({
            id,
            listingId: cleanStr(b.listingId, 40),
            fromId: cleanStr(b.fromId, 40),
            fromName: cleanStr(b.fromName, 40) || "User",
            toId: cleanStr(b.toId, 40),
            rating: clampNum(b.rating, 1, 5, 5),
            text: cleanStr(b.text, 500),
            createdAt: clampNum(b.createdAt, 0, Date.now() + 86400000, Date.now()),
        });
        if (out.length >= CAPS.reviews) break;
    }
    return out;
}

const NOTIF_KINDS = new Set([
    "message", "offer_sent", "offer_received", "offer_accepted",
    "offer_declined", "counter_offer", "sold", "review",
]);

export function sanitizeNotifs(blob: unknown): Notif[] {
    const arr = (blob && typeof blob === "object" && Array.isArray((blob as any).items)) ? (blob as any).items : [];
    const out: Notif[] = [];
    for (const raw of arr) {
        if (!raw || typeof raw !== "object") continue;
        const b = raw as Record<string, unknown>;
        const id = cleanStr(b.id, 40);
        if (!id) continue;
        out.push({
            id,
            kind: NOTIF_KINDS.has(b.kind as string) ? (b.kind as NotifKind) : "message",
            listingId: b.listingId ? cleanStr(b.listingId, 40) : undefined,
            threadId: b.threadId ? cleanStr(b.threadId, 90) : undefined,
            offerId: b.offerId ? cleanStr(b.offerId, 40) : undefined,
            title: cleanStr(b.title, 120),
            body: cleanStr(b.body, 200),
            createdAt: clampNum(b.createdAt, 0, Date.now() + 86400000, Date.now()),
            read: b.read === true,
        });
        if (out.length >= CAPS.notifs) break;
    }
    return out;
}

export function toBlob<T>(items: T[]): Record<string, unknown> {
    return { items: items as unknown[] };
}*/
