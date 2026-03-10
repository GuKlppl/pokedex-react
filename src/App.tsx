import { useEffect , useState } from "react";
import "./App.css";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Home from "./pages/Home/Home";
import Details from "./pages/Details/Details";

function App() {
    const [searchTerm, setSearchTerm] = useState("");
    const navigate = useNavigate(); 
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

    //Resetar e Navegar
    const handleLogoClick = () => {
        setSearchTerm("");
        navigate("/");
    }

    //Limpar o Shiny quando voltar para Home
    useEffect(() => {
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


    //Função para busca
    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);

        if (value.length > 0 && location.pathname !== "/") {
            navigate("/");
        }
    }

    const toggleDarkMode = () => setIsDarkMode(!isDarkMode);

    const styles = {
        header: {
            backgroundColor: isDarkMode ? "#1a1a1a" : "#ef5350",
            borderBottom: isDarkMode ? "4px solid #333" : "4px solid #cc0000",
        },
        title: {
            color: "#ffffff", // Agora o título pode ser sempre branco para contrastar com o vermelho/preto
        }
    }

    return (
        <div className={`app-container ${isDarkMode ? "dark" : "light"}`}>
            {/* HEADER GLOBAL */}
            <header className="header-global" style={{ backgroundColor: isDarkMode ? "rgba(26, 26, 26, 0.8)" : "rgba(239, 83, 80, 0.8)" }}>

                {/* Esquerda: Favoritos*/}
                <div className="nav-group.left">
                    <button onClick={() => navigate("/favorites")} className="fav-button">
                        ⭐ <span className="hide-mobile">Favoritos</span>
                    </button>
                </div>

                {/* CENTRO: Título e Busca*/}
                <div className="header-center-content">
                    <h1 className="header-title" onClick={handleLogoClick}>
                        <span style={{ color: '#ffffff' }}>Poké</span>
                        <span style={{ color: isDarkMode ? "#393053" : '#ffcb05' }}>Dex</span>
                    </h1>

                    <div className="search-container-header">
                        <input
                            type="text"
                            placeholder="Pesquisar Pokémon..."
                            value={searchTerm}
                            onChange={handleSearchChange}
                            style={{
                                padding: '10px 15px',
                                borderRadius: '25px',
                                border: 'none',
                                backgroundColor: isDarkMode ? '#393053' : '#ffffff',
                                color: isDarkMode ? '#fff' : '#333',
                                width: '250px',
                                outline: 'none',
                                transition: 'all 0.3s ease',
                                boxShadow: '0 4px 10px rgba(0,0,0,0.1)'
                            }}
                        />
                    </div>
                </div>

                {/* Direita: Dark Mode */}
                <div className="nav-group.right">
                    <button onClick={toggleDarkMode} className="theme-toggle-btn">
                        {isDarkMode ? "☀️" : "🌙"}
                    </button>
                </div>
            </header>

            <main style={styles.mainContent}>
                <Routes>
                    {/* Passando searchTerm para a Home filtrar a lista */}
                    <Route path="/" element={<Home isDarkMode={isDarkMode} isShiny={isShiny} searchTerm={searchTerm} />} />
                    <Route path="/pokemon/:name" element={<Details isDarkMode={isDarkMode} isShiny={isShiny} setIsShiny={setIsShiny} setSearchTerm={setSearchTerm} />} />
                </Routes>
            </main>
        </div>
    );
};


export default App;
