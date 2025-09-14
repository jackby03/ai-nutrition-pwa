// PWA utilities for AI Nutrition PWA
// next-pwa handles service worker registration automatically

export function isStandalone(): boolean {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone === true;
}

export function canInstallPWA(): boolean {
  return 'serviceWorker' in navigator && 'PushManager' in window;
}

export function getInstallPrompt() {
  // This will be set by the beforeinstallprompt event
  return (window as any).deferredPrompt;
}

export function showInstallPrompt() {
  const deferredPrompt = getInstallPrompt();
  if (deferredPrompt) {
    deferredPrompt.prompt();
    return deferredPrompt.userChoice;
  }
  return Promise.resolve({ outcome: 'dismissed' });
}