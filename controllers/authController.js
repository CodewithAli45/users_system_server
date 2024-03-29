const User = require("../models/userModel");
const bcrypt = require('bcrypt');
const generateToken = require("../utils/generateToken");


const registerUser = async (req, res) => {
    const {fullName, email, phone, address, password, confirmPassword} = req.body;
    try {
        const user = await User.findOne({email});
        if(user){
            return res.status(403).json({
                status: "failure",
                msg: "User Already Registered"
            })
        }
        if(password !== confirmPassword){
            return res.status(400).json({
                msg: "Password and Confirm Password must be same"
            })
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            fullName, email, phone, address, password: hashedPassword, confirmPassword:hashedPassword
        });

        await User.create(newUser);
        res.status(201).json({
            status: "success",
            data : newUser
        })
    } catch (error) {
        return res.status(500).json({
            msg: "failure",
            Error: "Internal Server Error",
            erro: error.message
        })
    }
}

const loginUser = async (req, res) => {
    const {email, password} = req.body;
    if(!email || !password){
        return res.status(400).json({
            status: "failure",
            msg: "Please enter email and password"
        })
    }
    try {
        const user = await User.findOne({email});
        if(!user){
            return res.status(404).json({
                status: "Failure",
                msg: "User Not Found"
            })
        }
        if(user && bcrypt.compareSync(password, user?.password)){
            return res.status(200).json({
                msg: "Logged in successfully",
                data: user,
                token: generateToken(user._id),
                userId: user._id
            })
        }else {
            return res.status(400).json({
                status: "failure", 
                msg: "password is wrong"
            })
        }
    } catch (error) {
        return res.status(500).json({
            msg: "failure",
            Error: "Internal Server Error",
            erro: error.message
        })
    }
}


const logout = async (req, res) => {
    const token = req.body.token;
    if(!token){
        return res.status(401).json({
            message: "Authentication failed",
            status: "Failure"
        })
    }
    try {
        res.clearCookie('jwt');

        res.status(200).json({
            message: "Logged out successfully",
            status: "success"
        })
    } catch (error) {
        return res.status(500).json({
            msg: "failure",
            Error: "Internal Server Error",
            erro: error.message
        })
    }
}


module.exports = {
    registerUser,
    loginUser,
    logout
}