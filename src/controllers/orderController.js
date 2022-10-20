const orderModel = require('../models/orderModel')
const cartModel = require('../models/CartModel')
const userModel = require('../models/UserModel')
const productModel = require('../models/ProductModel')
const mongoose = require('mongoose')
const Objectid = mongoose.Types.ObjectId.isValid

const createorder = async function(req,res){
try {
let userId = req.params.userId
let {cartId,cancellable} = req.body

if(!cartId) return res.status(400).send({status:false,mesage:"please enter cartId"})
if(!Objectid(cartId))return res.status(400).send({status:false,mesage:"please enter a valid carid"})

const cartdata = await cartModel.findOne({_id:cartId,userId:userId})
if(!cartdata)return res.status(400).send({status:false,mesage:"with this cartid and userid no cart found"})
if(cartdata.items.length ===0)return res.status(404).send({status:false,mesage:"no cart found"})

let sum = 0
for(let i=0;i<cartdata.items.length;i++){
    sum = sum + cartdata.items[i].quantity
}
let order = {}

order.userId = userId
order.items = cartdata.items
order.totalItems = cartdata.totalItems
order.totalPrice = cartdata.totalPrice
order.totalQuantity = sum

if(typeof (cancellable) !== "undefined"){
    if(!(cancellable ==="true"||cancellable==="false"))return res.status(400).send({status:false,message :"only possible values of cancellable is true or false"})
    order.cancellable = cancellable
}

const createorder = await orderModel.create(order)

const updatecart = await cartModel.findByIdAndUpdate(
      {_id:cartId},
      {$set:{items:[],totalPrice:0,totalItems:0}},
      {new :true}
)

return res.status(201).send({status:true,message:"order created",data:createorder})

}catch (err){
    return res.status(500).send({status:false,message:err.message})
}

}

const updateorder = async function(req,res){
    try {
let userId = req.params.userId
let {orderId,status} = req.body

if(typeof(orderId)==="undefined" || typeof(status)==="undefined") return res.status(400).send({status:false,mesage:"please enter orderId and status to update"})
if(!Objectid(orderId))return res.status(400).send({status:false,mesage:"please enter a valid orderid"})

let orderdata = await orderModel.findone({_id:orderId,userId:userId})
if(!orderdata)return res.status(404).send({status:false,message:"no order found with this orderid and userid"})
if(!(orderdata.status=="pending")) return res.status(400).send({status:false,message:"this order status is not  pending u can't update"})
if(orderdata.cancellable=="false")return res.status(404).send({status:false,message:"can't update order status, cancellable key is false"})

if(orderdata.status==status) return res.status(400).send({status:false,message:"this status is already present enter another one"})

        if (!['pending', 'completed', 'cancled'].includes(status)) {
            return res.status(400).send({
                status: false, message: "STATUS YOU WANT PROVIDED ['pending', 'completed', 'cancled'] ONLY THESE ENUm"
            })

        }
        const updateorder = await orderModel.findByIdAndUpdate(
            { _id: orderId },
            { $set: { status:status } },
            { new: true }
        )
        console.log(updateorder)
        if(status=="completed"){return res.status(200).send({ status: true, message: "ORDER completed", data: updateorder })}
        return res.status(200).send({ status: true, message: "ORDER deleted"})
        }
    catch(err){
        return res.status(500).send({status:false,message:err.message})
    }  

}

module.exports = {createorder,updateorder}