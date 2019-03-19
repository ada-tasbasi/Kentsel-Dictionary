const mongoose = require("mongoose");

const entrySchema = new mongoose.Schema({
    title:String,
    content:String,
    author:{
        id:{
            type: mongoose.Schema.Types.ObjectId,
            ref:"User"
        },
        username:String
    },
    created: {type:Date, default:Date.now},
    likes:{type:Number, default:0}
});

module.exports = mongoose.model("Entry", entrySchema);