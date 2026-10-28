import { createContext, useContext, useEffect, useState } from "react";

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("connectify_theme") || "dark";
  });

  const [soundEnabled, setSoundEnabled] = useState(() => {
    const saved = localStorage.getItem("connectify_sound_enabled");
    return saved !== null ? JSON.parse(saved) : true;
  });

  useEffect(() => {
    localStorage.setItem("connectify_theme", theme);
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
      root.classList.remove("light");
    } else {
      root.classList.add("light");
      root.classList.remove("dark");
    }
  }, [theme]);

  useEffect(() => {
    localStorage.setItem("connectify_sound_enabled", JSON.stringify(soundEnabled));
  }, [soundEnabled]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  const toggleSound = () => {
    setSoundEnabled((prev) => !prev);
  };

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme, soundEnabled, toggleSound }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
};
