const express = require("express");
const routes = express();
const ReviewController = require("../controller/ReviewController");
const { isAuthorized } = require("../middleware/auth");

routes.post("/addReview", isAuthorized, ReviewController.addReview);
routes.delete("/deleteReview/:id", ReviewController.deleteReview);
routes.patch("/updateReview/:id", ReviewController.updateReview);

module.exports = routes;
