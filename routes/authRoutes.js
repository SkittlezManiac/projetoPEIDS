const express = require("express");
const router = express.Router();
const db = require("../db/connection");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//Chave para token
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

//Registar user
router.post("/register", async (req, res) => {
	const { name, email, password } = req.body;

	if (!name || !email || !password)
		return res.status(400).json({ erro: "Preenche todos os campos." });

	try {
		//Hash da senha
		const hashed = await bcrypt.hash(password, 10);

		//Inserção real do usuário vindo do frontend
		const queryReal = `INSERT INTO users (name, email, password) VALUES (?, ?, ?)`;
		db.query(queryReal, [name, email, hashed], (err) => {
			if (err) {
				console.log(err);
				return res.status(500).json({ erro: "Email já registado ou erro no servidor." });
			}
			res.json({ mensagem: "Conta criada com sucesso!" });
		});

	} catch (err) {
		console.log(err);
		res.status(500).json({ erro: "Erro no servidor." });
	}
});

//Login
router.post("/login", (req, res) => {
	const { email, password } = req.body;

	if (!email || !password)
		return res.status(400).json({ erro: "Preenche o email e password." });

	const query = "SELECT * FROM users WHERE email = ?";

	db.query(query, [email], async (err, results) => {
		if (err) return res.status(500).json({ erro: "Erro no servidor." });
		if (results.length === 0) return res.status(400).json({ erro: "Email não encontrado." });

		const user = results[0];

		const passMatch = await bcrypt.compare(password, user.password);
		if (!passMatch) return res.status(400).json({ erro: "Password incorreta." });

		// Criar token JWT
		const token = jwt.sign(
			{ id: user.id, name: user.name, email: user.email },
			JWT_SECRET,
			{ expiresIn: "3h" }
		);

		res.json({
			mensagem: "Login efetuado com sucesso!",
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
