const mysql = require('mysql2');

const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'gestao_filmes'
});

db.connect((err) => {
	if (err) {
		console.error(" Erro ao ligar à base de dados:", err);
		return;
	}
	console.log(" Ligação MySQL estabelecida.");
});

module.exports = db;
