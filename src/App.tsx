import { useEffect , useState } from "react";
import "./App.css";
import { Routes, Route, useLocation } from "react-router-dom";
import Home from "./pages/Home.tsx";
import Details from "./pages/Details.tsx";;

function App() {

    const location = useLocation();

    // DarkMode do LocalStorage
    const [isDarkMode, setIsDarkMode] = useState(() => {
        return localStorage.getItem("pokedex_dark_mode") === "true";
    });

    // Versao Shiny do LocalStorage
    const [isShiny, setIsShiny] = useState(() => {
        const saved = localStorage.getItem("temp_shiny_mode");
        return saved === 'true';
    });


    useEffect(() => {
        // Se o usuário navegou para a Home (rota "/"), limpamos o Shiny
        if (location.pathname === "/") {
            setIsShiny(false);
            localStorage.removeItem("temp_shiny_mode");
        }
    }, [location.pathname, setIsShiny]);

    // Efeito para salvar DarkMode
    useEffect(() => {
        localStorage.setItem("pokedex_dark_mode", isDarkMode.toString());

        document.body.style.backgroundColor = isDarkMode ? "#121212" : "#ffffff";
        document.body.style.color = isDarkMode ? "#ffffff" : "#000000"
    }, [isDarkMode]);

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const themeStyles = {
        backgroundColor: isDarkMode ? "#121212" : "#ffffff",
        color: isDarkMode ? "#ffffff" : "#000000",
        minHeight: "100vh",
        transition: "background-color 0.3s ease, color 0.3s ease",
    };

    return (
        <div style={themeStyles}>
            <div style={styles.buttonContainer}>
                <button onClick={toggleDarkMode} style={styles.themeButton}>
                    {isDarkMode ? "☀️" : "🌙"}
                </button>
            
            </div>

            <Routes>
                <Route path="/" element={<Home isDarkMode={isDarkMode} isShiny={isShiny} />} />
                <Route path="/pokemon/:name" element={<Details isDarkMode={isDarkMode} isShiny={isShiny} setIsShiny={setIsShiny} />} />
            </Routes>
        </div>
    )
};

const styles = {
    themeButton: {
        position: "fixed" as const,
        top: "1rem",
        right: "1rem",
        zIndex: 1000,
        padding: "8px 16px",
        borderRadius: "20px",
        border: "none",
        cursor: "pointer",
        backgroundColor: "#333",
        color: "#fff",
        fontWeight: "bold" as const,
        boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
    },
};

export default App;
