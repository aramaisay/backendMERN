const {Router} = require('express');
const router = Router();
const {body, check, validationResult} = require('express-validator');
const Post = require('../models/Post');
const User = require('../models/User');

//Create
router.post(
    '/create',
    [
        body('title').isString().isLength({min:3, max:100}).withMessage('Title should be between 3 and 100 charecters long'),
        body('description').isString().isLength({min:30}).withMessage('Descrioption should be at least 30 charecters long'),
        body('imgUrl').isString().exists().withMessage('imgUrl should exist'),
        // body('upvotes').isString().withMessage(''),
        // body('downvotes').isString().withMessage(''),
        // body('total').isString().withMessage(''),
        body('owner').isString().exists().withMessage('id of owner should be valid'),
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    //getting the data
    const {title,description,imgUrl,/*upvotes,downvotes,total,*/owner} = req.body;
    //checing the user id
    const candidate = await User.findById(owner);
    if(!candidate){
        return res.status(400).json({message: 'There is no user with that id'})
    }
    //creating new post
    const newPost = new Post({title,description,imgUrl,owner,ownerName: candidate.username,ownerImg:candidate.imageUrl});
    //saving the new post
    await newPost.save();
    return res.status(200).json({message: "New Posts added"});
    }catch(err){
        res.status(400).json({message: `Err: ${err}`});
    }
    });

//Delete
router.delete(
    '/:id',
    [
        check('id').exists().withMessage('You sent invalid id')
    ],
    async (req,res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    //getting id
    const {id} = req.params;
    await Post.findByIdAndDelete(id);
    return res.status(200).json({message: "Post deleted"});

    }catch(err){
        res.status(400).json({message: `Err: ${err}`});
    }
    }
);
// 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 ID: xRqTwl7FSUmYc_SDkpyi4A
//upvote
router.post(
    '/upvote',
    [
        body('postId').exists().withMessage('You have sent invalid id for the post'),
        body('userId').exists().withMessage('You have sent invalid id for the user'),
    ],
    async (req,res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {postId, userId} = req.body;
    //checking for the user 
    const userCandidate = await User.findById(userId);
    if(!userCandidate){
        return res.status(400).json({message: 'No user with that Id'});
    }
    //checing for the post
    const postCandidate = await Post.findById(postId);
    if(!postCandidate){
        return res.status(400).json({message: 'No post with that Id'});
    }
    let isAlreadyUpvoted = false;
    //checking if you have already upvoted the post
    postCandidate.upvotes.map((item) => {
        if(item == userId){
            isAlreadyUpvoted = true;
        }
    });
    if(isAlreadyUpvoted){
        return res.status(200).json({message: 'You have already upvoted the post'});
    }
    postCandidate.downvotes.map((item, index) => {
        if(item == userId){
            postCandidate.downvotes.splice(index, 1);
        }
    })
    postCandidate.upvotes.push(userId);
    postCandidate.total = postCandidate.upvotes.length - postCandidate.downvotes.length;
    await postCandidate.save();
    res.status(200).json({message: "You upvoted the post"})
    }catch(err){
        res.status(400).json({message: `Err: ${err}`});
    }
    });
//downvote
router.post(
    '/downvote',
    [
        body('postId').exists().withMessage('You have sent invalid id for the post'),
        body('userId').exists().withMessage('You have sent invalid id for the user'),
    ],
    async (req,res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {postId, userId} = req.body;
    //checking for the user 
    const userCandidate = await User.findById(userId);
    if(!userCandidate){
        return res.status(400).json({message: 'No user with that Id'});
    }
    //checing for the post
    const postCandidate = await Post.findById(postId);
    if(!postCandidate){
        return res.status(400).json({message: 'No post with that Id'});
    }
    let isAlreadyDownvoted = false;
    //checking if you have already upvoted the post
    postCandidate.downvotes.map((item) => {
        if(item == userId){
            isAlreadyDownvoted = true;
        }
    });
    if(isAlreadyDownvoted){
        return res.status(200).json({message: 'You have already downvoted the post'});
    }
    postCandidate.upvotes.map((item, index) => {
        if(item == userId){
            postCandidate.upvotes.splice(index, 1);
        }
    })
    postCandidate.downvotes.push(userId);
    postCandidate.total = postCandidate.upvotes.length - postCandidate.downvotes.length;
    await postCandidate.save();
    res.status(200).json({message: "You downvoted the post"})
    }catch(err){
        res.status(400).json({message: `Err: ${err}`});
    }
    });
//update
router.put(
    '/',
    [
        body('title').isString().isLength({min:3, max:100}).withMessage('Title should be between 3 and 100 charecters long'),
        body('description').isString().isLength({min:30}).withMessage('Descrioption should be at least 30 charecters long'),
        body('imgUrl').isString().exists().withMessage('imgUrl should exist'),
        body('postId').exists().withMessage('You have sent invalid id')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    //getting the values
    const {title, description, imgUrl, postId} = req.body;
    //checking if there is a post with that id
    const candidate = await Post.findById(postId);
    if(!candidate){
        return res.status(400).json({message: 'No post found'});
    }
    candidate.title = title;
    candidate.description = description;
    candidate.imgUrl = imgUrl;
    await candidate.save();
    return res.status(200).json({message: 'Post updated'});
    }
    catch(err){
        res.status(400).json({message: `Err: ${err}`});
    }
    });

//get all posts by date of creation
router.get(
    '/all',
    async (req,res) => {
    try{
        const posts = await Post.find();
        return res.status(200).json({message: `Posts found: ${posts.length}`,data: posts})
    }
    catch(err) {
        return res.status(400).json({message: `Err: ${err}`})
    }
    });

//get specific post using id
router.get(
    '/:id',
    [
        check('id').exists().withMessage('Please send valid data')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    //getting the post id
    const {id} = req.params;
    const candidate = await Post.findById(id);
    if(!candidate){
        return res.status(400).json({message: 'no user with that id'});
    }
    res.status(200).json({message: 'we found the post',data: candidate})
    }
    catch(err){
        return res.status(400).json({message: `Err: ${err}`})
    }
    });

//find all posts of the user
router.get(
    '/user/:id',
    [
        check('id').exists().withMessage('Please send valid data')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {id} = req.params;
    const candidate = await User.findById(id);
    if(!candidate) {
        return res.status(400).json({message: 'No user with that id'});
    }
    const posts = await Post.find({owner: id});
    return res.status(200).json({message: `Posts found: ${posts.length} `, data: posts});
    }
    catch(err){
        return res.status(400).json({message: `Err: ${err}`})
    }
    });

//find using partial search //thanks to mongoose// see: https://kb.objectrocket.com/mongo-db/mongoose-partial-text-search-606 
router.get(
    '/find/:name',
    [
        check('name').isString().withMessage('Please send valid data')
    ],
    async (req, res) => {
    try{
    //checking for errors in vlidation
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({message: errors.errors[0].msg});
    }
    const {name} = req.params;
    const postsUsingTitle = await Post.find({title: {$regex: name, $options: 'i'}});
    if(postsUsingTitle.length>0){
        return res.status(200).json({message: `Posts found: ${postsUsingTitle.length}`, data: postsUsingTitle});
    }
    const postsUsingDescription = await Post.find({description: {$regex: name, $options: 'i'}});
    return res.status(200).json({message: `Posts found: ${postsUsingDescription.length}`, data: postsUsingDescription});
    }
    catch(err){
        return res.status(400).json({message: `Err: ${err}`})
    }
    });



module.exports = router;