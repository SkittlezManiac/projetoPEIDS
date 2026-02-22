const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const { getPopularMovies, getMovieDetails } = require("../tmdb");

// obter todos os filmes da base de dados
router.get("/", (req, res) => {
	db.query("SELECT * FROM filmes", (err, results) => {
		if (err) {
			// log de erro e devolver 500
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter filmes" });
		}
		res.json(results);
	});
});

// obter filmes populares diretamente da tmdb
router.get("/tmdb/populares", async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		// formatar apenas os dados necessários
		const formatados = filmes.map(f => ({
			id: f.id,
			title: f.title,
			release_date: f.release_date,
			poster_path: f.poster_path,
		}));

		res.json(formatados);

	} catch (err) {
		// log de erro e devolver 500
		console.error("erro tmdb:", err);
		res.status(500).json({ erro: "erro ao contactar tmdb" });
	}
});

// importar filmes populares para o mysql
router.post("/importar/tmdb", async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		// criar promessas para inserir cada filme
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

		// esperar todas as inserções
		await Promise.all(promises);
		res.json({ mensagem: "filmes importados com sucesso!" });

	} catch (err) {
		// log de erro e devolver 500
		console.error("erro ao importar:", err);
		res.status(500).json({ erro: "erro ao importar filmes da tmdb" });
	}
});

// obter detalhes de um filme pelo id
router.get("/:id", async (req, res) => {
	const { id } = req.params;

	if (!id) return res.status(400).json({ erro: "id do filme é obrigatório." });

	try {
		const filme = await getMovieDetails(id);

		if (!filme) return res.status(404).json({ erro: "filme não encontrado." });

		// formatar dados para o frontend
		const dados = {
			nome: filme.title,
			sinopse: filme.overview,
			duracao: filme.runtime || 0,
			ano: filme.release_date?.slice(0, 4) || "n/a",
			generos: filme.genres.map(g => g.name),
			diretor: filme.credits?.crew?.find(c => c.job === "Director")?.name || "n/a",
			elenco: filme.credits?.cast?.slice(0, 5).map(c => c.name) || []
		};

		res.json(dados);
	} catch (err) {
		// log de erro e devolver 500
		console.error("erro ao obter detalhes do filme:", err);
		res.status(500).json({ erro: "erro ao obter detalhes do filme." });
	}
});

module.exports = router;
