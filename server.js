const express = require("express");
const app = express();
const path = require("path");

// banco de dados
const db = require("./db/connection");

// rotas
const authRoutes = require("./routes/authRoutes");
const filmesRoutes = require("./routes/filmesRoutes");
const seriesRoutes = require("./routes/seriesRoutes");
const reviewsRoutes = require("./routes/reviewsRoutes");

// middleware para json e dados urlencoded
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// servir arquivos estaticos da pasta public
app.use(express.static(path.join(__dirname, "public")));
//Montar rotas
app.use("/filmes", filmesRoutes);
app.use("/auth", authRoutes);
app.use("/series", seriesRoutes);
app.use("/reviews", reviewsRoutes);

// iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
	console.log(`servidor ativo em: http://localhost:${PORT}`);
});

// testar ligacao ao db
db.connect((err) => {
	if (err) {
		// log de erro se falhar
		console.error("erro ao conectar ao mysql:", err);
	} else {
		// log de sucesso se conectar
		console.log("conectado ao mysql com sucesso!");
	}
});

