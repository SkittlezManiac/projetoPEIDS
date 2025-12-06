const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { getPopularMovies } = require("../tmdb");

//obter todos os filmes da base de dados
router.get("/", (req, res) => {
	db.query("SELECT * FROM filmes", (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "Erro ao obter filmes" });
		}
		res.json(results);
	});
});

//obter filmes populares diretamente da TMDB
router.get("/tmdb/populares", async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		const formatados = filmes.map(f => ({
			title: f.title,
			release_date: f.release_date,
			poster_path: f.poster_path,
		}));

		res.json(formatados);

	} catch (err) {
		console.error("Erro TMDB:", err);
		res.status(500).json({ erro: "Erro ao contactar TMDB" });
	}
});

//Importar filmes populares para MySQL
router.post("/importar/tmdb", async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		const promises = filmes.map(f => new Promise((resolve, reject) => {
			const query = `
                INSERT IGNORE INTO filmes (titulo, sinopse, poster, ano, tmdb_id)
                VALUES (?, ?, ?, ?, ?)
            `;

			db.query(query, [
				f.title,
				f.overview,
				f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : null,
				f.release_date?.slice(0, 4),
				f.id
			], err => err ? reject(err) : resolve());
		}));

		await Promise.all(promises);
		res.json({ mensagem: "Filmes importados com sucesso!" });

	} catch (err) {
		console.error("Erro ao importar:", err);
		res.status(500).json({ erro: "Erro ao importar filmes da TMDB" });
	}
});

module.exports = router;
