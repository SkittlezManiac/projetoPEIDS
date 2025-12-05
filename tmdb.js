const axios = require("axios");

const API_KEY = "b24aca9a07dad6212a0ad3047b5fd082";

const api = axios.create({
	baseURL: "https://api.themoviedb.org/3",
});

async function getPopularMovies() {
	try {
		const response = await api.get(`/movie/popular?api_key=${API_KEY}&language=pt-PT&page=1`);
		return response.data.results;
	} catch (err) {
		console.error("Erro ao contactar TMDB:", err.response?.data || err.message);
		return [];
	}
}

module.exports = { getPopularMovies };
