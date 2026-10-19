"use client";

import { useEffect, useState } from "react";

const SCREEN_WIDTH_BREAKPOINT = 1024;
const SCREEN_HEIGHT_BREAKPOINT = 700;

export default function useScreenSize() {
  const [isSmallScreen, setIsSmallScreen] = useState(false);

  useEffect(() => {
    const checkScreen = () => {
      setIsSmallScreen(
        window.innerWidth < SCREEN_WIDTH_BREAKPOINT ||
          window.innerHeight < SCREEN_HEIGHT_BREAKPOINT
      );
    };

    checkScreen();
    window.addEventListener("resize", checkScreen);

    return () => window.removeEventListener("resize", checkScreen);
  }, []);

  return isSmallScreen;
}
