import React, { createContext, useContext, useReducer, useCallback, useMemo } from "react";
import { useQuery } from '@tanstack/react-query';

export interface Pokemon {
	id: number;
	name: string;
	type: string[];
	hp: number;
	attack: number;
	defense: number;
	special_attack: number;
	special_defense: number;
	speed: number;
}

function usePokemonSource(): {
	pokemon: Pokemon[];
	search: string;
	setSearch: (search: string) => void;
} {
	const { data: pokemon } = useQuery<Pokemon[]>(['pokemon'], () => fetch('/pokemon.json').then((res) => res.json()), {
		initialData: [],
	});
	type PokemonState = {
		search: string,
	}
	type PokemonAction = { type: 'SET_SEARCH', payload: string };

	const [{ search }, dispatch] = useReducer((state: PokemonState, action: PokemonAction) => {
		switch (action.type) {
			case 'SET_SEARCH':
				return { ...state, search: action.payload };
		}
	}, {
		search: '',
	});

	const setSearch = useCallback((search: string) => {
		dispatch({
			type: 'SET_SEARCH',
			payload: search,
		})
	}, []);

	const filteredPokemon = useMemo(() =>
		pokemon.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())), [pokemon, search]);

	const sortedPokemon = useMemo(() =>
		[...filteredPokemon].sort((a, b) => a.name.localeCompare(b.name)), [filteredPokemon]);

	return { pokemon: sortedPokemon, search, setSearch };
}

const PokemonContext = createContext<ReturnType<typeof usePokemonSource>>(
	{} as unknown as ReturnType<typeof usePokemonSource>
);

export function usePokemon() {
	return useContext(PokemonContext);
}

export function PokemonProvider({ children } : {
	children: React.ReactNode;
}) {
	return (
		<PokemonContext.Provider value={usePokemonSource()}>
			{ children }
		</PokemonContext.Provider>
	)
}
