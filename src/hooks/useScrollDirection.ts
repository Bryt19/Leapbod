import { useState, useEffect, useCallback } from "react";

export function useScrollDirection() {
  const [scrollDirection, setScrollDirection] = useState<"up" | "down" | null>(
    null
  );
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    let lastScrollY = window.scrollY;
    let ticking = false;

    const updateScrollDirection = () => {
      const scrollY = window.scrollY;

      // Check if user has scrolled at all
      setIsScrolled(scrollY > 0);

      // Only update direction if we've scrolled enough to matter
      if (Math.abs(scrollY - lastScrollY) < 5) {
        ticking = false;
        return;
      }

      if (scrollY > lastScrollY && scrollY > 100) {
        // Scrolling down
        setScrollDirection("down");
      } else if (scrollY < lastScrollY) {
        // Scrolling up
        setScrollDirection("up");
      }

      lastScrollY = scrollY > 0 ? scrollY : 0;
      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(updateScrollDirection);
        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, { passive: true });

    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return { scrollDirection, isScrolled };
}
