const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { getPopularTVShows, getTVShowDetails } = require("../tmdb");

// obter todas as séries da base de dados
router.get("/", (req, res) => {
	db.query("SELECT * FROM series", (err, results) => {
		if (err) {
			// log de erro e devolver 500
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter séries" });
		}
		res.json(results);
	});
});

// obter séries populares diretamente da tmdb
router.get("/tmdb/populares", async (req, res) => {
	try {
		const series = await getPopularTVShows();

		// formatar apenas os dados necessários
		const formatadas = series.map(s => ({
			id: s.id,
			name: s.name,
			first_air_date: s.first_air_date,
			poster_path: s.poster_path,
		}));

		res.json(formatadas);

	} catch (err) {
		// log de erro e devolver 500
		console.error("erro tmdb:", err);
		res.status(500).json({ erro: "erro ao contactar tmdb" });
	}
});

// importar séries populares para o mysql
router.post("/importar/tmdb", async (req, res) => {
	try {
		const series = await getPopularTVShows();

		// criar promessas para inserir cada série
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

		// esperar todas as inserções
		await Promise.all(promises);
		res.json({ mensagem: "séries importadas com sucesso!" });

	} catch (err) {
		// log de erro e devolver 500
		console.error("erro ao importar séries:", err);
		res.status(500).json({ erro: "erro ao importar séries da tmdb" });
	}
});

// obter detalhes de uma série pelo id
router.get("/:id", async (req, res) => {
	const id = req.params.id;
	try {
		const serie = await getTVShowDetails(id);
		if (!serie) return res.status(404).json({ erro: "série não encontrada" });

		// formatar dados para o front-end
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
		// log de erro e devolver 500
		console.error(err);
		res.status(500).json({ erro: "erro ao buscar detalhes da série" });
	}
});

module.exports = router;
