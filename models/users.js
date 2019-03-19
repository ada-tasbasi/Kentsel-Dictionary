const mongoose = require("mongoose"),
      passportLocalMongoose = require("passport-local-mongoose");
      
const userSchema = new mongoose.Schema({
    username:String,
    password:String,
    entries:[
        {
            type: mongoose.Schema.Types.ObjectId,
            ref:"Entry"
        }
    ],
    hasLiked:[
            {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Entry"
            }
    ],
    hasDisliked:[
        {
                type:mongoose.Schema.Types.ObjectId,
                ref:"Entry"
            }
        ]
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);