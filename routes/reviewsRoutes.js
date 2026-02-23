const express = require("express");
const router = express.Router();
const reviewsController = require("../controllers/reviewsController");
const autenticarToken = require("../middlewares/authMiddleware");

// obter todas as reviews
router.get("/", reviewsController.getAllReviews);

// obter reviews por tipo e id
router.get("/:tipo/:id", reviewsController.getReviewsByConteudo);

// criar review (apenas utilizadores logados)
router.post("/", autenticarToken, reviewsController.createReview);

// votar como útil
router.put("/:id/voto", reviewsController.votarReview);

module.exports = router;
