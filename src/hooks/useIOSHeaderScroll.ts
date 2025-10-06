import {RefObject, useState, useEffect, useRef} from "react";

export function useIOSHeaderScroll(titleRef: RefObject<HTMLSpanElement | null>) {
  const [isHeaderVisible, setIsHeaderVisible] = useState(false);
  const headerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!titleRef.current || !headerRef.current) return;

      const titleRect = titleRef.current.getBoundingClientRect();
      const headerRect = headerRef.current.getBoundingClientRect();

      // Détecter quand la baseline du texte (bas du span) franchit le bas du header
      setIsHeaderVisible(titleRect.bottom < headerRect.bottom);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial state

    return () => window.removeEventListener('scroll', handleScroll);
  }, [titleRef]);

  return { isHeaderVisible, headerRef };
}
