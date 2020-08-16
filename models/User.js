const {Schema, model} = require('mongoose');

const User = new Schema({
    username:{type: String, minlength: 3, maxlength: 50, required: true, unique: true, lowercase: true},
    email:{type: String, required: true, unique: true},
    password:{type: String, required: true},
    imageUrl:{type: String, default: '../UserIcons/1.jpeg'},
    bio:{type: String, minlength: 20, maxlength: 120}
},{
    timestamps:true
})

module.exports = model('User', User);