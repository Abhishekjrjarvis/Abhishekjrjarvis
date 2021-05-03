const Campground = require('../models/campground');
const Review = require('../models/review');

module.exports.renderCreateReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    await campground.save();
    req.flash('success', 'Successfully Created new review');
    res.redirect(`/campgrounds/${campground._id}`);
}

module.exports.renderDeleteReview = async (req, res) => {
    const { id, rid } = req.params;
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: rid } });
    await Review.findByIdAndDelete(rid);
    req.flash('success', 'Successfully deleted review')
    res.redirect(`/campgrounds/${id}`);
}