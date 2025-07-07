import { useEffect, useState } from "react";
import axios from "axios";
import PokemonCard from "../components/PokemonCard";

import type { PokemonListItem } from "../types/Pokemon";

interface ApiResponse {
  results: PokemonListItem[];
}

function Home() {
  const [pokemons, setPokemons] = useState<PokemonListItem[]>([]);

  useEffect(() => {
    axios
      .get<ApiResponse>("https://pokeapi.co/api/v2/pokemon?limit=20")
      .then((res) => setPokemons(res.data.results))
      .catch((err) => console.error(err));
  }, []);

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Pokédex</h1>
      <div style={styles.grid}>
        {pokemons.map((pokemon) => (
          <PokemonCard
            key={pokemon.name}
            name={pokemon.name}
            url={pokemon.url}
          />
        ))}
      </div>
    </div>
  );
}

//? Estilos Basico Inline (depois pode usar CSS ou Tailwind)

const styles = {
  container: {
    padding: "2rem",
    fontFamily: "sans-serif",
  },
  title: {
    textAlign: "center" as const,
    fontSize: "2rem",
    marginBottom: "1.5rem",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
    gap: "1rem",
  },
};

export default Home;
