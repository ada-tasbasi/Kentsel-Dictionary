const express = require('express'),
      router = express.Router(),
      passport = require("passport"),
      createError = require('http-errors'),      
      User = require("../models/users"),
      middleware = require("../middleware/index");

router.get('/register', (req, res, next)=> {
  res.render("register");
});

router.post("/register", (req, res)=>{
    let newUser = new User({username:req.body.username});
    User.register(newUser, req.body.password,(err, user)=>{
        if(err){
            return res.render("error");
        }
        passport.authenticate("local")(req,res, ()=>{
            res.redirect("/entries");
        });
    });
});

router.get("/login", (req,res)=>{
    res.render("login");
});

router.post("/login", passport.authenticate("local", {
    successRedirect:"/entries",
    failureRedirect:"user/login"
    }), (req,res)=>{});

router.get("/logout", middleware.isLoggedIn, (req,res)=>{
    req.logout();
    res.redirect("/");
});

router.get("/:id/profile", (req,res, next)=>{
    User.findById(req.params.id).populate("entries").exec((err, profileUser)=>{
        if(err){
            return next(createError(404, "The user you were looking for doesn't exist!"));

        }else{
            res.render("profile", {user:profileUser}); 
        }
    });
});

module.exports = router;
