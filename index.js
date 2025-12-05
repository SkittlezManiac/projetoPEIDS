const express = require('express');
const mysql = require('mysql2');
const path = require('path');
const axios = require('axios');

const app = express();
app.use(express.json());
app.use(express.static('public'));

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'gestao_filmes'
});

db.connect((err) => {
	if (err) {
		console.error("Erro ao conectar ao MySQL:", err);
		process.exit(1);
	}
	console.log("Conectado ao MySQL com sucesso!");
});

const TMDB_API_KEY = "eyJhbGciOiJIUzI1NiJ9.eyJhdWQiOiJiMjRhY2E5YTA3ZGFkNjIxMmEwYWQzMDQ3YjVmZDA4MiIsIm5iZiI6MTc2NDkwMTUzMi44MDgsInN1YiI6IjY5MzI0MjljMzQ3OGZjOGI1NTAyZDc2YiIsInNjb3BlcyI6WyJhcGlfcmVhZCJdLCJ2ZXJzaW9uIjoxfQ.KTK91SALVqLj9YekHHoDgjzSZraCD1j7kcbRR9aa32w";

const tmdb = axios.create({
	baseURL: "https://api.themoviedb.org/3",
	headers: {
		Authorization: `Bearer ${TMDB_API_KEY}`,
		accept: "application/json"
	}
});

app.get('/api', (req, res) => {
	res.json({ status: "API ativa e a funcionar" });
});

app.get('/api/filmes', (req, res) => {
	const query = "SELECT * FROM filmes";
	db.query(query, (err, result) => {
		if (err) {
			console.error("Erro ao obter filmes: ", err);
			return res.status(500).json({ erro: "Erro ao obter filmes" });
		}
		res.json(result);
	});
});

app.get("/api/tmdb/populares", async (req, res) => {
	try {
		const response = await tmdb.get("/movie/popular");
		const filmes = response.data.results.map(f => ({
			title: f.title,
			release_date: f.release_date,
			poster_path: f.poster_path
		}));
		res.json(filmes);
	} catch (err) {
		console.error("Erro ao contactar TMDB:", err);
		res.status(500).json({ erro: "Erro ao ligar à API TMDB" });
	}
});

app.post("/api/importar/tmdb", async (req, res) => {
	try {
		const response = await tmdb.get("/movie/popular");
		const filmes = response.data.results;

		const promises = filmes.map(f => {
			return new Promise((resolve, reject) => {
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
				], (err) => {
					if (err) return reject(err);
					resolve();
				});
			});
		});

		await Promise.all(promises);
		res.json({ mensagem: "Filmes importados com sucesso!" });
	} catch (err) {
		console.error("Erro ao importar filmes:", err.response?.data || err.message);
		res.status(500).json({ erro: "Erro ao importar filmes da TMDB" });
	}
});

const PORT = 8080;
app.listen(PORT, () => {
	console.log(`Servidor ativo em: http://localhost:${PORT}`);
});
