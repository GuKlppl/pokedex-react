import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import type { PokemonDetails } from "../types/Pokemon";

function Details() {
  const { name } = useParams<{ name: string }>();
  const [pokemon, setPokemon] = useState<PokemonDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`https://pokeapi.co/api/v2/pokemon/${name}`)
      .then((res) => {
        setPokemon(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [name]);

  if (loading) return <p style={styles.loading}>Carregando...</p>;
  if (!pokemon) return <p style={styles.error}>Pokemon Não Encontrado ;-;</p>;

  return (
    <div style={styles.container}>
      <Link to="/" style={styles.backLink}>
        Voltar
      </Link>

      <h1 style={styles.name}>{pokemon.name}</h1>
      <img
        src={pokemon.sprites.front_default}
        alt={pokemon.name}
        style={styles.image}
      />
      <div style={styles.info}>
        <p>
          <strong>Altura:</strong> {pokemon.height / 10} m
        </p>
        <p>
          <strong>Peso:</strong> {pokemon.height / 10} kg
        </p>
        <p>
          {" "}
          <strong>Tipo(s):</strong>{" "}
          {pokemon.types.map((t) => t.type.name).join(",")}
        </p>
      </div>
      <h2 style={styles.statsTitle}>Status Base</h2>
      <ul style={styles.statsList}>
        {pokemon.stats.map((stat) => (
          <li key={stat.stat.name}>
            {stat.stat.name}: {stat.base_stat}
          </li>
        ))}
      </ul>
    </div>
  );
}

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
    maxWidth: "600px",
    margin: "0 auto",
    textAlign: "center" as const,
  },
  backLink: {
    display: "block",
    marginBottom: "1rem",
    textDecoration: "none",
    color: "#007bff",
    fontSize: "1rem",
  },
  name: {
    fontSize: "2rem",
    textTransform: "capitalize" as const,
  },
  image: {
    width: "150px",
    height: "150px",
    margin: "1rem 0",
  },
  info: {
    marginBottom: "1rem",
  },
  statsTitle: {
    marginTop: "1rem",
    fontSize: "1.5rem",
  },
  statsList: {
    listStyle: "none",
    padding: 0,
    textAlign: "left" as const,
  },
  loading: {
    textAlign: "center" as const,
    marginTop: "2rem",
  },
  error: {
    color: "red",
    textAlign: "center" as const,
    marginTop: "2rem",
  },
};

export default Details;
