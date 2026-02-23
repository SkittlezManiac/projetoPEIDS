const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "segredo123";

function autenticarToken(req, res, next) {
	const authHeader = req.headers['authorization'];
	if (!authHeader) return res.status(401).json({ erro: "token não fornecido" });

	const token = authHeader.split(' ')[1];
	if (!token) return res.status(401).json({ erro: "token inválido" });

	jwt.verify(token, JWT_SECRET, (err, user) => {
		if (err) return res.status(403).json({ erro: "token inválido ou expirado" });
		req.user = user; // coloca o payload do token no req.user
		next();
	});
}

module.exports = autenticarToken;
