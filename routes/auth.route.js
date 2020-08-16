const { Router } = require('express');
const router = Router();
const config = require('config');
const PrivateKey = config.get('PrivateKey');
//module for hashing passwords see:https://www.npmjs.com/package/bcrypt
const bcrypt = require('bcrypt');
//module for checking the sent data from front-end see:https://express-validator.github.io/docs/
const { body, validationResult, check } = require('express-validator');
//module for jsonwebtoken
const jwt = require('jsonwebtoken');
//mongoose schema
const User = require('../models/User');
const Comment = require('../models/Comment');
const Post = require('../models/Post');
//mail
const nodemailer = require('nodemailer');
const sendgrid = require('nodemailer-sendgrid-transport');

// const transporter = nodemailer.createTransport(sendgrid({
//     auth:{api_key:config.get('MailerKey')}
// }));

//configuring register on path /api/auth/register
router.post(
    '/register',
    [
        body('username').isString().isLength({min:3, max:50}).isLowercase().withMessage('username has to be lowercase with its min lenngth of 3 and max length of '),
        body('email').isEmail().normalizeEmail().withMessage('You didn\'t write an email'),
        body('password').isString().isLength({min:6}).withMessage('Password has to have min length of 6'),
        body('bio').isString().isLength({min:20, max:120}).withMessage('min length of bio should be 20 and max value should to be 120'),
    ], 
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg})
    }
    //getting data from body
    const {username, email, password, imageUrl, bio} = req.body;
    //finding if there is a user with the sent email or username
    const candidateByEmail = await User.findOne({email});
    const candidateByUsername = await User.findOne({username});
    //if they exist
    if(candidateByEmail || candidateByUsername){
        return res.status(400).json({message: "There is a user with that email or username.Try again"});
    }
    //hashing the password
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = {username, email, password: hashedPassword, imageUrl, bio};
    const newUser = new User(user);
    await newUser.save();
    // await transporter.sendMail({
    //     to: email,
    //     from: 'aramayis.y.y@tumo.org',
    //     text: 'hello',
    //     html: `<h1>you are dumb</h1>`,
    //     subject: 'You registered',
    // })
    res.status(200).json({message: 'New User created'});
    }catch(err){
        res.status(400).json({message: "Smth. went wrong try again after few seconds"});
    }
});

//Login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('You didn\'t write an email'),
        body('password').isString().isLength({min:6}).withMessage('Password has to have min length of 6'),
    ], 
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {email, password} = req.body;
    //checkingif there is a user with that email
    const candidate = await User.findOne({email});
    if(!candidate){
        return res.status(400).json({message: "There is no user with that email"});
    }
    //checking if the password is correct
    const hasAcces = await bcrypt.compare(password, candidate.password);
    if(!hasAcces){
        return res.status(400).json({message: "You wrote a wrong password"});
    }
    //creating a jwt
    const token = await jwt.sign({ id:candidate._id, username:candidate.username },PrivateKey,{expiresIn:'12h'});
    res.status(200).json({token,id:candidate._id,message: "successfully logged the user"})
    }catch(err){
    res.status(400).json({message: "Smth. went wrong try again after few seconds"});
    }
})

//Update
router.put(
    '/:id',
    [
        body('username').isString().isLength({min:3, max:50}).isLowercase().withMessage('username has to be lowercase with its min lenngth of 3 and max length of '),
        body('email').isEmail().normalizeEmail().withMessage('You didn\'t write an email'),
        body('password').isString().isLength({min:6}).withMessage('Password has to have min length of 6'),
        body('bio').isString().isLength({min:20, max:120}).withMessage('min length of bio should be 20 and max value should to be 120'),
        check('id').exists().withMessage('invalid id')
    ],
    async (req,res)=>{
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg})
    }
    //getting data from body
    const {username, email, password, imageUrl, bio} = req.body;
    // getting id from params
    const {id} = req.params;
    //finding if there is a user with the sent email
    const candidate = await User.findById(id);
    // //checking if the password is correct
    // const hasAcces = await bcrypt.compare(password, candidate.password);
    // if(!hasAcces){
    //     return res.status(400).json({message: "You wrote a wrong password"});
    // }
    candidate.username = username;
    candidate.email = email;
    candidate.bio = bio;
    candidate.imageUrl = imageUrl;
    // creating hashed password
    const hashedPassword = await bcrypt.hash(password,12);
    candidate.password = hashedPassword;
    await candidate.save();
    // Getting posts of the user
    const PostsOfTheUser = await Post.find({owner:candidate._id});
    const CommentsOfTheUser = await Comment.find({owner:candidate._id});
    // updating the Imgs and Names of the Posts
    PostsOfTheUser.forEach(async (item) => {
        item.ownerImg = candidate.imageUrl;
        item.ownerName = candidate.username;
        await item.save();
    });
    // updating the Imgs and Names of the Comments
    CommentsOfTheUser.forEach(async (item) => {
        item.ownerImg = candidate.imageUrl;
        item.ownerName = candidate.username;
        await item.save();
    });

    res.status(200).json({message:"User Updated"});
    }
    catch(err){
    res.status(400).json({message: "Smth. went wrong try again after few seconds"});
    }
    }
);
//Get
router.get(
    '/user/:id',
    [
        check('id').exists()
    ],
    async (req,res)=>{
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg})
    }
    const {id} = req.params;
    const candidate = await User.findById(id);
    if(!candidate){
        return res.status(400).json({message:"there is no user with that id"});
    }
    return res.status(200).json({message:"user found", data:candidate});
    }
    catch(err){
    res.status(400).json({message: "Smth. went wrong try again after few seconds"});
    
    }
    }
)

module.exports = router;
// 5f0e3cb34402232370b217e3 - user
//  - post