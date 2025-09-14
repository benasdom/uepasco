import { useState, useEffect } from 'react';

const PWAInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Check if we're on Safari
    const safariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safariCheck);

    const beforeInstallHandler = (e) => {
      // Prevent the mini-infobar from appearing on mobile
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show the install button
      setIsVisible(true);
    };

    const appInstalledHandler = () => {
      // Hide the install button
      setIsVisible(false);
      // Clear the deferredPrompt variable
      setDeferredPrompt(null);
      console.log('PWA was installed');
    };

    // Add event listeners
    window.addEventListener('beforeinstallprompt', beforeInstallHandler);
    window.addEventListener('appinstalled', appInstalledHandler);

    // Cleanup
    return () => {
      window.removeEventListener('beforeinstallprompt', beforeInstallHandler);
      window.removeEventListener('appinstalled', appInstalledHandler);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      // Show the install prompt
      deferredPrompt.prompt();
      // Wait for the user to respond to the prompt
      const { outcome } = await deferredPrompt.userChoice;
      // We've used the prompt, and can't use it again, throw it away
      setDeferredPrompt(null);
      // Hide the install button
      setIsVisible(false);
      
      console.log(`User response to the install prompt: ${outcome}`);
    } else {
      // Handle Safari or other browsers that don't support beforeinstallprompt
      if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
        alert('To install this app on iOS, tap the share icon and then "Add to Home Screen".');
      } else if (/Android/.test(navigator.userAgent)) {
        alert('To install this app on Android, use the menu option in your browser to "Add to Home Screen".');
      } else {
        alert('To install this app, look for an "Add to Home Screen" option in your browser\'s menu.');
      }
    }
  };

  // Don't render the button if it's not visible
  if (!isVisible) {
    return null;
  }

  return (
    <button
      id="pwaButton"
      onClick={handleInstallClick}
      style={{ display: 'inline-flex' }}
      className="pwa-install-button" // Add your own styles
    >
      <i className="fas fa-plus-square"></i>
      {isSafari ? ' Add to Home Screen' : ' Install App'}
    </button>
  );
};

export default PWAInstallButton;