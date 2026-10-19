import { Monaco } from "@monaco-editor/react";
import { create } from "zustand";
import { CodeEditorState } from "./../types/index";

const getInitialState = () => {
    // if we're on the server, return default values
    if (typeof window === "undefined") {
        return {
            language: "javascript",
            fontSize: 16,
            theme: "vs-dark",
        };
    }

    // if we're on the client, return values from local storage bc localStorage is a browser API.
    const savedLanguage = localStorage.getItem("editor-language") || "javascript";
    const savedTheme = localStorage.getItem("editor-theme") || "vs-dark";
    const savedFontSize = localStorage.getItem("editor-font-size") || 16;

    return {
        language: savedLanguage,
        theme: savedTheme,
        fontSize: Number(savedFontSize),
    };
};

export const useCodeEditorStore = create<CodeEditorState>((set, get) => {
    const initialState = getInitialState();

    return {
        ...initialState,
        output: "",
        isRunning: false,
        error: null,
        editor: null,
        executionResult: null,

        getCode: () => get().editor?.getValue() || "",

        setEditor: (editor: Monaco) => {
            const savedCode = localStorage.getItem(`editor-code-${get().language}`);
            if (savedCode) editor.setValue(savedCode);

            set({ editor });
        },

        setTheme: (theme: string) => {
            localStorage.setItem("editor-theme", theme);
            set({ theme });
        },

        setFontSize: (fontSize: number) => {
            localStorage.setItem("editor-font-size", fontSize.toString());
            set({ fontSize });
        },

        setLanguage: (language: string) => {
            // Save current language code before switching
            const currentCode = get().editor?.getValue();
            if (currentCode) {
                localStorage.setItem(`editor-code-${get().language}`, currentCode);
            }

            localStorage.setItem("editor-language", language);

            set({
                language,
                output: "",
                error: null,
            });
        },

        runCode: async () => {
            const { language, getCode } = get();
            const code = getCode();

            if (!code) {
                set({ error: "Please enter some code" });
                return;
            }

            set({ isRunning: true, error: null, output: "" });

            try {
                // Simulate a brief delay for realistic UX
                await new Promise(resolve => setTimeout(resolve, 500));

                const infoMessage = `Code Execution Temporarily Unavailable

The code execution feature is currently unavailable because the third-party execution service (Piston API) has restricted public access.

All other platform features remain fully functional, including:
• Code editor and syntax highlighting
• Multi-language support
• Theme customization
• Snippet creation and sharing
• User authentication
• Bookmarks and comments
• Subscription and payment features`;

                set({
                    error: infoMessage,
                    executionResult: { code, output: "", error: infoMessage }
                });
            } catch (error) {
                console.log("Error running code:", error);
                set({
                    error: "Error running code",
                    executionResult: { code, output: "", error: "Error running code" },
                });
            } finally {
                set({ isRunning: false });
            }
        },
    };
});

export const getExecutionResult = () => useCodeEditorStore.getState().executionResult;