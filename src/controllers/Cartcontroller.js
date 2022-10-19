const cartModel = require('../models/CartModel')
const userModel = require('../models/UserModel')
const mongoose = require('mongoose');
const objectid=mongoose.Types.ObjectId.isValid

const createcart = function(req,res){
    
}
const updatecart = function(req,res){

}
const getcart = async function(req,res){
try {
    let userid=req.params.userid
    let cartWithprodustdetails= await cartModel.findOne({userId:userid}).populate(items.productId)
    if(!cartWithprodustdetails ){
        return res.status(400).send({ status: false, message: "CART AND DETAILS NOT FOUND"});
    }
return res.status(200).send({ status: true, message: "GET DETAILS SUCESSFULLY SHOW IN RESPONSE",data: cartWithprodustdetails});
} catch (error) {
    res.status(500).send({message: error.message,status: "false"});
}
}
const deletecart =async function(req,res){
let usesrId=req.params.usesrId
if(!objectid(usesrId)){
    return res.status(400).send({ status: false, message: "PLEASE PROVIDE CORRECT  USERID "})

}
const CheckproperUserIDpresentinDB=await userModel.findOne({userId:usesrId})
if(!CheckproperUserIDpresentinDB) {
    return res.status(400).send({ status: false, message: "USER ID NOT PRESENT IN MONGODB PLEASE PROVIDE PROPER ID WHICH IS PRESENT IN MONGODB"})

}
let deletecartdetails =await cartModel.findOneAndUpdate(
    {userId:usesrId},
    {$set:{items:[0],totalItems:0,totalPrice:0}},
    {new:true}
)
if(!deletecartdetails) {
return res.status(404).send({ status: false, message: "THE CART ALREADY DELETED"})

}
return res.status(200).send({ status:true,message: "DELETED SUCESSFULLY COMPLETED",data:deletecartdetails})

}

module.exports = {createcart,updatecart,getcart,deletecart}