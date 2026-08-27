import { useState, useEffect } from 'react';

const PWAInstallButton = ({ variant = 'button' }) => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isSafari, setIsSafari] = useState(false);

  useEffect(() => {
    // Already installed / running standalone? Nothing to offer.
    const isStandalone =
      window.matchMedia?.('(display-mode: standalone)').matches ||
      window.navigator.standalone === true; // iOS Safari's own flag

    if (isStandalone) return;

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    // Check if we're on Safari (desktop or iOS)
    const safariCheck = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    setIsSafari(safariCheck);

    // Safari (iOS and desktop) never fires `beforeinstallprompt`, so it
    // has no other way to know an install is possible — show the button
    // up front and let handleInstallClick's manual instructions do the
    // rest. Other browsers still wait for the real prompt event below.
    if (isIOS || safariCheck) {
      setIsVisible(true);
    }

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

  const label = isSafari ? 'Add to Home' : 'Install App';

  if (variant === 'navitem') {
    return (
      <div
        className="amb-nav-item"
        onClick={handleInstallClick}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleInstallClick(); }}
      >
        <span className="amb-nav-icon"><i className="fas fa-plus-square" /></span>
        <span className="amb-nav-label">{isSafari ? 'Add Home' : 'Install'}</span>
      </div>
    );
  }

  return (
    <div
      id="pwaButton"
      onClick={handleInstallClick}
      style={{ display: 'inline-flex',
         margin:'10px 10px',
         padding:'5px 10px', borderRadius:'5px', color:'#fff',
         alignItems: 'center', cursor: 'pointer', 
         border: '1px solid #b5b5b524',
         backgroundColor:'black', fontSize:'14px' }}
      className="pwa-install-button" // Add your own styles
    >
      <i className="fas fa-plus-square" style={{marginRight:'5px'}}></i>
      {' ' + label}
    </div>
  );
};

export default PWAInstallButton;