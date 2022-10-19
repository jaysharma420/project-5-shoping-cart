const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const cartschema = new mongoose.Schema({
    userId: {type:ObjectId, ref:"User", required:true, unique:true},
    items: {
       type:[Object],
      productId: {type:ObjectId, ref:"Product", required:true},
      quantity: {type:Number, required:true, default:1}
    
  },
    totalPrice: {type:Number, required:true},
    totalItems: {type:Number, required:true},

},{timestamps:true})


module.exports = mongoose.model('Cart',cartschema)