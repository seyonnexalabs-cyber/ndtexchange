import { useState, useEffect } from 'react';

const MOBILE_BREAKPOINT = 768;

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false); // Default to false

  useEffect(() => {
    // This effect only runs on the client
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT);
    };

    checkIsMobile(); // Initial check
    window.addEventListener('resize', checkIsMobile); // Listen for changes

    return () => {
      window.removeEventListener('resize', checkIsMobile);
    };
  }, []); // Empty dependency array ensures it runs only once on mount

  return isMobile;
}
