const db = require("../db/connection");
const { getPopularMovies, getMovieDetails, getMovieGenres } = require("../tmdb");

// 1️⃣ obter todos os filmes
exports.getAllFilmes = (req, res) => {
	db.query("SELECT * FROM filmes", (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter filmes" });
		}
		res.json(results);
	});
};

// 2️⃣ populares tmdb
exports.getPopularTmdb = async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		const formatados = filmes.map(f => ({
			id: f.id,
			title: f.title,
			release_date: f.release_date,
			poster_path: f.poster_path,
			genre_ids: f.genre_ids || []
		}));

		res.json(formatados);

	} catch (err) {
		console.error("erro tmdb:", err);
		res.status(500).json({ erro: "erro ao contactar tmdb" });
	}
};


// 3️⃣ importar tmdb
exports.importarTmdb = async (req, res) => {
	try {
		const filmes = await getPopularMovies();

		for (const f of filmes) {
			const ano = f.release_date?.slice(0, 4) || null;

			// Inserir filme na tabela filmes, se ainda não existir
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

			// Obter ID do filme inserido
			const filmeId = await new Promise((resolve, reject) => {
				db.query(`SELECT id FROM filmes WHERE tmdb_id = ?`, [f.id], (err, rows) => {
					if (err) reject(err);
					else resolve(rows[0].id);
				});
			});
		}

		res.json({ mensagem: "Filmes importados com sucesso! Filmes sem género foram ignorados." });

	} catch (err) {
		console.error("erro ao importar:", err);
		res.status(500).json({ erro: "erro ao importar filmes da tmdb" });
	}
};

// 4️⃣ detalhes por id
exports.getDetalhesFilme = async (req, res) => {
	const { id } = req.params;

	if (!id) return res.status(400).json({ erro: "id do filme é obrigatório." });

	try {
		const filme = await getMovieDetails(id);

		if (!filme) return res.status(404).json({ erro: "filme não encontrado." });

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
		console.error("erro ao obter detalhes do filme:", err);
		res.status(500).json({ erro: "erro ao obter detalhes do filme." });
	}
};

exports.getGenerosTmdb = async (req, res) => {
	try {
		const generos = await getMovieGenres();
		res.json(generos);
	} catch (err) {
		res.status(500).json({ erro: "erro ao obter géneros" });
	}
};
