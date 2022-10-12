const userModel = require('../models/UserModel')
const mongoose = require('mongoose')
const Objectid=mongoose.Types.ObjectId.isValid
const jwt = require('jsonwebtoken')



const authentication = async function (req, res,next) {
try {
// let token = req.headers["authorization"].substring(7)
 let token = req.headers["authorization"].split(" ")[1]
// console.log(token);
// console.log(req.headers);
if(!token){return res.status(400).send({status:false,message:"please enter token"})}
let decodetoken ;
try {
   decodetoken = jwt.verify(token,"mykey")
}catch(err){
    return res.status(401).send({status:false,message:err.message})
}
req.token = decodetoken
next()

    }catch(err){
        return res.status(500).send({status:false,message:err.message})
    }
}

const authorization1 = async function (req, res,next) {
    let userId = req.params.userId
    if(!Objectid(userId)){
        return re.status(400).send({status:false,message:" PLEASE ENTER CORRECT mongoose USER ID"})
    }

    const findUseridInDb=await userModel.findById(userId)
    if(!findUseridInDb){
        return res.status(400).send({status:false,message:`there is no data with this  ${userId}  id in database`})
    }

if(req.token.id != userId) return res.status(404).send({status:false,message:"authorization failed"})
next()
}


module.exports = { authorization1, authentication }
