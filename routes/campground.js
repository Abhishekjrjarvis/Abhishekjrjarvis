const express = require('express');
const router = express.Router();
const campgrounds = require('../controllers/campgrounds');
const catchAsync = require('../Utilities/catchAsync');
const { isLoggedIn, isAuthor, validateCampground } = require('../middleware');
const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const Campground = require('../models/campground');

router.route('/')
    .get(catchAsync(campgrounds.index))
    .post(isLoggedIn, upload.array('image'), validateCampground, catchAsync(campgrounds.renderCreateCampground))


router.get('/new', isLoggedIn, campgrounds.renderNewCampground)

router.get('/:id/edit', isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditCampground))

router.route('/:id')
    .get(catchAsync(campgrounds.renderShowCampground))
    .put(isLoggedIn, isAuthor, upload.array('image'), validateCampground, catchAsync(campgrounds.renderUpdateCampground))
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.renderDeleteCampground));




module.exports = router;