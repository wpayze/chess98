export function getBoardColors(theme: string): {
    light: string;
    dark: string;
} {
    const themes: Record<string, { light: string; dark: string }> = {
        default: {
            light: "#cbd5e0",
            dark: "#4a5568",
        },
        wood: {
            light: "#f0d9b5",
            dark: "#b58863",
        },
        green: {
            light: "#e0f3d6",
            dark: "#5b8c5a",
        },
        blue: {
            light: "#cfeeff",
            dark: "#0077b6",
        },
        marble: {
            light: "#ececec",
            dark: "#8e8e8e",
        },
        simple: {
            light: "#f5f5f5",
            dark: "#444",
        },
    };

    return themes[theme] || themes["default"];
}