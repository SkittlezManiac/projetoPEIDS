const axios = require("axios");

// chave da api do tmdb
const API_KEY = process.env.TMDB_KEY || "b24aca9a07dad6212a0ad3047b5fd082";

// criar instancia axios com url base do tmdb
const api = axios.create({
	baseURL: "https://api.themoviedb.org/3",
});

// obter filmes populares, opcionalmente por numero de paginas
async function getPopularMovies(totalPages = 15) {
	let filmes = [];

	for (let page = 1; page <= totalPages; page++) {
		try {
			// requisitar filmes populares do tmdb
			const response = await api.get(`/movie/popular?api_key=${API_KEY}&language=pt-PT&page=${page}`);
			filmes.push(...response.data.results);
		} catch (err) {
			// log de erro caso a requisicao falhe
			console.error("erro tmdb na página", page, err.response?.data || err.message);
		}
	}

	return filmes;
}

// obter series populares, opcionalmente por numero de paginas
async function getPopularTVShows(totalPages = 15) {
	let series = [];
	for (let page = 1; page <= totalPages; page++) {
		try {
			// requisitar series populares do tmdb
			const response = await api.get(`/tv/popular?api_key=${API_KEY}&language=pt-PT&page=${page}`);
			series.push(...response.data.results);
		} catch (err) {
			// log de erro caso a requisicao falhe
			console.error("erro tmdb na página", page, err.response?.data || err.message);
		}
	}
	return series;
}

// obter detalhes de um filme pelo id
async function getMovieDetails(id) {
	try {
		// requisitar detalhes do filme e cast
		const response = await api.get(
			`/movie/${id}?api_key=${API_KEY}&language=pt-PT&append_to_response=credits,videos`
		);
		return response.data;
	} catch (err) {
		// log de erro e retornar null se falhar
		console.error("erro ao buscar detalhes do filme", id, err.response?.data || err.message);
		return null;
	}
}

// obter detalhes de uma serie pelo id
async function getTVShowDetails(id) {
	try {
		// requisitar detalhes da serie
		const response = await api.get(`/tv/${id}?api_key=${API_KEY}&language=pt-PT&append_to_response=credits,videos`);
		return response.data;
	} catch (err) {
		// log de erro e retornar null se falhar
		console.error("erro ao buscar detalhes da série", id, err.response?.data || err.message);
		return null;
	}
}

async function getMovieGenres() {
	try {
		const response = await api.get(
			`/genre/movie/list?api_key=${API_KEY}&language=pt-PT`
		);
		return response.data.genres;
	} catch (err) {
		console.error("erro ao buscar géneros", err.response?.data || err.message);
		return [];
	}
}

async function getTVGenres() {
	try {
		const response = await api.get(
			`/genre/tv/list?api_key=${API_KEY}&language=pt-PT`
		);
		return response.data.genres;
	} catch (err) {
		console.error("erro ao buscar géneros de séries", err.response?.data || err.message);
		return [];
	}
}

// obter vídeos de um filme
async function getMovieVideos(id) {
	try {
		const response = await api.get(`/movie/${id}/videos?api_key=${API_KEY}&language=pt-PT`);
		return response.data; // contém results[]
	} catch (err) {
		console.error("erro ao buscar vídeos do filme", id, err.response?.data || err.message);
		return { results: [] };
	}
}

// obter vídeos de uma série
async function getTVVideos(id) {
	try {
		const response = await api.get(`/tv/${id}/videos?api_key=${API_KEY}&language=pt-PT`);
		return response.data;
	} catch (err) {
		console.error("erro ao buscar vídeos da série", id, err.response?.data || err.message);
		return { results: [] };
	}
}

module.exports = {
	getPopularMovies,
	getPopularTVShows,
	getMovieDetails,
	getTVShowDetails,
	getMovieGenres,
	getTVGenres,
	getMovieVideos,
	getTVVideos
};

