const express = require("express");
const router = express.Router();
const seriesController = require("../controllers/seriesController");

router.get("/", seriesController.getAllSeries);
router.get("/tmdb/populares", seriesController.getPopularSeriesTmdb);
router.get("/tmdb/generos", seriesController.getGenerosSeriesTmdb);
router.post("/importar/tmdb", seriesController.importarSeriesTmdb);
router.get("/:id/trailer", seriesController.getTrailerSerie);
router.get("/:id", seriesController.getDetalhesSerie);

module.exports = router;
