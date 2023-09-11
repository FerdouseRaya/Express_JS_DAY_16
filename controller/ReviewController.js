const mongoose = require("mongoose");
const { validationResult } = require("express-validator");
const { success, failure } = require("../util/common");
const ReviewModel = require("../model/Review");
const UserModel = require("../model/User");
const ProductModel = require("../model/Product");

class Review {
  async addReview(req, res) {
    const { user, product, review, rating } = req.body;
    let checkUser = await UserModel.findOne({ _id: user });
    if (!checkUser) {
      res.status(404).send(failure("Create Account first"));
    }

    let checkProduct = await ProductModel.findOne({ _id: product });
    if (!checkProduct) {
      res.status(404).send(failure("Product Not Found!"));
    }

    const newReview = new ReviewModel({
      user: user,
      product: product,
      review: review,
      rating: rating,
    });

    const savedReview = await newReview.save();
    const productUpdated = await ProductModel.findByIdAndUpdate(
      product,
      {
        $push: {
          reviews: {
            reviewId: savedReview._id,
            reviewContent: review,
          },
        },
      },
      { new: true }
    );
    console.log(productUpdated);
    res.status(200).send(success("Review Added", productUpdated));
  }

  async updateReview(req, res) {
    const { user, review } = req.body;
    const reviewId = req.params.id;
    const existingReview = await ReviewModel.findById(reviewId);
    if (!existingReview) {
      res.status(404).send(failure("Review does not exists."));
    }

    if (existingReview.user.toString() !== user) {
      res
        .status(404)
        .send(failure("Unauthorized User,You can not update the review!"));
    }

    existingReview.reviews = review;
    console.log(existingReview.reviews);

    const updateReview = await existingReview.save();
    console.log(updateReview);
    await ProductModel.updateOne(
      { _id: existingReview.product, "reviews.reviewId": reviewId },
      {
        $set: {
          "reviews.$.reviewContent": review,
        },
      }
    );
    res.status(200).send(success("Review Updated successfully", updateReview));
  }

  async deleteReview(req, res) {
    const { user, product } = req.body;
    const reviewID = req.params.id;
    const review = await ReviewModel.findById(reviewID);
    if (!review) {
      res.status(404).send(failure("Review dose not exists!"));
    }

    if (review.user.toString() !== user) {
      res
        .status(400)
        .send(failure("Unauthorized User,You can not delete the review!"));
    }

    const checkProduct = await ProductModel.findById(product);
    if (!checkProduct) {
      res.status(404).send(failure("Associated Product not found!"));
    }

    await ReviewModel.findByIdAndDelete(reviewID);
    await ProductModel.findByIdAndUpdate(
      review.product,
      {
        $pull: { reviews: { reviewId: review._id } },
      },
      { new: true }
    );
    res.status(200).send(failure("Review Deleted Successfully!"));
  }
}

module.exports = new Review();
