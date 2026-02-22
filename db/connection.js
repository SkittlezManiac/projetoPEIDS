const mysql = require('mysql2');

// criar ligação à base de dados
const db = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '1234',
	database: 'gestao_filmes'
});

// testar ligação
db.connect((err) => {
	if (err) {
		console.error("erro ao ligar à base de dados:", err);
		return;
	}
	console.log("ligação mysql estabelecida.");
});

module.exports = db;
