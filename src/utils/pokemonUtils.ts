import axios from 'axios';

export const getPokemonWeaknesses = async (types: any[]) => {
    const typePromises = types.map((t: any) => axios.get(t.type.url));
    const typeResponses = await Promise.all(typePromises);

    const damageRelations: { [key: string]: number } = {};

    typeResponses.forEach((typeRes: any) => {
        const relations = typeRes.data.damage_relations;

        // Fraquezas (2x)
        relations.double_damage_from.forEach((t: any) => {
            damageRelations[t.name] = (damageRelations[t.name] || 1) * 2;
        });

        // Resistências (0.5x)
        relations.half_damage_from.forEach((t: any) => {
            damageRelations[t.name] = (damageRelations[t.name] || 1) * 0.5;
        });

        // Imunidades (0x)
        relations.no_damage_from.forEach((t: any) => {
            damageRelations[t.name] = 0;
        });
    });

    // Filtra apenas o que é fraqueza real (> 1)
    return Object.fromEntries(
        Object.entries(damageRelations).filter(([_, value]) => value > 1)
    );
};

export const getTypeColor = (type: string): string => {
    const colors: { [key: string]: string } = {
        fire: "#F08030", water: "#6890F0", grass: "#78C850", electric: "#F8D030",
        ice: "#98D8D8", fighting: "#C03028", poison: "#A040A0", ground: "#E0C068",
        flying: "#A890F0", psychic: "#F85888", bug: "#A8B820", rock: "#B8A038",
        ghost: "#705898", dragon: "#7038F8", dark: "#705848", steel: "#B8B8D0",
        fairy: "#EE99AC", normal: "#A8A878",
    };

    const typeKey = String(type || "").toLowerCase();

    return colors[type.toLowerCase()] || "#A8A878";
};

export const getStatColor = (statName: string) => {
    const colors: { [key: string]: string } = {
        hp: "#FF0000",
        attack: "#F08030",
        defense: "#F8D030",
        "special-attack": "#6890F0",
        "special-defense": "#78C850",
        speed: "#F85888",
    };
    return colors[statName.toLowerCase()] || "#777";
};

export const formatStatName = (name: string) => {
    const names: { [key: string]: string } = {
        "special-attack": "Sp. Atk",
        "special-defense": "Sp. Def",
        hp: "HP",
        attack: "Atk",
        defense: "Def",
        speed: "Spd",
    };
    return names[name] || name;
};