// importing models
const Comment = require('../models/Comment');
const Post = require('../models/Post');
const User = require('../models/User');
// importing router
const {Router} = require('express');
const router = Router();
// importing express validator
const {validationResult, body, check} = require('express-validator');

// api/comment
// creating
router.post(
    '/create',
    [
    body('text').isString().isLength({min:2}).withMessage('Minimal length of the text is 2 '),
    body('post').exists().withMessage('you sent wrong id for the post'),
    body('owner').exists().withMessage('you sent wrong id for the user'),
    ],
    async (req,res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    //gettong the data
    const {text,post,owner} = req.body;
    // finding if there is a post with that id
    const postCandidate = await Post.findById(post);
    if(!postCandidate){
        return res.status(400).json({message: "There is no post with that id"});
    }
    //finding if there is a user with that id
    const userCandidate = await User.findById(owner);
    if(!userCandidate){
        return res.status(400).json({message: "There is no user with that id"});
    }
    // creating a new comment
    const newComment = new Comment({text, owner, post,ownerName:userCandidate.username,ownerImg:userCandidate.imageUrl});
    // saving
    await newComment.save();
    // getting the posts comment and adding new comment id to it
    const postComments = [...postCandidate.comments];
    postComments.push(newComment._id);
    postCandidate.comments = postComments;
    // saving the modified post
    await postCandidate.save();
    // returning the message
    return res.status(200).json({message:"new comment created"})
    }
    catch(err){
    return res.status(400).json({message:`smth went wrong Err:${err}`});
    }
})
// deleting
router.delete(
    '/:id',
    [
        check('id').exists().withMessage('id is invalid')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    // getting the id
    const {id} = req.params;
    // checking the id of the comment
    const candidate = await Comment.findById(id);
    // getting the post
    const postCandidate = await Post.findById(candidate.post);
    //filtering the comments arr
    const filteredComments = postCandidate.comments.filter((value,index)=>{return value === candidate._id});
    postCandidate.comments = filteredComments;
    await candidate.deleteOne();
    await postCandidate.save();
    return res.status(200).json({message:"Deleted the comment"})
    }
    catch(err){
    return res.status(400).json({message:`smth went wrong Err:${err}`});
    }
    });
// updating
router.put(
    '/:id',
    [
        check('id').exists().withMessage('invalid id'),
        body('text').isString().isLength({min:2}).withMessage('Minimal length of the text is 2 ')
    ],
    async (req, res) => { 
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {id} = req.params;
    const {text} = req.body;
    const candidate = await Comment.findById(id)
    if(!candidate){
        return res.status(400).json({message: "no comment with that id"});
    }
    candidate.text = text;
    await candidate.save();
    return res.status(200).json({message: "updated successfully"});
    }
    catch(err){
    return res.status(400).json({message:`smth went wrong Err:${err}`});
    }
    }
);
// getting the comments for that post
router.get(
    '/post/:id',
    [
        check('id').exists().withMessage('invalid id')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    // getting the post id
    const {id} = req.params;
    // getting the comments for the post
    const comments = await Comment.find({post:id}).sort({updatedAt:'desc'});
    // returning the posts
    return res.status(200).json({message: "comments found", data: comments});
    }
    catch(err){
    return res.status(400).json({message:`smth went wrong Err:${err}`});
    }
    })

module.exports = router;