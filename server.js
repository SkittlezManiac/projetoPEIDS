const express = require("express");
const app = express();
const path = require("path");

//Banco de dados
const db = require("./db/connection");

//Rotas
const authRoutes = require("./routes/authRoutes");
const filmesRoutes = require("./routes/filmesRoutes");

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Arquivos estáticos
app.use(express.static(path.join(__dirname, "public")));

//Montar rotas
app.use("/auth", authRoutes);
app.use("/", filmesRoutes);


//Iniciar servidor
const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
    console.log(`Servidor ativo em: http://localhost:${PORT}`);
});

//testar conexão com DB
db.connect((err) => {
    if (err) {
        console.error("Erro ao conectar ao MySQL:", err);
    } else {
        console.log("Conectado ao MySQL com sucesso!");
    }
});
