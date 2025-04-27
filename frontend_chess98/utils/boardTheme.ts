export function getBoardColors(theme: string): {
    light: string;
    dark: string;
    moveHighlight: string;
    selectedHighlight: string;
    checkHighlight: string;
    highlightedSquare: string;
  } {
    const themes: Record<string, {
      light: string;
      dark: string;
      moveHighlight: string;
      selectedHighlight: string;
      checkHighlight: string;
      highlightedSquare: string;
    }> = {
      default: {
        light: "#cbd5e0",
        dark: "#4a5568",
        moveHighlight: "rgba(255, 255, 0, 0.4)", // amarillo
        selectedHighlight: "rgba(0, 191, 255, 0.5)", // celeste fuerte
        checkHighlight: "rgba(255, 0, 0, 0.7)", // rojo fuerte
        highlightedSquare: "rgba(255, 0, 0, 0.3)", // dorado
      },
      wood: {
        light: "#f0d9b5",
        dark: "#b58863",
        moveHighlight: "rgba(0, 128, 255, 0.4)", // azul fuerte
        selectedHighlight: "rgba(0, 0, 255, 0.4)", // azul puro
        checkHighlight: "rgba(255, 0, 0, 0.7)", // rojo fuerte
        highlightedSquare: "rgba(255, 0, 0, 0.3)",
      },
      green: {
        light: "#e0f3d6",
        dark: "#5b8c5a",
        moveHighlight: "rgba(255, 140, 0, 0.4)", // naranja
        selectedHighlight: "rgba(0, 0, 255, 0.4)", // azul
        checkHighlight: "rgba(255, 0, 0, 0.7)", // rojo
        highlightedSquare: "rgba(255, 0, 0, 0.3)",
      },
      blue: {
        light: "#cfeeff",
        dark: "#0077b6",
        moveHighlight: "rgba(255, 215, 0, 0.5)", // dorado brillante
        selectedHighlight: "rgba(50, 205, 50, 0.5)", // verde lima
        checkHighlight: "rgba(255, 69, 0, 0.7)", // rojo anaranjado
        highlightedSquare: "rgba(255, 0, 0, 0.3)", 
      },
      marble: {
        light: "#ececec",
        dark: "#8e8e8e",
        moveHighlight: "rgba(0, 191, 255, 0.4)", // azul celeste
        selectedHighlight: "rgba(0, 0, 255, 0.4)", // azul
        checkHighlight: "rgba(255, 0, 0, 0.7)", // rojo brillante
        highlightedSquare: "rgba(255, 0, 0, 0.3)", 
      },
      simple: {
        light: "#f5f5f5",
        dark: "#444444",
        moveHighlight: "rgba(0, 191, 255, 0.4)", // azul celeste
        selectedHighlight: "rgba(255, 140, 0, 0.4)", // naranja intenso
        checkHighlight: "rgba(255, 0, 0, 0.7)", // rojo vivo
        highlightedSquare: "rgba(255, 0, 0, 0.3)",
      },
    };
  
    return themes[theme] || themes["default"];
  }
  