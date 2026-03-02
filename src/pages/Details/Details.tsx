import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { PokemonDetails } from "../types/Pokemon";


interface DetailsProps {
    isDarkMode: boolean;
    isShiny: boolean;
    setIsShiny: (value: boolean) => void;
}


const SkeletonBlock = ({ width, height, borderRadius = "8px", margin = "0", style = {} }: any) => (
    <div
        className="skeleton-pulse"
        style={{
            width,
            height,
            borderRadius,
            margin,
            backgroundColor: "currentColor", // Ele vai herdar a cor do pai
            opacity: 0.1, // Damos a cor aqui
            ...style
        }}
    />
);
{/* Skeleton */ }
const DetailsSkeleton = ({ isDarkMode }: { isDarkMode: boolean }) => {
    const baseColor = isDarkMode ? "#ffffff" : "#000000";

    return (
        <div style={{ padding: "20px", maxWidth: "800px", margin: "0 auto", textAlign: "center", color: baseColor }}>

            {/* Link de Voltar */}
            <SkeletonBlock width="120px" height="15px" margin="0 0 30px 0" />

            {/* ID e Nome */}
            <SkeletonBlock width="60px" height="20px" margin="0 auto 10px" />
            <SkeletonBlock width="250px" height="45px" margin="0 auto 30px" />

            {/* Imagem Central e Setas */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", maxWidth: "400px", margin: "0 auto 40px" }}>
                <SkeletonBlock width="40px" height="40px" borderRadius="50%" />
                <SkeletonBlock width="180px" height="180px" borderRadius="50%" />
                <SkeletonBlock width="40px" height="40px" borderRadius="50%" />
            </div>

            {/*Tipos*/}
            <div style={{ display: "flex", justifyContent: "center", gap: "40px", margin: "20px 0" }}>
                {/* Skeleton Tipos */}
                <div>
                    <SkeletonBlock width="100px" height="40px" borderRadius="8px" />
                </div>
                {/* Skeleton Fraquezas */}
                <div style={{ display: "flex", gap: "8px" }}>
                    <SkeletonBlock width="60px" height="30px" borderRadius="6px" />
                    <SkeletonBlock width="60px" height="30px" borderRadius="6px" />
                </div>
            </div>


            {/* Botão Shiny */}
            <SkeletonBlock width="150px" height="40px" margin="0 auto 40px" borderRadius="10px" />

            {/* Grade de Status */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "15px", marginBottom: "40px" }}>
                {[...Array(6)].map((_, i) => (
                    <SkeletonBlock key={i} width="100%" height="70px" borderRadius="12px" />
                ))}
            </div>

            {/* Linha Evolutiva */}
            <SkeletonBlock width="180px" height="25px" margin="0 auto 20px" />
            <div style={{ display: "flex", justifyContent: "center", gap: "20px" }}>
                {[...Array(3)].map((_, i) => (
                    <SkeletonBlock key={i} width="80px" height="100px" borderRadius="10px" />
                ))}
            </div>

        </div>
    )
}

function Details({ isDarkMode, isShiny, setIsShiny }: DetailsProps) {
    //Hooks
    const { name } = useParams<{ name: string }>();
    const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
    const [viewMode, setViewMode] = useState<'modern' | 'legacy'>('modern');
    const [evolutions, setEvolutions] = useState<{ name: string, id: string }[]>([]);
    const [weaknesses, setWeaknesses] = useState<{ [key: string]: number }>({});
    const [loading, setLoading] = useState(true);
    const [isFavorite, setIsFavorite] = useState(false);
    const navigate = useNavigate();


    const styles = getStyles(isDarkMode);

    //Funções de Lógica 
    const playCry = () => {
        if (pokemon && pokemon.cries) {
            const audio = new Audio(pokemon.cries.latest);
            audio.volume = 0.05;
            audio.play().catch(err => console.error("Erro ao tocar som:", err));
        }
    };

    const navigateToPokemon = (newId: number) => {
        if (newId > 0) {
            navigate(`/pokemon/${newId}`);
        }
    }

    const currentId = pokemon?.id || 0;

    const handleToggleShiny = () => {
        const nextShiny = !isShiny;
        setIsShiny(nextShiny);
        localStorage.setItem("temp_shiny_mode", nextShiny.toString());
    };

    const handleTypeClick = (typeName: string) => {
        navigate(`/?search=${typeName.toLowerCase()}`);
    };

    const handleNext = () => {
        if (currentId >= 151) {
            navigate(`/pokemon/1`);
        } else {
            navigate(`/pokemon/${currentId + 1}`);
        }
    };

    const handlePrev = () => {
        if (currentId <= 1) {
            navigate(`/pokemon/151`);
        } else {
            navigate(`/pokemon/${currentId - 1}`);
        }
    }

    const toggleFavorite = () => {
        let favorites = JSON.parse(localStorage.getItem("pokedex_favorites") || "[]");

        if (favorites.includes(name)) {
            favorites = favorites.filter((fav: string) => fav !== name);
            setIsFavorite(false);
        } else {
            favorites.push(name);
            setIsFavorite(true);
        }

        localStorage.setItem("pokedex_favorites", JSON.stringify(favorites));
    }

    useEffect(() => {
        const favorites = JSON.parse(localStorage.getItem("pokedex_favorites") || "[]");
        setIsFavorite(favorites.includes(name));
    }, [name])

    useEffect(() => {
        setLoading(true);
        window.scrollTo(0, 0);

        axios
            .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then(async (res) => {
                setPokemon(res.data);

                const typePromises = res.data.types.map((t: any) => axios.get(t.type.url));
                const typeResponses = await Promise.all(typePromises);

                const damageRelations: { [key: string]: number } = {};

                typeResponses.forEach((typeRes: any) => {
                    const relations = typeRes.data.damage_relations;

                    //2x
                    relations.double_damage_from.forEach((t: any) => {
                        damageRelations[t.name] = (damageRelations[t.name] || 1) * 2;
                    });

                    //0.5x
                    relations.half_damage_from.forEach((t: any) => {
                        damageRelations[t.name] = (damageRelations[t.name] || 1) * 0.5;
                    });

                    relations.no_damage_from.forEach((t: any) => {
                        damageRelations[t.name] = 0;
                    });

                });

                // Mostrar apenas mais de 1x
                const finalWeaknesses = Object.fromEntries(
                    Object.entries(damageRelations).filter(([_, value]) => value > 1)
                );

                setWeaknesses(finalWeaknesses);

                return axios.get(res.data.species.url);
            })
            .then((speciesRes) => axios.get(speciesRes.data.evolution_chain.url))
            .then((evoRes) => {

                const chain = [];
                let evoData = evoRes.data.chain;

                do {
                    const pokemonId = evoData.species.url.split("/").filter(Boolean).pop();
                    chain.push({
                        name: evoData.species.name,
                        id: pokemonId
                    });
                    evoData = evoData.evolves_to[0];
                } while (evoData);

                setEvolutions(chain);
                setLoading(false);
            })
            .catch((err) => {
                console.error("Erro ao buscar dados:", err);
                setLoading(false);
            });
    }, [name]);

    //Verificações de Renderização (ESSENCIAL PARA NÃO DAR ERRO)
    if (loading) return <DetailsSkeleton isDarkMode={isDarkMode}/>;
    if (!pokemon) return <p style={styles.error}>Pokemon Não Encontrado...</p>;

    //Definição de Imagem e GIF se forem 
    const pokemonGif = isShiny
        ? pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny || pokemon.sprites.front_shiny
        : pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default || pokemon.sprites.front_default;

    const legacySprite = isShiny
        ? pokemon.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_shiny
        : pokemon.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_default;

    const currentImage = viewMode === 'legacy' ? legacySprite : pokemonGif;

    return (
        <div style={styles.container}>
            <Link to="/" style={styles.backLink}>
                Home
            </Link>

            <button onClick={toggleFavorite} style={{
                backgroundColor: isFavorite ? '#ff4757' : 'transparent',
                color: isFavorite ? '#fff' : '#ff4757',
                border: '2px solid #ff4757',
                padding: '10px 20px',
                borderRadius: '20px',
                cursor: 'pointer',
                fontWeight: 'bold'
            }}>
                {isFavorite ? '❤️ Favoritado' : '🤍 Favoritar'}
            </button>

            {/*Botoes Shiny/Cry/Legacy*/}
            <div style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                width: "100%",
            }}>
                {/* Botão Shiny*/}
                <button
                    onClick={handleToggleShiny}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        backgroundColor: isShiny ? "#FFD700" : (isDarkMode ? "#444" : "#eee"),
                        color: isShiny ? "#333" : (isDarkMode ? "#fff" : "#333"),
                        border: "none",
                        fontWeight: "bold",
                        display: "flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: isShiny ? "0 0 10px #FFD700" : "0 2px 5px rgba(0,0,0,0.2)"
                    }}
                >
                    {isShiny ? "✨" : "✨"}
                </button>

                {/*Botão Legacy*/}
                <button
                    onClick={() => setViewMode(viewMode === 'modern' ? 'legacy' : 'modern')}
                    style={{
                        padding: '10px 20px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: viewMode === 'legacy' ? '#ff4757' : '#747d8c',
                        color: 'white',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        marginLeft: '10px',
                        transition: '0.3s'
                    }}
                >
                    {viewMode === 'legacy' ? ' Modo Moderno' : 'Modo Retro'}
                </button>

                {/* Botão Cry*/}
                <button
                    onClick={playCry}
                    style={{
                        padding: "10px 15px",
                        borderRadius: "10px",
                        cursor: "pointer",
                        backgroundColor: isDarkMode ? "#444" : "#eee",
                        color: isDarkMode ? "#fff" : "#333",
                        border: "none",
                        fontSize: "1.2rem",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.5)"
                    }}
                    title="Ouvir grito"
                >
                    🔊
                </button>
            </div>

            {/* Posição Pokemon na Pokedex*/}
            <p style={styles.pokedexNumber}>
                #{pokemon.id.toString().padStart(3, '0')}
            </p>


            <h1 style={styles.name}>{pokemon.name}</h1>

            {/* Container de Navegação Horizontal e Imagem */}
            <div style={styles.imageNavigationWrapper}>
                {/* Botão de Voltar */}
                <button
                    onClick={handlePrev}
                    style={styles.navButton}
                >
                    ◀
                </button>

                {/*Imagem Central */}
                <img
                    src={pokemonGif}
                    alt={pokemon.name}
                    style={styles.image}
                />

                {/* Botão Próximo */}
                <button
                    onClick={handleNext}
                    style={styles.navButton}
                >
                    ▶
                </button>
            </div>

            {/* Container Altura/Peso*/}
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '40px',
                marginTop: '30px',
                marginBottom: '20px'
            }}>
                {/*Peso*/}
                <div style={{ textAlign: 'center' }}>

                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        opacity: 0.5,
                        letterSpacing: '1px',
                        marginBottom: '5px',
                        textTransform: 'uppercase'
                    }}> Peso: </p>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#eee' : '#333',
                    }}> {pokemon.weight / 10} kg </span>
                </div>

                {/*Divisor*/}
                <div style={{ width: '1px', height: '20px', backgroundColor: isDarkMode ? '#444' : '#ddd' }} />

                {/*Altura*/}
                <div style={{ textAlign: 'center' }}>
                    <p style={{
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        opacity: 0.5,
                        letterSpacing: '1px',
                        marginBottom: '5px',
                        textTransform: 'uppercase'
                    }}>Altura: </p>
                    <span style={{
                        fontSize: '1.1rem',
                        fontWeight: 'bold',
                        color: isDarkMode ? '#eee' : '#333',
                    }}> {pokemon.height/10} m</span>
                </div>

            </div>

            {/* Container Tipo e Fraqueza */}
            <div style={{
                backgroundColor: isDarkMode ? '#2a2a2a' : '#f9f9f9',
                borderRadius: '20px',
                border: `1px solid ${isDarkMode ? "#444" : "#eee"}`,
                padding: '25px 20px',
                margin: "20px auto",
                maxWidth: '800px',
                display: "flex",
                flexDirection: 'row',
                flexWrap: 'nowrap',
                alignItems: "center",
                justifyContent: "center",
                boxShadow: isDarkMode ? '0 4px 20px rgba(0,0,0,0.3)' : '0 4px 15px rgba(0,0,0,0.05)'
            }}>

                {/* Tipos */}
                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: '0 10px',
                }}>
                    <h4 style={{
                        fontSize: '0.84rem',
                        fontWeight: '900',
                        margin: '0 0 12px 0',
                        color: isDarkMode ? '#fff' : '#444',
                        letterSpacing: '1.7px',
                        opacity: 0.6,
                    }}>TIPO</h4>

                    <div style={{ display: 'flex', gap: '8px', justifyContent: "center"}}>
                        {pokemon.types.map((t: any) => (
                            <div
                                key={t.type.name}
                                onClick={() => handleTypeClick(t.type.name)}
                                style={{
                                    padding: '9px 19px',
                                    borderRadius: '11px',
                                    backgroundColor: getTypeColor(t.type.name),
                                    color: '#fff',
                                    fontSize: "0.85rem",
                                    fontWeight: '800',
                                    cursor: 'pointer',
                                    boxShadow: `0 4px 10px ${getTypeColor(t.type.name)}44`,
                                    textTransform: 'uppercase',
                                    minWidth: '40px'

                                }}
                                onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
                                onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
                            >
                                {t.type.name}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Divisor Vertical*/}
                <div style={{
                    width: '1px',
                    height: '60px',
                    backgroundColor: isDarkMode ? '#444' : "#ddd",
                    background: isDarkMode ? 'rgba(255, 255,255,0.1)' : 'rgba(0,0,0,0.1)',
                    opacity: 0.5
                }} />

                {/* Fraquezas */}
                <div style={{
                    flex: 1,
                    textAlign: 'center',
                    padding: "0 10px"
                }}>
                    <h4 style={{
                        fontSize: '0.65rem',
                        fontWeight: '900',
                        margin: '0 0 12px 0',
                        color: isDarkMode ? '#fff' : '#444',
                        letterSpacing: '2px',
                        opacity: 0.5
                    }}>FRAQUEZAS</h4>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(75px, 1fr))',
                        gap: '6px',
                        justifyContent: 'center',
                    }}>

                    {Object.entries(weaknesses).map(([typeName, multiplier]) => {
                        const typeColor = getTypeColor(typeName); // Pegamos a cor uma vez para facilitar

                        return (
                            <div
                                key={typeName}
                                onClick={() => handleTypeClick(typeName)}
                                style={{
                                    padding: '7px 7px',
                                    borderRadius: '10px',
                                    border: `1.3px solid ${typeColor}`,
                                    backgroundColor: isDarkMode ? 'transparent' : typeColor,
                                    color: isDarkMode ? "#eee" : '#fff',
                                    fontSize: '0.8rem',
                                    fontWeight: 'bold',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '4px',

                                    boxShadow: isDarkMode ? `0 0 8px ${typeColor}44` : 'none'
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.transform = 'scale(1.05)';
                                    if (isDarkMode) e.currentTarget.style.backgroundColor = `${typeColor}22`; // Leve preenchimento no hover (dark)
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.transform = 'scale(1)';
                                    if (isDarkMode) e.currentTarget.style.backgroundColor = 'transparent';
                                }}
                            >
                                <span style={{ textTransform: 'capitalize' }}>{typeName}</span>
                                <span style={{
                                    opacity: isDarkMode ? 0.6 : 0.9,
                                    fontSize: '0.7rem',
                                    backgroundColor: isDarkMode ? 'transparent' : 'rgba(0,0,0,0.1)',
                                    padding: '1px 4px',
                                    borderRadius: '4px'
                                }}>{multiplier}x</span>
                            </div>
                        );
                    })}







                    </div>

                </div>
            </div>

            {/* Container Status */}
            <h2 style={styles.statsTitle}>Status Base</h2>
            <div style={styles.statsContainer}>
                {pokemon.stats.map((stat: any) => {
                    const percentage = (stat.base_stat / 200) * 100;
                    return (
                        <div key={stat.stat.name} style={styles.statRow}>
                            <span style={styles.statLabel}>{formatStatName(stat.stat.name)}</span>
                            <span style={styles.statValue}>{stat.base_stat}</span>
                            <div style={styles.barOuter}>
                                <div
                                    style={{
                                        ...styles.barInner,
                                        width: `${Math.min(percentage, 100)}%`,
                                        backgroundColor: getStatColor(stat.stat.name),
                                    }}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Container Evoluções*/}
            <h2 style={styles.statsTitle}>Linha Evolutiva</h2>
            <div style={styles.evolutionContainer}>
                {evolutions.map((evo, index) => {
                    const evoImageUrl = isShiny
                        ? `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/shiny/${evo.id}.png`
                        : `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`;

                    return (
                        <div key={evo.id} style={{ display: 'flex', alignItems: 'center' }}>
                            <div
                                onClick={() => navigate(`/pokemon/${evo.name}`)}
                                style={styles.evolutionCard}
                            >
                                <img
                                    src={evoImageUrl}
                                    alt={evo.name}
                                    style={styles.evolutionImage}
                                />
                                <p style={styles.evolutionName}>
                                    {evo.name}
                                </p>
                            </div>

                            {index < evolutions.length - 1 && (
                                <span style={{ fontSize: '1.5rem', opacity: 0.5, margin: "0 10px" }}>→</span>
                            )}
                        </div>

                    );
                })}
            </div>


        </div>
    );
}

// --- FUNÇÕES AUXILIARES ---
const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
        hp: "#FF0000", attack: "#F08030", defense: "#F8D030",
        "special-attack": "#6890F0", "special-defense": "#78C850", speed: "#F85888",
    };
    return colors[statName] || "#777";
};

const formatStatName = (name: string) => {
    const names: { [key: string]: string } = {
        "special-attack": "Sp. Atk", "special-defense": "Sp. Def",
        hp: "HP", attack: "Atk", defense: "Def", speed: "Spd"
    };
    return names[name] || name;
};

const getTypeColor = (type: any) => {
    const colors: { [key: string]: string } = {
        fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
        ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
        flying: "#A890F0", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
        ghost: "#705898", dragon: "#7038F8", dark: "#705848", steel: "#B8B8D0",
        fairy: "#EE99AC", normal: "#A8A878",
    };

    const typeKey = String(type || "").toLowerCase();

    return colors[typeKey] || "#777";
};

const getStyles = (isDarkMode: boolean) => ({
    container: {
        padding: "2rem",
        maxWidth: "600px",
        margin: "0 auto",
        textAlign: "center" as const,
        backgroundColor: isDarkMode ? "#1e1e1e" : "#fff",
        borderRadius: "20px",
        boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
        color: isDarkMode ? "#fff" : "#333",
        animatio: "fadeIn 0.5s ease-in-out"
    },
    evolutionContainer: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: "10px",
        marginTop: "20px",
        flexWrap: "wrap" as const
    },
    evolutionCard: {
        cursor: "pointer",
        textAlign: "center" as const,
        padding: "10px",
        borderRadius: "10px",
        transition: "background 0.2",
    },
    evolutionImage: {
        width: "80px",
        height: "80px"
    },
    evolutionName: {
        textTransform: "capitalize" as const,
        fontSize: "0.9rem",
        fontWeight: "bold" as const,
        marginTop: "5px"
    },
    imageNavigationWrapper: {
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        justifyContent: "space-between",
        width: "100%",
        maxWidth: "400px",
        margin: "0 auto"
    },
    backLink: {
        display: "block",
        marginBottom: "1rem",
        textDecoration: "none",
        color: isDarkMode ? "#aaa" : "#555",
        fontSize: "1rem",
        fontWeight: "bold",
    },
    navigationContainer: {
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "20px",
        margin: "1rem 0",
    },
    navButton: {
        fontSize: "1.3rem",
        fontWeight: "lighter" as const,
        background: "none",
        border: "none",
        color: isDarkMode ? "#ffffff" : "#333",
        cursor: "pointer",
        borderRadius: "50%",
        width: "40px",
        height: "40px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
        userSelect: "none" as const,
        transition: "transform 0.2s, opacity 0.2s",
    },
    pokedexNumber: {
        fontSize: "1.2rem",
        fontWeight: "bold",
        color: isDarkMode ? "#aaa" : "#bbb",
        marginBottom: "-10px"
    },
    name: {
        fontSize: "2.5rem",
        textTransform: "capitalize" as const,
        margin: "0.5rem 0",
    },
    image: { width: "170px", height: "170px", margin: "3rem 0 3rem 0" },
    info: { marginBottom: "1rem", lineHeight: "1.6" },
    typesContainer: { display: "flex", gap: "8px", justifyContent: "center", marginTop: "10px" },
    typeBadge: {
        padding: "6px 12px",
        borderRadius: "15px",
        fontSize: "0.85rem",
        textTransform: "uppercase" as const,
        color: "#fff",
        fontWeight: "bold" as const,
    },
    statsTitle: { marginTop: "1rem", fontSize: "1.5rem" },
    statsContainer: { textAlign: "left" as const },
    statRow: { display: "flex", alignItems: "center", marginBottom: "0.8rem", gap: "10px" },
    statLabel: { width: "80px", fontWeight: "bold", fontSize: "0.85rem", textTransform: "capitalize" as const, flexShrink: 0 },
    barOuter: { flex: 1, backgroundColor: isDarkMode ? "#444" : "#e0e0e0", borderRadius: "10px", height: "12px", overflow: "hidden" },
    barInner: { height: "100%", borderRadius: "10px", transition: "width 0.5s ease-in-out" },
    statValue: { width: "35px", fontWeight: "bold", fontSize: "0.9rem", textAlign: "right" as const },
    loading: { textAlign: "center" as const, marginTop: "2rem" },
    error: { color: "red", textAlign: "center" as const, marginTop: "2rem" },
});

export default Details;