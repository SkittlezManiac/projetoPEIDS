const express = require("express");
const router = express.Router();
const db = require("../db/connection");

// obter todas as reviews
router.get("/", (req, res) => {
	db.query("SELECT * FROM reviews", (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter reviews" });
		}
		res.json(results);
	});
});

// obter reviews de um filme ou série
router.get("/:tipo/:id", (req, res) => {
	const { tipo, id } = req.params;

	db.query(
		"SELECT * FROM reviews WHERE conteudo_id = ? AND tipo = ?",
		[id, tipo],
		(err, results) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ erro: "erro ao obter reviews" });
			}
			res.json(results);
		}
	);
});

// criar review
router.post("/", (req, res) => {
	const { nome_utilizador, conteudo, classificacao, critica } = req.body;

	if (!nome_utilizador || !conteudo || !classificacao || !critica) {
		return res.status(400).json({ erro: "todos os campos são obrigatórios" });
	}

	const query = `
		INSERT INTO reviews (nome_utilizador, conteudo, classificacao, critica)
		VALUES (?, ?, ?, ?)
	`;

	db.query(
		query,
		[nome_utilizador, conteudo, classificacao, critica],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ erro: "erro ao criar review" });
			}
			res.json({ mensagem: "review criada com sucesso!" });
		}
	);
});

// votar como útil
router.put("/:id/voto", (req, res) => {
	const { id } = req.params;

	db.query(
		"UPDATE reviews SET votos_utilidade = votos_utilidade + 1 WHERE id = ?",
		[id],
		(err) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ erro: "erro ao votar na review" });
			}
			res.json({ mensagem: "voto registado!" });
		}
	);
});

module.exports = router;
