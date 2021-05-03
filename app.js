if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config();
}
// console.log(process.env.SECRET)
// require('dotenv').config();

const express = require('express');
const path = require('path');
const app = express();
const mongoose = require('mongoose');
const methodOverride = require('method-override');
const engine = require('ejs-mate');
const session = require('express-session');
const flash = require('connect-flash');
const YelpCampError = require('./Utilities/YelpCampError')
const campgorundRoutes = require('./routes/campground');
const reviewRoutes = require('./routes/review');
const userRoutes = require('./routes/users');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user')
const mongoSanitize = require('express-mongo-sanitize');
const helmet = require('helmet');
const MongoStore = require('connect-mongo');


const dbUrl = process.env.DB_URL ||  'mongodb://localhost:27017/make_yelpCamp';



mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
});



const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
    console.log('DataBase Connected');
});

const secret = 'process.env.SECRET' || 'Thisismyyelpcampsecret'

const store = new MongoStore({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
})

store.on('error', function(e) {
    console.log('error', e)
})

const sessionConfig = {
    store,
    secret,
    name: 'session',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 + 60 * 60 * 24 * 7
    }
}

app.use(session(sessionConfig))


app.use(flash());
app.use(mongoSanitize());
app.use(helmet({contentSecurityPolicy:false}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());



app.use((req, res, next) => {
    res.locals.currentUser = req.user;
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error')
    next();
})

app.locals.moment = require('moment');


app.engine('ejs', engine);
app.set('view engine', 'ejs');
app.set("views", path.join(__dirname, "/views"));
app.use(express.static(path.join(__dirname, '/public')));
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use('/campgrounds', campgorundRoutes)
app.use('/campgrounds/:id/reviews', reviewRoutes);
app.use('/user', userRoutes)




app.get('/', (req, res) =>{
    res.render('home')
})


app.all('*', (req, res, next) => {
    next(new YelpCampError('Page Not Found', '404'));
})

app.use((err, req, res, next) => {
    const { status = 500, message = 'SOMETHING WENT WRONG....' } = err
    res.status(status).render('error', { err });
})

const port = process.env.PORT || 3000 

app.listen(port, () => {
    console.log(`Serving on Port ${port}`);
})