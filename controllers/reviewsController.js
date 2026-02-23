const db = require("../db/connection");

// 🔹 obter todas as reviews
exports.getAllReviews = (req, res) => {
	const query = `
        SELECT r.*, u.name AS nome_utilizador
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        ORDER BY r.data_review DESC
    `;
	db.query(query, (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter reviews" });
		}
		res.json(results);
	});
};

// 🔹 obter reviews de um filme ou série
exports.getReviewsByConteudo = (req, res) => {
	const { tipo, id } = req.params;

	if (!["filme", "serie"].includes(tipo)) {
		return res.status(400).json({ erro: "tipo inválido" });
	}

	const query = `
        SELECT r.*, u.name AS nome_utilizador
        FROM reviews r
        JOIN users u ON r.user_id = u.id
        WHERE r.conteudo_id = ? AND r.tipo = ?
        ORDER BY r.data_review DESC
    `;

	db.query(query, [id, tipo], (err, results) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao obter reviews" });
		}
		res.json(results);
	});
};

// 🔹 criar review
exports.createReview = (req, res) => {
	const { conteudo_id, tipo, classificacao, critica } = req.body;

	// ✅ obter user_id do token (authMiddleware já popula req.user)
	const user_id = req.user?.id;
	if (!user_id) {
		return res.status(401).json({ erro: "tens de fazer login para enviar review" });
	}

	if (!conteudo_id || !tipo || classificacao == null || !critica) {
		return res.status(400).json({ erro: "todos os campos são obrigatórios" });
	}

	if (!["filme", "serie"].includes(tipo)) {
		return res.status(400).json({ erro: "tipo inválido" });
	}

	const query = `
        INSERT INTO reviews
        (user_id, conteudo_id, tipo, classificacao, critica)
        VALUES (?, ?, ?, ?, ?)
    `;

	db.query(query, [user_id, conteudo_id, tipo, classificacao, critica], (err) => {
		if (err) {
			console.error(err);
			return res.status(500).json({ erro: "erro ao criar review" });
		}
		res.json({ mensagem: "review criada com sucesso!" });
	});
};

// 🔹 votar como útil
exports.votarReview = (req, res) => {
	const { id } = req.params;

	db.query(
		"UPDATE reviews SET votos_utilidade = votos_utilidade + 1 WHERE id = ?",
		[id],
		(err, result) => {
			if (err) {
				console.error(err);
				return res.status(500).json({ erro: "erro ao votar na review" });
			}

			if (result.affectedRows === 0) {
				return res.status(404).json({ erro: "review não encontrada" });
			}

			res.json({ mensagem: "voto registado!" });
		}
	);
};
