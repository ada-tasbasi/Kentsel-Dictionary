const express = require("express"),
      router = express.Router(),
      middleware = require("../middleware/index"),
      User = require("../models/users"),
      createError = require('http-errors'),      
      Entries = require("../models/entries");
      

router.get("/", (req,res)=>{
    Entries.countDocuments({}, (err, count)=>{
        if(err){
            res.redirect("back");
        }else{    
            Entries.find({}, (err, entry)=>{
                if(err){
                    res.redirect("back");
                }else{
                    entry.sort((a,b)=>{
                        return b.likes-a.likes;
                    });
                    res.render("entries/entries", {entries:entry, pageNum:count/10});
                }
            }).limit(10);
        }    
    });
});

router.post("/", middleware.isLoggedIn, (req,res)=>{
    let title = req.sanitize(req.body.title?req.body.title:req.headers.referer.split("/")[4]);
    let content = req.sanitize(req.body.content),
        author = {
            id: req.user.id,
            username: req.user.username
        },
        newEntry = {title:title, content:content, author:author};
    Entries.create(newEntry, (err, entry)=>{
        if(err){
            res.redirect("/");
        }else{
            User.findById(req.user._id, (err,user)=>{
               if(err){
               res.render("error");
               }else{
                   user.entries.push(entry);
                   user.save();
                   res.redirect(`/entries/${title}`);
               }
            });
        }
    });      
});

router.get("/page/:number", (req,res)=>{
    let skipNum = req.params.number-1;    
    Entries.countDocuments({}, (err, count)=>{
        if(err){
            res.redirect("back");
        }else{    
            Entries.find({}, (err, entry)=>{
                if(err){
                    res.redirect("back");
                }else{
                     entry.sort((a,b)=>{
                        return b.likes-a.likes;
                    });
                    res.render("entries/entries", {entries:entry, pageNum:Math.ceil(count/10)});
                }
            }).limit(10).skip(skipNum*10);
        }    
    });
});

router.get("/:title", (req,res, next)=>{
    let title = req.query.title?req.query.title:req.params.title;
    Entries.find({title:title}, (err, entry)=>{
        if(err || entry.length==0){
           return next(createError(404, "The entry you were looking for doesn't exist!"));
        }else{
            res.render("entries/entry", {entry:entry});
        }
    });
});


router.get("/search", (req,res, next)=>{
    let search = req.body.title;
    Entries.countDocuments({title:search}, (err,count)=>{
        if(err){
           return next(createError(404, "The entry you were searching for doesn't exist!"));
        }else{
            if(count>0){
                res.redirect(`/entries/${search}`);            
            }else{
                res.send("No entries found for your search!");
            }
        }
    });
});

router.get("/:id/edit",middleware.checkEntryOwnsership, (req,res)=>{
    Entries.findById(req.params.id, (err, entry)=>{
        if(err){
            return res.redirect("back");
        }else{
            res.render("entries/edit", {entry:entry});
        }
    });
});

router.put("/:id",middleware.checkEntryOwnsership, (req,res)=>{
    Entries.findByIdAndUpdate(req.params.id, {content:req.sanitize(req.body.content)}, (err, updatedEntry)=>{
        if(err){
            return res.redirect("back");
        }else{
            res.redirect("/entries/");
        }
    });
});

router.put("/:id/like", middleware.wasLikedByUser, (req,res)=>{
    const action = req.body.action,
              counter = action === "like"?1:-1;
        Entries.findByIdAndUpdate(req.params.id, {$inc: {likes: counter}}, (err, updatedEntry)=>{
            if(err){
                res.render("error");
            }else{
                User.findById(req.user._id, (err, user)=>{
                    if(err){
                        res.redirect("/user/register");
                    }else{
                        if(counter==1){
                            if(user.hasDisliked.map(disliked=>disliked.toString()).includes(String(updatedEntry._id))){
                                user.hasDisliked.remove(updatedEntry);
                                user.hasLiked.push(updatedEntry);
                                user.save();
                            }else{
                                user.hasLiked.push(updatedEntry);
                                user.save();
                            }
                        }else{
                             if(user.hasLiked.map(liked=>liked.toString()).includes(String(updatedEntry._id))){
                                user.hasLiked.remove(updatedEntry);
                                user.hasDisliked.push(updatedEntry);
                                user.save();
                             }else{
                                 user.hasDisliked.push(updatedEntry);
                                 user.save();
                             }
                        }
                    }
                });
                res.json(updatedEntry);
            }
        });
});


router.delete("/:id",middleware.checkEntryOwnsership, (req,res)=>{
    Entries.findByIdAndRemove(req.params.id, (err)=>{
        if(err){
            res.render("error");
        }else{
            res.redirect("/entries/");
        }
    });
});

module.exports = router;