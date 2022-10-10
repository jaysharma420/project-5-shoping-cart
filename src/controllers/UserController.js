const userModel = require('../models/UserModel')
const mongoose=require('mongoose')
const Objectid=mongoose.Types.ObjectId.isValid




const createUser = async function (req, res) {


}

const userLogin = async function (req, res) {


}
const getUser = async function (req, res) {
    try {
        let userId=req.params.userId
        if(!Objectid(userId)){
            return re.status(400).send({status:false,message:" PLEASE ENTER CORRECT USER ID"})
        }
        const findUseridInDb=await userModel.findById(userId)
        if(!findUseridInDb){
            return res.status(400).send({status:false,message:"THIS USER ID NOT PREASENT IN OUR MONGODB"})
        }
        return res.status(200).send({status:true,message:"USER PROFILE DETAILS",data:findUseridInDb})
    } catch (error) {
        res.status(500).send({msg:error.message,status:false})
    }



}
const updateUser = async function (req, res) {


}

module.exports = { createUser, userLogin, getUser, updateUser }