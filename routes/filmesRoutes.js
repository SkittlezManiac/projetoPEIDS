const express = require("express");
const router = express.Router();
const filmesController = require("../controllers/filmesController");

router.get("/", filmesController.getAllFilmes);
router.get("/tmdb/populares", filmesController.getPopularTmdb);
router.get("/tmdb/generos", filmesController.getGenerosTmdb);
router.post("/importar/tmdb", filmesController.importarTmdb);
router.get("/:id/trailer", filmesController.getTrailerFilme);
router.get("/:id", filmesController.getDetalhesFilme);

module.exports = router;
