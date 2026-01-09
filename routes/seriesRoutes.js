const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { getPopularTVShows } = require("../tmdb");

// Obter todas as séries da base de dados
router.get("/", (req, res) => {
	db.query("SELECT * FROM series", (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "Erro ao obter séries" });
		}
		res.json(results);
	});
});

// Obter séries populares diretamente da TMDB
router.get("/tmdb/populares", async (req, res) => {
	try {
		const series = await getPopularTVShows();

		const formatadas = series.map(s => ({
			name: s.name,
			first_air_date: s.first_air_date,
			poster_path: s.poster_path,
		}));

		res.json(formatadas);

	} catch (err) {
		console.error("Erro TMDB:", err);
		res.status(500).json({ erro: "Erro ao contactar TMDB" });
	}
});

// Importar séries populares para MySQL
router.post("/importar/tmdb", async (req, res) => {
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
		res.json({ mensagem: "Séries importadas com sucesso!" });

	} catch (err) {
		console.error("Erro ao importar séries:", err);
		res.status(500).json({ erro: "Erro ao importar séries da TMDB" });
	}
});

module.exports = router;
