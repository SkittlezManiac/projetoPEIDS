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
// importar filmes populares para o mysql
router.post("/importar/tmdb", async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		for (const f of filmes) {
			// Normalizar o ano: se não houver release_date, usa NULL
			const ano = f.release_date?.slice(0, 4) || null;

			// Inserir filme se ainda não existir
			const filmeQuery = `
				INSERT INTO filmes (titulo, sinopse, poster, ano, tmdb_id)
				SELECT ?, ?, ?, ?, ?
				WHERE NOT EXISTS (
					SELECT 1 FROM filmes WHERE tmdb_id = ?
				)
			`;

			await new Promise((resolve, reject) => {
				db.query(filmeQuery, [
					f.title,
					f.overview,
					f.poster_path ? `https://image.tmdb.org/t/p/w500${f.poster_path}` : null,
					ano,
					f.id,
					f.id
				], err => err ? reject(err) : resolve());
			});

			// Pegar o ID do filme
			const filmeId = await new Promise((resolve, reject) => {
				db.query(`SELECT id FROM filmes WHERE tmdb_id = ?`, [f.id], (err, rows) => {
					if (err) reject(err);
					else resolve(rows[0].id);
				});
			});

			// Inserir genre_ids na tabela de relação evitando duplicados
			if (f.genre_ids && f.genre_ids.length > 0) {
				const promises = f.genre_ids.map(genreId => new Promise((resolve, reject) => {
					const query = `
						INSERT IGNORE INTO filme_genero (filme_id, genre_id)
						VALUES (?, ?)
					`;
					db.query(query, [filmeId, genreId], err => err ? reject(err) : resolve());
				}));
				await Promise.all(promises);
			}
		}

		res.json({ mensagem: "Filmes importados com genre_ids individuais sem duplicados!" });

	} catch (err) {
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
