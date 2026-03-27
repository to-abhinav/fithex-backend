const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcypt = require("bcryptjs");



const generateToken = (id)=>{
    return jwt.sign({id},process.env.JWT_SECRET,{ expiresIn:process.env.JWT_EXPIRES_IN });
}

const loginUser = async (req,res) =>{
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const isMatch = await bcypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }

        res.json({
            token:generateToken(user._id),
            user
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:"Cannot login user"});
    }
}

module.exports = {
    loginUser
}