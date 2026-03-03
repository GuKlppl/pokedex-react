import { useState } from "react";
import { Link } from "react-router-dom";

interface PokemonCardProps {
    name: string;
    url: string;
}

function PokemonCard({ name, url, isDarkMode }: PokemonCardProps) {
    const [loaded, setLoaded] = useState(false);

    const id = url.split("/").filter(Boolean).pop();

    const imageUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${id}.png`;

    //Cores Dinamicas
    const textColor = isDarkMode ? '#ffffff' : "#2d3436";
    const cardBg = isDarkMode ? '#1e1e1e' : "#ffffff";
    const borderColor = isDarkMode ? '#333' : '#eee';

    return (
        <Link to={`/pokemon/${name}`} style={{ ...styles.card, backgroundColor: cardBg }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}>

            {!loaded && <div className="skeleton-pulse" style={styles.skeletonPulse} />}

            <img
                src={imageUrl}
                alt={name}
                loading="lazy"
                onLoad={() => setLoaded(true)}
                style={{
                    ...styles.image,
                    opacity: loaded ? 1 : 0,
                    transition: "opacity 0.3s ease-in-out",
                }}
            />

            <div style={styles.infoContainer}>
                <span style={{...styles.idLabel, color: isDarkMode ? "#aaa" : "#777"}}>
                    #{id?.padStart(3, '0')}
                </span>
                <p style={{...styles.name, color: textColor}}>
                    {name}
                </p>
            </div>
        </Link>
    )
};

const styles = {
    card: {
        position: "relative" as const,
        display: "flex",
        flexDirection: "row" as const,
        alignItems: "center",
        padding: "1rem",
        borderRadius: "20px",
        textDecoration: "none",
        boxShadow: "0 9px 19px rgba(0, 0, 0, 0.5)",
        border: "1px solid transparent",
        transition: "all 0.3s ease",
        overflow: "hidden",
        minWidth: "180px", 
    },
    infoContainer: {
        display: "flex",
        flexDirection: "column" as const,
        justifyContent: "center",
        alignItems: "center",
        flex: 1,
        textAlign: "center" as const
    },
    idLabel: {
        fontSize: "0.93rem",
        fontWeight: "bold" as const,
        fontFamily: "monospace",
        opacity: 0.7    ,
        marginBottom: "1px",
    },
    image: {
        width: "80px",
        height: "80px",
        flexShrink: 0,
        filter: "drop-shadow(0 5px 5px rgba(0,0,0,0.3))"
    },
    name: {
        textTransform: "capitalize" as const,
        fontWeight: "800" as const,
        fontSize: "1.1rem", // Diminuído levemente (era 1.2rem)
        margin: 0,

    },
    skeletonPulse: {
        position: "absolute" as const,
        width: "60px",
        height: "60px",
        left: "20px",
        backgroundColor: "#e0e0e0",
        borderRadius: "50%",
    },
};

export default PokemonCard;