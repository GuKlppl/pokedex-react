import { useEffect, useMemo, useState } from "react";
import axios from "axios";
import PokemonCard from "../../components/PokemonCard/PokemonCard";

import type { PokemonListItem } from "../types/Pokemon";
import { useSearchParams } from "react-router-dom";
import { getTypeColor } from "../../utils/pokemonUtils";

interface HomeProps {
    isDarkMode: boolean;
    isShiny: boolean;
}
function Home({ isDarkMode, isShiny, searchTerm }: HomeProps) {
    const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);
    const [search, setSearch] = useState("");
    const [searchParams, setSearchParams] = useSearchParams();
    const [showTopBtn, setShowTopBtn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [showOnlyFavorites, setShowOnlyFavorites] = useState(false);

    const typeFilter = searchParams.get("search");

    /*Botão de Voltar ao topo*/
    useEffect(() => {
        const handleScrollButton = () => {
            setShowTopBtn(window.scrollY > 400);
        };

        window.addEventListener("scroll", handleScrollButton);


        return () => window.removeEventListener("scroll", handleScrollButton);
    }, []);

    useEffect(() => {
        const handleScroll = () => {
            localStorage.setItem("pokedex_scroll_pos", window.scrollY.toString());
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll)
    }, []);

    useEffect(() => {
        if (pokemons.length > 0) {
            const savedScrollPos = localStorage.getItem("pokedex_scroll_pos");
            if (savedScrollPos) {
                // Aumentamos para 300ms para dar tempo dos cards renderizarem o tamanho real
                const timeoutId = setTimeout(() => {
                    window.scrollTo({
                        top: parseInt(savedScrollPos),
                        behavior: "instant" // "instant" evita que a página fique "subindo" devagar
                    });
                }, 300);
                return () => clearTimeout(timeoutId);
            }
        }
    }, [pokemons]);


    useEffect(() => {
        setLoading(true);
        if (typeFilter) {
            axios
                .get(`https://pokeapi.co/api/v2/type/${typeFilter.toLowerCase()}`)
                .then((res) => {
                    const mappedPokemons = res.data.pokemon
                        .map((p: any) => p.pokemon)
                        .filter((pokemon: any) => {
                            const id = parseInt(pokemon.url.split("/").filter(Boolean).pop());
                            return id <= 151;
                        })
                    setPokemons(mappedPokemons);
                })
                .catch((err) => console.error("Erro ao buscar tipo:", err))
                .finally(() => setLoading(false))
        } else {
            axios
                .get<ApiResponse>("https://pokeapi.co/api/v2/pokemon?limit=151")
                .then((res) => setPokemons(res.data.results))
                .catch((err) => console.error("Erro ao buscar lista:", err))
                .finally(() => setLoading(false));
        }
    }, [typeFilter]);


    const filteredPokemons = useMemo(() => {
        let list = pokemons;

        if (showOnlyFavorites) {
            const favorites = JSON.parse(localStorage.getItem("pokedex_favorites") || "[]");
            list = list.filter(p => favorites.includes(p.name));
        }

        return list.filter((pokemon) =>
            pokemon.name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [pokemons, searchTerm, showOnlyFavorites]);

    if (loading) return <skeleton />;

    if (filteredPokemons.length === 0 && searchTerm !== "") {
        return <p>Nenhum pokemon encontrado com "{searchTerm}"</p>;
    }

    return (
        <div style={{
            ...styles.container,
            backgroundColor: isDarkMode ? "#121212" : "#f8f9fa",
            color: isDarkMode ? "#fff" : "#333",
            padding: '20px',
            minHeight: '100vh',
            transition: 'background-color 0.3s ease'
        }}>



            {/* Informações de Filtro e Contador */}
            <div style={{ maxWidth: '1200px', margin: '0 auto 20px auto', width: '100%' }}>
                {typeFilter && (
                    <div style={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        padding: "12px 20px",
                        borderRadius: "15px",
                        marginBottom: "15px",
                        backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
                        border: isDarkMode ? "1px solid #333" : "1px solid #eee",
                        boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
                    }}>
                        <p style={{ margin: 0, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '10px' }}>
                            Filtrando por:
                            <span style={{
                                backgroundColor: getTypeColor(typeFilter),
                                color: '#fff',
                                padding: "4px 15px",
                                borderRadius: "20px",
                                fontSize: "0.8rem",
                                textTransform: 'uppercase'
                            }}>
                                {typeFilter}
                            </span>
                        </p>
                        <button
                            onClick={() => setSearchParams({})}
                            style={{
                                cursor: "pointer",
                                padding: "6px 15px",
                                borderRadius: "10px",
                                border: "none",
                                backgroundColor: "#ff475722",
                                color: "#ff4757",
                                fontWeight: "bold",
                                transition: "all 0.2s"
                            }}
                        >
                            Limpar X
                        </button>
                    </div>
                )}

                <p style={{ fontSize: '0.85rem', opacity: 0.6, fontWeight: 'bold' }}>
                    {filteredPokemons.length === 0 ? "Nenhum resultado" : `Exibindo ${filteredPokemons.length} Pokémon`}
                </p>
            </div>

            {/* Grid de Pokémon */}
            <div style={styles.grid}>
                {loading ? (
                    //Renderiza 12 cards vazios enquanto carrega
                    Array.from({ length: 12 }).map((_, index) => (
                        <div key={index} style={{
                            ...styles.card,
                            backgroundColor: isDarkMode ? '#1e1e1e' : '#ffffff',
                            height: '100px', // Altura aproximada do seu card
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            opacity: 0.7
                        }}>
                            <div className="skeleton-pulse" style={{
                                width: '60px',
                                height: '60px',
                                borderRadius: '50%',
                                backgroundColor: isDarkMode ? '#333' : '#eee'
                            }} />
                            <div style={{ marginLeft: '15px', flex: 1 }}>
                                <div className="skeleton-pulse" style={{ width: '80%', height: '12px', backgroundColor: isDarkMode ? '#333' : '#eee', borderRadius: '4px', marginBottom: '8px' }} />
                                <div className="skeleton-pulse" style={{ width: '50%', height: '12px', backgroundColor: isDarkMode ? '#333' : '#eee', borderRadius: '4px' }} />
                            </div>
                        </div>
                    ))
                ) : (
                    // Quando termina de carregar, mostra os Pokémons reais
                    filteredPokemons.map((pokemon) => (
                        <PokemonCard
                            key={pokemon.name}
                            name={pokemon.name}
                            url={pokemon.url}
                        />
                    ))
                )};
            </div>

            {/* Botão Voltar ao Topo */}
            {showTopBtn && (
                <button
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    style={{
                        position: 'fixed',
                        bottom: '30px',
                        right: "30px",
                        width: "55px",
                        height: '55px',
                        borderRadius: '50%',
                        backgroundColor: "#ff4757",
                        color: '#fff',
                        border: 'none',
                        cursor: 'pointer',
                        boxShadow: '0 8px 20px rgba(255, 71, 87, 0.4)',
                        fontSize: '24px',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'transform 0.2s'
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                >
                    ↑
                </button>
            )}

            {/* Mensagem de Erro (Busca Vazia) */}
            {filteredPokemons.length === 0 && (
                <div style={{ textAlign: 'center', padding: '100px 20px', opacity: 0.5 }}>
                    <span style={{ fontSize: '3rem' }}>🔍</span>
                    <p style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>Nenhum Pokémon encontrado com "{search}"</p>
                </div>
            )}

        </div>
    );
}




const styles = {
    container: {
        padding: "2rem",
        fontFamily: "'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
        maxWidth: "1200px",
        margin: "0 auto",
    },
    title: {
        textAlign: "center" as const,
        fontSize: "2.5rem",
        marginBottom: "1.5rem",
        color: "#333",
    },
    searchContainer: {
        display: "flex",
        justifyContent: "center",
        marginBottom: "2rem",
    },
    searchInput: {
          padding: "0.8rem 1.5rem",
         width: "100%",
         maxWidth: "500px",
        border: "2px solid #ddd",
        fontSize: "1rem",
        outline: "none",
        boxShadow:"0 4px 6px rgba(0,0,0,0.05)",
    },
    filterHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "15px",
        backgroundColor: "#f8f9fa",
        padding: "1rem",
        borderRadius: "12px",
        marginBottom: "2rem",
        border: "1px solid #eee",
    },
     clearButton: {
       padding: "8px 16px",
       cursor: "pointer",
       borderRadius: "20px",
      border: "none",
       backgroundColor: "#ff4444",
      color: "white",
      fontWeight: "bold" as const,
      fontSize: "0.8rem",
      transition: "background-color 0.2s",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
      gap: "1.5rem",
      padding: "10px"
    },
};

export default Home;
 