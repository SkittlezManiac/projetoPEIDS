const db = require("../db/connection");
const { getPopularTVShows, getTVShowDetails, getTVGenres, getTVVideos } = require("../tmdb");

// 🔹 obter todas as séries
exports.getAllSeries = (req, res) => {
	db.query("SELECT * FROM series", (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter séries" });
		}
		res.json(results);
	});
};

// 🔹 obter séries populares da TMDB
exports.getPopularSeriesTmdb = async (req, res) => {
	try {
		const series = await getPopularTVShows();
		const generos = await getTVGenres();

		const formatadas = series.map(s => ({
			id: s.id,
			name: s.name,
			first_air_date: s.first_air_date,
			poster_path: s.poster_path,
			genre_ids: s.genre_ids || []
		}));

		res.json(formatadas);

	} catch (err) {
		console.error("erro tmdb:", err);
		res.status(500).json({ erro: "erro ao contactar tmdb" });
	}
};

exports.getGenerosSeriesTmdb = async (req, res) => {
	try {
		const generos = await getTVGenres();
		res.json(generos);
	} catch (err) {
		res.status(500).json({ erro: "erro ao obter géneros de séries" });
	}
};

// 🔹 importar séries da TMDB
exports.importarSeriesTmdb = async (req, res) => {
	try {
		const series = await getPopularTVShows();

		const promises = series.map(s => new Promise((resolve, reject) => {

			const query = `
                INSERT IGNORE INTO series (titulo, sinopse, poster, ano, tmdb_id)
                VALUES (?, ?, ?, ?, ?)
            `;

			db.query(query, [
				s.name,
				s.overview,
				s.poster_path ? `https://image.tmdb.org/t/p/w500${s.poster_path}` : null,
				s.first_air_date?.slice(0, 4),
				s.id
			], err => err ? reject(err) : resolve());

		}));

		await Promise.all(promises);

		res.json({ mensagem: "séries importadas com sucesso!" });

	} catch (err) {
		console.error("erro ao importar séries:", err);
		res.status(500).json({ erro: "erro ao importar séries da tmdb" });
	}
};

// obter trailer da série
exports.getTrailerSerie = async (req, res) => {
	const { id } = req.params;

	if (!id) return res.status(400).json({ erro: "id da série é obrigatório." });

	try {
		const serie = await getTVShowDetails(id);
		if (!serie) return res.status(404).json({ erro: "série não encontrada." });

		// pegar vídeos do append_to_response ou fallback para getTVVideos
		const videos = serie.videos?.results || [];

		// procurar primeiro Trailer, depois Teaser
		const trailer = videos.find(v => v.site === "YouTube" && (v.type === "Trailer" || v.type === "Teaser"));

		if (!trailer) return res.json({ url: null });

		res.json({ url: `https://www.youtube.com/embed/${trailer.key}` });

	} catch (err) {
		console.error("erro ao obter trailer da série:", err);
		res.status(500).json({ erro: "erro ao obter trailer da série." });
	}
};

// 🔹 obter detalhes por id
exports.getDetalhesSerie = async (req, res) => {

	const id = req.params.id;

	try {
		const serie = await getTVShowDetails(id);

		if (!serie)
			return res.status(404).json({ erro: "série não encontrada" });

		const dados = {
			nome: serie.name,
			sinopse: serie.overview,
			duracao: serie.episode_run_time?.[0] || 0,
			ano: serie.first_air_date?.slice(0, 4) || "n/a",
			generos: serie.genres.map(g => g.name),
			diretor: serie.created_by?.map(c => c.name).join(", ") || "n/a",
			elenco: serie.credits?.cast?.slice(0, 5).map(c => c.name) || []
		};

		res.json(dados);

	} catch (err) {
		console.error(err);
		res.status(500).json({ erro: "erro ao buscar detalhes da série" });
	}
};
