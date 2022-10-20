const mongoose = require('mongoose')
const ObjectId = mongoose.Schema.Types.ObjectId

const orderschema = new mongoose.Schema({
  userId: { type: ObjectId, ref: "User", required: true },
  items: {
    type: [Object],
    productId: { type: ObjectId, ref: "Product", required: true },
    quantity: { type: Number, required: true, default: 1 }
  },
  totalPrice: { type: Number, required: true },
  totalItems: { type: Number, required: true },
  totalQuantity: { type: Number, required: true },
  cancellable: { type: Boolean, default: true },
  status: { type: String, default: 'pending', enum: ['pending', 'completed', 'cancled'] },
  deletedAt: { type: Date },
  isDeleted: { type: Boolean, default: false },

}, { timestamps: true })

module.exports = mongoose.model('Order', orderschema)