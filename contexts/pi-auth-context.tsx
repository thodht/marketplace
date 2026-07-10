"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  type ReactNode,
  useCallback
} from "react";
import { PI_NETWORK_CONFIG, BACKEND_URLS } from "@/lib/system-config";
import { api, setApiAuthToken } from "@/lib/api";

type AuthResult = {
  accessToken: string;
  user: {
    uid: string;
    username: string;
  };
};

export type UserDTO = {
  uid: string, // An app-specific user identifier
  credentials: {
    scopes: string[], // a list of granted scopes
    valid_until: {
      timestamp: number,
      iso8601: string
    }
  },
  username?: string, // The user's Pi username. Requires the `username` scope.
}

interface PiAuthContextType {
  isAuthenticated: boolean;
  authMessage: string;
  hasError: boolean;
  piAccessToken: string | null;
  userData: UserDTO | null;
  error: string | null;
  reinitialize: () => Promise<void>;
}

export type PaymentData = {
  amount: number,
  memo: string,
  metadata: Object,
};

const COMMUNICATION_REQUEST_TYPE = '@pi:app:sdk:communication_information_request';
const DEFAULT_ERROR_MESSAGE = 'Failed to authenticate or login. Please refresh and try again.';

function isInIframe(): boolean {
  try {
    return window.self !== window.top;
  } catch (error) {
    // Cross-origin access may throw when in an iframe
    if (
      error instanceof DOMException &&
      (error.name === 'SecurityError' || error.code === DOMException.SECURITY_ERR || error.code === 18)
    ) {
      return true;
    }
    // Firefox may throw generic Permission denied errors
    if (error instanceof Error && /Permission denied/i.test(error.message)) {
      return true;
    }

    throw error;
  }
}

function parseJsonSafely(value: any): any {
  if (typeof value === 'string') {
    try {
      return JSON.parse(value);
    } catch (error) {
      return null;
    }
  }
  return typeof value === 'object' && value !== null ? value : null;
}

const loadPiSDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    const script = document.createElement("script");
    if (!PI_NETWORK_CONFIG.SDK_URL) {
      throw new Error("SDK URL is not set");
    }
    script.src = PI_NETWORK_CONFIG.SDK_URL;
    script.async = true;

    script.onload = () => {
      console.log("✅ Pi SDK script loaded successfully");
      resolve();
    };

    script.onerror = () => {
      console.error("❌ Failed to load Pi SDK script");
      reject(new Error("Failed to load Pi SDK script"));
    };

    document.head.appendChild(script);
  });
};

/**
 * Requests authentication credentials from the parent window (App Studio) via postMessage.
 * Returns null if not in iframe, timeout, or missing token (non-fatal check).
 *
 * @returns {Promise<{accessToken: string, appId: string}|null>} Resolves with credentials or null
 */
function requestParentCredentials(): Promise<{ accessToken: string; appId: string | null } | null> {
  // Early return if not in an iframe
  if (!isInIframe()) {
    return Promise.resolve(null);
  }

  const requestId = `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  const timeoutMs = 1500;

  return new Promise((resolve) => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null;

    // Cleanup function to remove listener and clear timeout
    const cleanup = (listener: (event: MessageEvent) => void) => {
      window.removeEventListener('message', listener);
      if (timeoutId !== null) {
        clearTimeout(timeoutId);
      }
    };

    const messageListener = (event: MessageEvent) => {
      // Security: only accept messages from parent window
      if (event.source !== window.parent) {
        return;
      }

      // Validate message type and request ID match
      const data = parseJsonSafely(event.data);
      if (!data || data.type !== COMMUNICATION_REQUEST_TYPE || data.id !== requestId) {
        return;
      }

      cleanup(messageListener);

      // Extract credentials from response payload
      const payload = typeof data.payload === 'object' && data.payload !== null ? data.payload : {};
      const accessToken = typeof payload.accessToken === 'string' ? payload.accessToken : null;
      const appId = typeof payload.appId === 'string' ? payload.appId : null;

      // Return credentials or null if missing token
      resolve(accessToken ? { accessToken, appId } : null);
    };

    // Set timeout handler (resolve with null on timeout)
    timeoutId = setTimeout(() => {
      cleanup(messageListener);
      resolve(null);
    }, timeoutMs);

    // Register listener before sending request to avoid race condition
    window.addEventListener('message', messageListener);

    // Send request to parent window to get credentials
    window.parent.postMessage(
      JSON.stringify({
        type: COMMUNICATION_REQUEST_TYPE,
        id: requestId
      }),
      '*'
    );
  });
}

const PiAuthContext = createContext<PiAuthContextType | undefined>(undefined);

export function PiAuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const isAuthenticating = useRef(false);
  const [authMessage, setAuthMessage] = useState("Initializing Pi Network...");
  const [hasError, setHasError] = useState(false);
  const [piAccessToken, setPiAccessToken] = useState<string | null>(null);
  const [userData, setUserData] = useState<UserDTO | null>(null);
  const [error, setError] = useState<string | null>(null);

  const authenticateAndLogin = async (accessToken: string): Promise<void> => {
    // FIX: Guard against double-firing in React Strict Mode / Re-renders
    if (isAuthenticating.current) {
      console.log("Authentication handshake already in progress. Skipping duplicate invoke.");
      return;
    }

    if (accessToken) {
      setPiAccessToken(accessToken);
      setApiAuthToken(accessToken);
    }

    // Prepare headers
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${accessToken}`
    };
    let init: RequestInit = { headers };

    try {
      // FIX: Pass the raw Promise (remove 'await' from api.get) so Promise.race works properly
      const loginPromise = api.get<UserDTO>(BACKEND_URLS.LOGIN, init);
      const timeoutPromise = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("Backend login request timed out")), 10000));
      const loginRes = await Promise.race([loginPromise, timeoutPromise]);
      setUserData(loginRes.data);
    } catch (backendError) {
      //console.error("Backend login verification failed:", backendError);
      throw backendError; // Re-throw so parent block can handle/alert it cleanly
    } finally {
      // ALWAYS RELEASE THE LOCK: Clean up execution reference so login can be attempted again if failed
      isAuthenticating.current = false;
    }
  };

  const handleIncompletePayment = useCallback((payment: any) => {
    console.log("Incomplete payment found:", payment);
  }, []);

  const authenticateViaPiSdk = async (): Promise<void> => {
    // FIX: Guard against double-firing in React Strict Mode / Re-renders
    if (isAuthenticating.current) {
      console.log("Authentication handshake already in progress. Skipping duplicate invoke.");
      return;
    }

    if (typeof window.Pi === "undefined") {
      isAuthenticating.current = false;
      throw new Error("SDK failed to load: Pi object not available");
    }

    try {
      window.Pi.init({
        version: '2.0',
        sandbox: PI_NETWORK_CONFIG.SANDBOX,
      });

      // Safe structural operational buffer for mobile layouts
      await new Promise((resolve) => setTimeout(resolve, 500));

      setAuthMessage("Authenticating with Pi Network...");

      let piAuthResult = await window.Pi.authenticate(["username"], handleIncompletePayment);

      if (!piAuthResult?.accessToken) {
        isAuthenticating.current = false;
        throw new Error(DEFAULT_ERROR_MESSAGE);
      }

      await authenticateAndLogin(piAuthResult.accessToken);
      setAuthMessage("Authenticated successfully!");

    } catch (error: any) {
      const msg = typeof error === 'string' ? error : (error?.message || "Unknown structure");
      alert("Pi Auth True Error: " + msg);
    } finally {
      // FIX: Always release the execution lock when done or failed
      isAuthenticating.current = false;
    }
    isAuthenticating.current = false;
  };

  const initializePiAndAuthenticate = async () => {
    // 1. CRITICAL GUARD: Stop execution if an authentication thread is already processing
    if (isAuthenticating.current) {
      console.log("Initialization already handling a concurrent pipeline execution. Blocking loop.");
      return;
    }

    // 2. Batch baseline states
    setError(null);
    setHasError(false);

    // Wrap the initialization inside a delayed tick to allow Next.js DOM structures to settle.
    // By keeping the tracking reference set to true immediately above, subsequent re-renders during this 
    // 1000ms window will safely bounce off the guard block.
    setTimeout(async () => {
      try {
        //setAuthMessage("Probing environment configurations...");
        //await new Promise((resolve) => setTimeout(resolve, 1000));
        const parentCredentials = await requestParentCredentials();

        if (parentCredentials) {
          // authenticateAndLogin is internally guarded now, but we await its pipeline resolution here
          await authenticateAndLogin(parentCredentials.accessToken);
        } else {
          if (typeof window.Pi === "undefined") {
            //setAuthMessage("Loading Pi Network JavaScript asset from CDN...");
            await loadPiSDK();
          }

          if (typeof window.Pi === "undefined") {
            throw new Error("SDK failed to load: Pi object not available after script load");
          }

          // Directly invoke the core handshake sequence (remove duplicate checks if already managed inside authenticateViaPiSdk)
          await authenticateViaPiSdk();
        }

        // Force a brief pause so users can see success logs on screen before the layout structure switches
        await new Promise((resolve) => setTimeout(resolve, 500));

        ;
        setIsAuthenticated(true);
        setHasError(false);
      } catch (err: any) {
        console.error("❌ Pi Network initialization failed:", err);
        setHasError(true);
        const errorMessage = err?.message || "An unexpected configuration error occurred.";
        setAuthMessage(errorMessage);
        setError(errorMessage);
      } finally {
        // 3. ALWAYS RELEASE THE LOCK: Clean up execution reference so login can be attempted again if failed
        isAuthenticating.current = false;
      }
    }, 1000);
    isAuthenticating.current = false;
  };

  useEffect(() => { initializePiAndAuthenticate(); }, []);

  const value: PiAuthContextType = {
    isAuthenticated,
    authMessage,
    hasError,
    piAccessToken,
    userData,
    error,
    reinitialize: initializePiAndAuthenticate,
  };

  return (
    <PiAuthContext.Provider value={value}>{children}</PiAuthContext.Provider>
  );
}

/**
 * Hook to access Pi Network authentication state and user data
 *
 * Must be used within a component wrapped by PiAuthProvider.
 * Provides read-only access to authentication state and user data.
 *
 * @returns {PiAuthContextType} Authentication state and methods
 * @throws {Error} If used outside of PiAuthProvider
 *
 * @example
 * const { piAccessToken, userData, isAuthenticated, reinitialize } = usePiAuth();
 */
export function usePiAuth() {
  const context = useContext(PiAuthContext);
  if (context === undefined) {
    throw new Error("usePiAuth must be used within a PiAuthProvider");
  }
  return context;
}
