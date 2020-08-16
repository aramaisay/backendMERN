const {Schema, model, Types} = require('mongoose');

const Comment = new Schema({
    text:{type:String, required: true},
    post:{type:Types.ObjectId, ref:'Post', required:true},
    owner:{type:Types.ObjectId, ref:'User', required:true},
    ownerName:{type: String},
    ownerImg:{type: String, default: '../UserIcons/1.jpeg'},
},{
    timestamps:true
})

module.exports = model('Comment', Comment);