import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

interface PokemonCardProps {
  name: string;
  url: string;
}

const PokemonCard = ({ name, url }: PokemonCardProps) => {
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    axios.get(url).then((res) => {
      setImageUrl(res.data.sprites.front_default);
    });
  }, [url]);

  return (
    <Link to={`/pokemon/${name}`} style={styles.card}>
      <img src={imageUrl} alt={name} style={styles.image} />
      <p style={styles.name}>{name}</p>
    </Link>
  );
};

const styles = {
  card: {
    backgroundColor: "#f2f2f2",
    padding: "1rem",
    borderRadius: "8px",
    textAlign: "center" as const,
    textDecoration: "none",
    color: "#333",
    boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
  },
  image: {
    width: "96px",
    height: "96px",
  },
  name: {
    marginTop: "0.5rem",
    textTransform: "capitalize" as const,
  },
};

// Exportação padrão do componente
export default PokemonCard;
