const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// chave para criar tokens
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

// registar utilizador
router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password)
		return res.status(400).json({ erro: "preenche todos os campos." });

	try {
		// criar hash da password
		const hashed = await bcrypt.hash(password, 10);

		// inserir utilizador na base de dados
		const queryReal = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
		db.query(queryReal, [name, email, hashed], (err) => {
			if (err) {
				// log de erro e devolver 500
				console.log(err);
				return res.status(500).json({ erro: "email já registado ou erro no servidor." });
			}
			res.json({ mensagem: "conta criada com sucesso!" });
		});

	} catch (err) {
		// log de erro e devolver 500
		console.log(err);
		res.status(500).json({ erro: "erro no servidor." });
	}
});

// login de utilizador
router.post("/login", (req, res) => {
	const { email, password } = req.body;

	if (!email || !password)
		return res.status(400).json({ erro: "preenche o email e password." });

	const query = "SELECT * FROM users WHERE email = ?";

	db.query(query, [email], async (err, results) => {
		if (err) return res.status(500).json({ erro: "erro no servidor." });
		if (results.length === 0) return res.status(400).json({ erro: "email não encontrado." });

		const user = results[0];

		// comparar password com hash
		const passMatch = await bcrypt.compare(password, user.password);
		if (!passMatch) return res.status(400).json({ erro: "password incorreta." });

		// criar token jwt
		const token = jwt.sign(
			{ id: user.id, name: user.name, email: user.email },
			JWT_SECRET,
			{ expiresIn: "3h" }
		);

		// devolver token e dados do utilizador
		res.json({
			mensagem: "login efetuado com sucesso!",
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email
			}
		});
	});
});

module.exports = router;
