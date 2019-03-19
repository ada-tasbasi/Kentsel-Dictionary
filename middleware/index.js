const Entries = require("../models/entries"),
      createError = require('http-errors'),      
      Users = require("../models/users");
      
function checkEntryOwnsership(req,res,next){
    if(req.isAuthenticated()){
        Entries.findById(req.params.id, (err, foundEntry)=>{
            if(err){
                res.redirect("/entries");
            }else{
                if(foundEntry.author.id.equals(req.user.id)){
                    next();
                }else{
                    res.redirect("back");
                }
            }
        })
    }else{
        res.redirect("/entries");
    }
}

function wasLikedByUser(req,res,next){
    if(req.isAuthenticated()){
        const counter = req.body.action === "like"?1:-1;
            Entries.findById(req.params.id, (err, foundEntry)=>{
                    if(err){
                        res.render("error");
                    }else{
                        Users.findById(req.user._id, (err, user)=>{
                            if(err){
                                res.render("error");
                            }else{
                                if(user.hasLiked.map(liked=>liked.toString()).includes(String(foundEntry._id))&&counter == 1){
                                    let entryFromMiddle = Object.assign(foundEntry._doc, {from:"middle"});
                                    return res.json(entryFromMiddle);
                                }else if(user.hasDisliked.map(disliked=>disliked.toString()).includes(String(foundEntry._id))&&counter == -1){
                                    let entryFromMiddle = Object.assign(foundEntry._doc, {from:"middle"});
                                    return res.json(foundEntry);
                                }else{
                                    return next();
                                }
                            }        
                        });
                        
                    }
            });
    }        
}


function isLoggedIn(req,res,next){
    if(req.isAuthenticated()){
        return next();
    }else{
        res.redirect("back");
    }
}

const midAuthenticators = {
    checkEntryOwnsership,
    wasLikedByUser,
    isLoggedIn
};

module.exports = midAuthenticators;