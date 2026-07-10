// Tells TypeScript that window.Pi exists globally via the loaded script
export { }; // Crucial: makes the file a module so 'declare global' works
declare global {
    interface Window {
        Pi?: {
            init: (config: { version: string; sandbox: boolean }) => void;
            authenticate: (scopes: string[], onIncompletePaymentFound: (payment: any) => void) => Promise<PiAuthResult>;
        };
    }
}