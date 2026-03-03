import { useParams, Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { PokemonDetails } from "../types/Pokemon";
import "./Details.css";
import { getPokemonWeaknesses, getTypeColor,getStatColor, formatStatName } from "../../utils/pokemonUtils";


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

    // Clicar no tipo mostra os tipos filtrados
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

        axios.get(`https://pokeapi.co/api/v2/pokemon/${name}`)
            .then(async (res) => {
                setPokemon(res.data);

                const finalWeaknesses = await getPokemonWeaknesses(res.data.types);
                setWeaknesses(finalWeaknesses);

                return axios.get(res.data.species.url);
            })
            .then((speciesRes) => axios.get(speciesRes.data.evolution_chain.url))
            .then((evoRes) => {
                setLoading(false);
            })
            .catch(err => {
                console.error(err);
                setLoading(false);
            });
    }, [name]);

    //Verificações de Renderização
    if (loading) return <DetailsSkeleton isDarkMode={isDarkMode} />;
    if (!pokemon) return <p style={styles.error}>Pokemon Não Encontrado...</p>;

        

    const legacySprite = isShiny
        ? pokemon.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_shiny
        : pokemon.sprites.versions?.["generation-iii"]?.["firered-leafgreen"]?.front_default;

    return (
        <div className="details-page-wrapper">
            <div className="details-card">

                {/* COLUNA 1: IDENTIDADE */}
                <div className="details-column identity-column">
                    <button onClick={() => setIsShiny(!isShiny)} className="shiny-toggle-corner">
                        {isShiny ? "✨ Shiny" : "✨ Normal"}
                    </button>

                    <span className="pokemon-id-bg"
                        style={{color: `${getTypeColor(pokemon.types[0].type.name)}66`} }
                    >#{pokemon.id}</span>

                    <div className="identity-content"> 
                        <div className="name-row">
                            <h1>{pokemon.name}</h1>
                            {/* Botão de Cry aqui */}
                            <button onClick={playCry} className="cry-button" title="Ouça o som">
                                🔊
                            </button>
                        </div>
                        <img
                            className="pokemon-image"
                            src={isShiny
                                ? pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_shiny || pokemon.sprites.front_shiny
                                : pokemon.sprites.versions?.["generation-v"]?.["black-white"]?.animated?.front_default || pokemon.sprites.front_default
                            }
                            alt={pokemon.name}
                        />

                    </div>
                    


                        {/* Fraquezas */}
                        <div className="weakness-section">
                            <h4>Fraquezas</h4>
                            <div className="weakness-grid">
                                {weaknesses && Object.keys(weaknesses).length > 0 ? (
                                    Object.entries(weaknesses).map(([type, multiplier]: [string, any]) => (
                                        <div key={type} className="weakness-badge-wrapper" style={{backgroundColor: getTypeColor(type)} }>
                                            <span className={`type-name ${type}`}
                                                onClick={() => handleTypeClick(type)}
                                                style={{
                                                    backgroundColor: getTypeColor(type),
                                                    boxShadow: `0 4px 10px ${getTypeColor(type)}44`,
                                                } }
                                            >
                                                {type}
                                            </span>
                                            <span className="multiplier" onClick={()=> handleTypeClick(type)}>{multiplier}x</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="no-weaknesses-text">No major weaknesses</p>
                                )}
                            </div>
                        </div>
                </div>

                {/* COLUNA 2: STATUS */}
                <div className="details-column stats-column">
                    <h3>Base Stats</h3>
                    {pokemon.stats.map((s: any) => (
                        <div key={s.stat.name} className="stat-item">
                            <div className="stat-info">
                                <span>{formatStatName(s.stat.name)}</span>
                                <span>{s.base_stat}</span>
                            </div>
                            <div className="stat-bar-container">
                                <div
                                    className="stat-bar-fill"
                                    style={{
                                        "--target-width": `${Math.min((s.base_stat / 150) * 100, 100)}%`,
                                        backgroundColor: getStatColor(s.stat.name),
                                        boxShadow: `0 0 12px ${getStatColor(s.stat.name)}66`
                                    } as React.CSSProperties}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* COLUNA 3: EVOLUÇÃO */}
                <div className="details-column evolution-column">
                    <h3>Evolution Chain</h3>
                    <div className="evolution-display">
                        {evolutions.map((evo: any) => (
                            <div key={evo.id} className="evo-item" onClick={() => navigate(`/pokemon/${evo.name}`)}>
                                <img
                                    src={`https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/versions/generation-v/black-white/animated/${evo.id}.gif`}
                                    alt={evo.name}
                                    onError={(e: any) => e.target.src = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${evo.id}.png`}
                                />
                                <span>{evo.name}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};


export default Details;