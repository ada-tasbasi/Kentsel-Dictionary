const createError = require('http-errors'),
      express = require('express'),
      path = require('path'),
      cookieParser = require('cookie-parser'),
      bodyParser = require("body-parser"),
      logger = require('morgan'),
      Entries = require("./models/entries"),
      passport = require("passport"),
      localStrategy = require("passport-local"),
      passportLocalMongoose = require("passport-local-mongoose"),
      methodOverride = require("method-override"),
      mongoose = require("mongoose"),
      expressSanitizer = require("express-sanitizer"),
      User = require("./models/users");

const app = express();

mongoose.connect('mongodb+srv://'/*mongocredentials*/'@clusterme-zfwj4.mongodb.net/KenstselSozluk?retryWrites=true', { useNewUrlParser: true });
mongoose.set('useFindAndModify', false);

app.use(bodyParser.urlencoded({extended:true}));

let indexRouter = require('./routes/index'),
    usersRouter = require('./routes/users'),
    entriesRouter = require('./routes/entries');


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, 'public')));
app.use(expressSanitizer());
app.use(require("express-session")({
    secret:"urbansozluk",
    resave:false,
    saveUninitialized:false
}));

app.use(passport.initialize());
app.use(passport.session());
passport.use(new localStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req,res,next)=>{
  res.locals.currentUser = req.user;
  next();
})

app.use("/", indexRouter);
app.use("/user", usersRouter);
app.use("/entries", entriesRouter);

// catch 404 and forward to error handler
app.use((req, res, next)=> {
  next(createError(404));
});

// error handler
app.use((err, req, res, next)=> {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

app.listen(process.env.PORT, process.env.IP, ()=>{
  console.log("Kentsel Sozluk has started");
})
