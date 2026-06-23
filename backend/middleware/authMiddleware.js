import jwt  from "jsonwebtoken";
import asyncHandler from "express-async-handler";

const isUser = asyncHandler(async(req, res, next)=>{
    const token = req.headers['authorization'].split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET,(err, decode)=>{
        if(err){
            return res.status(200).json({message:'Auth failed', success:false})
        }else{
            req.body.userID = decode.id
            next()
        }
    })
})

const isDoctor = asyncHandler(async(req, res, next)=>{
    const token = req.headers['authorization'].split(" ")[1]
    jwt.verify(token, process.env.JWT_SECRET,(err, decode)=>{
        if(err){
            return res.status(200).json({message:'Auth failed', success:false})
        }else{
            req.body.doctorID = decode.id
            next()
        }
    })
})

export {isUser, isDoctor};