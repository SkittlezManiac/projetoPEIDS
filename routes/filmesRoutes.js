const express = require("express");
const router = express.Router();
const filmesController = require("../controllers/filmesController");

// obter todos os filmes
router.get("/", filmesController.getAllFilmes);

// obter populares da tmdb
router.get("/tmdb/populares", filmesController.getPopularTmdb);

// obter detalhes pelo id (sempre por último)
router.get("/:id", filmesController.getDetalhesFilme);

// obter géneros
router.get("/tmdb/generos", filmesController.getGenerosTmdb);

// importar filmes da tmdb
router.post("/importar/tmdb", filmesController.importarTmdb);


module.exports = router;
