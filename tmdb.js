const axios = require("axios");

const API_KEY = process.env.TMDB_KEY || "b24aca9a07dad6212a0ad3047b5fd082";

const api = axios.create({
	baseURL: "https://api.themoviedb.org/3",
});

async function getPopularMovies(totalPages = 15) {
	let filmes = [];

	for (let page = 1; page <= totalPages; page++) {
		try {
			const response = await api.get(`/movie/popular?api_key=${API_KEY}&language=pt-PT&page=${page}`);
			filmes.push(...response.data.results);
		} catch (err) {
			console.error("Erro TMDB na página", page, err.response?.data || err.message);
		}
	}

	return filmes;
}
async function getPopularTVShows(totalPages = 15) {
	let series = [];
	for (let page = 1; page <= totalPages; page++) {
		try {
			const response = await api.get(`/tv/popular?api_key=${API_KEY}&language=pt-PT&page=${page}`);
			series.push(...response.data.results);
		} catch (err) {
			console.error("Erro TMDB na página", page, err.response?.data || err.message);
		}
	}
	return series;
}

module.exports = { getPopularMovies, getPopularTVShows };
