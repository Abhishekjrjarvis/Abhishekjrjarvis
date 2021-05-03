const express = require('express');
const router = express.Router({ mergeParams: true });
const { validateReview, isLoggedIn, isReviewAuthor } = require('../middleware');
const Campground = require('../models/campground');
const Review = require('../models/review');
const reviews = require('../controllers/reviews');
const catchAsync = require('../Utilities/catchAsync');

router.post('/', isLoggedIn, validateReview, catchAsync(reviews.renderCreateReview))

router.delete('/:rid', isLoggedIn, isReviewAuthor, catchAsync(reviews.renderDeleteReview))

module.exports = router;