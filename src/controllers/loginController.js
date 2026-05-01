const User = require("../models/User");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");



const generateToken = (id,role)=>{
    return jwt.sign({id,role},process.env.JWT_SECRET,{ expiresIn:process.env.JWT_EXPIRES_IN });
}

const loginUser = async (req,res) =>{
    const {email, password} = req.body;

    try {
        const user = await User.findOne({email});

        if(!user){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if(!isMatch){
            return res.status(400).json({message:"Invalid email or password"});
        }

        const { password: _pw, ...safeUser } = user.toObject();

        res.json({
            token: generateToken(user._id, user.role),
            user: safeUser
        })
    } catch (error) {
        console.error(error.message);
        res.status(500).json({message:"Cannot login user"});
    }
}

module.exports = {
    loginUser
}