const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/seriesController");

// obter todas as séries
router.get("/", seriesController.getAllSeries);

// populares tmdb
router.get("/tmdb/populares", seriesController.getPopularSeriesTmdb);

// géneros tmdb  ⬅️ TEM QUE VIR ANTES DO :id
router.get("/tmdb/generos", seriesController.getGenerosSeriesTmdb);

// importar da tmdb
router.post("/importar/tmdb", seriesController.importarSeriesTmdb);

// detalhes por id  ⬅️ ESTA TEM QUE SER A ÚLTIMA
router.get("/:id", seriesController.getDetalhesSerie);

module.exports = router;
