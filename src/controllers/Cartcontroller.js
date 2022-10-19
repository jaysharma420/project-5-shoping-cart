const cartModel = require('../models/CartModel')
const userModel = require('../models/UserModel')
const productModel = require('../models/ProductModel')
const mongoose = require('mongoose')
const Objectid = mongoose.Types.ObjectId.isValid


const createcart = async function (req, res) {
    try {
        let userId = req.params.userId
        let data = req.body
        const { productId, cartId } = data

        if (!productId) return res.status(400).send({ status: false, message: "please enter product id from request body" })
        if (!Objectid(productId)) return res.status(400).send({ status: false, message: "please enter a valid productid" })
        const productdata = await productModel.findById({ _id: productId, isDeleted: false }).select({ _id: 0, title: 1, price: 1, productImage: 1, availableSizes: 1 })
        if (!productdata) return res.status(404).send({ status: false, message: "no product found with this  productid" })
        let cartuser = await cartModel.findOne({ userId })
        if (!cartuser) {

            let cart = {}
            cart.userId = userId
            cart.items = { productId: productId, quantity: 1, productdata: productdata }
            cart.totalPrice = productdata["price"]
            cart.totalItems = 1


            const savedata = await cartModel.create(cart)
            return res.status(201).send({ status: true, message: "cart created successfully", data: savedata })
        }

        if (!cartId) return res.status(400).send({ status: false, message: "please enter cart id from request body" })
        if (!Objectid(cartId)) return res.status(400).send({ status: false, message: "please enter a valid cartid" })

        let cartdata = await cartModel.findById(cartId)
        if (!cartdata) return res.status(404).send({ status: false, message: "no data found with this cartid" })

        let arr = cartdata.items
        let totalItems = cartdata.totalItems
        let totalPrice = cartdata.totalPrice

        let flag = 0

        for (let i = 0; i < cartdata.items.length; i++) {
            if (cartdata.items[i].productId === productId) {
                cartdata.items[i].quantity += 1
                totalPrice += productdata.price
                flag = 1;break;
                // let updatecart = await cartModel.findByIdAndUpdate(
                //     { _id: cartId },
                //     { $inc: { totalPrice: productdata.price, "items[i].quantity": 1 } },
                //     { new: true }
                // )
                // console.log(updatecart);
                // return res.status(200).send({ status: true, msg: "updated cart", data: updatecart })
            }
        }

        if (flag == 0) {
            arr.push({
                productId: productId,
                quantity: 1,
                productdata: productdata
            })
            totalItems += 1
            totalPrice += productdata.price
        }

        let updatecart = await cartModel.findByIdAndUpdate(
            { _id: cartId },
            { $set: { items: arr, totalItems: totalItems, totalPrice: totalPrice } },
            { new: true }
        )
        return res.status(200).send({ status: true, msg: "cart was created we have just add a product in this cart", data: updatecart })
    } catch (err) {
        return res.status(500).send({ status: false, mesage: err.message })
    }



}
const updatecart = async function (req, res) {
    try {
        let userId = req.params.userId

        let data = req.body
        const { productId, cartId, removeProduct } = data

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "please give data in request body to update the cart" })

        if (!productId) return res.status(400).send({ status: false, message: "please enter product id from request body" })
        if (!cartId) return res.status(400).send({ status: false, message: "please enter cart id from request body" })
        if (typeof (removeProduct) === "undefined") return res.status(400).send({ status: false, message: "please enter remove product from request body" })
        if (!(removeProduct === 0 || removeProduct === 1)) return res.status(400).send({ status: false, message: "please enter remove product value 1 or 0" })


        let cartuser = await cartModel.findOne({ userId })
        if (!cartuser) return res.status(404).send({ status: false, message: "no cart found with this user id in db" })

        // -------------------------------validation product id-------------------------------------------
        if (!Objectid(productId)) return res.status(400).send({ status: false, message: "please enter a valid productid" })
        const productdata = await productModel.findById({ _id: productId, isDeleted: false }).select({ _id: 0, title: 1, price: 1, productImage: 1, availableSizes: 1 })
        if (!productdata) return res.status(404).send({ status: false, message: "nodata found with this product id" })

        // -------------------------------validation cart id-------------------------------------------

        if (!Objectid(cartId)) return res.status(400).send({ status: false, message: "please enter a valid cartid" })
        let cartdata = await cartModel.findById(cartId)
        if (!cartdata) return res.status(404).send({ status: false, message: "no data found with this cartid" })


        let arr = cartdata.items
        let totalItems = cartdata.totalItems
        let totalPrice = cartdata.totalPrice

        let flag = 0
        for (let i = 0; i < cartdata.items.length; i++) {
            if (cartdata.items[i].productId === productId) {
                flag = 1
                if (removeProduct == 0 || cartdata.items[i].quantity == 1) {
                    totalPrice -= ((productdata.price) * (cartdata.items[i].quantity))
                    totalItems -= 1
                    arr.splice(i, 1)
                    break
                } else {
                    cartdata.items[i].quantity -= 1
                    totalPrice -= productdata.price
                    break
                }
            }
        }
        if (flag == 0) return res.status(404).send({ status: false, message: "no data present in cart with this productid" })

        let updatecart = await cartModel.findByIdAndUpdate(
            { _id: cartId },
            { $set: { items: arr, totalItems: totalItems, totalPrice: totalPrice } },
            { new: true }
        )
        return res.status(200).send({ status: true, msg: "updated cart", data: updatecart })


    } catch (err) {
        return res.status(500).send({ status: false, mesage: err.message })
    }

}
const getcart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!Objectid(userId)) return res.status(400).send({ status: false, message: "please enter a valid userId or userId can't be empty" })
        let cartWithprodustdetails = await cartModel.findOne({ userId })
        if (!cartWithprodustdetails) {
            return res.status(400).send({ status: false, message: "cart not found with this user id" });
        }
        return res.status(200).send({ status: true, message: "GET DETAILS SUCESSFULLY SHOW IN RESPONSE", data: cartWithprodustdetails });
    } catch (error) {
        res.status(500).send({ message: error.message, status: "false" });

    }
}
const deletecart = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!Objectid(userId)) {
            return res.status(400).send({ status: false, message: "PLEASE PROVIDE CORRECT  USERID " })

        }
        // const CheckproperUserIDpresentinDB = await userModel.findOne({ userId: usesrId })
        // if (!CheckproperUserIDpresentinDB) {
        //     return res.status(400).send({ status: false, message: "USER ID NOT PRESENT IN MONGODB PLEASE PROVIDE PROPER ID WHICH IS PRESENT IN MONGODB" })

        // }
        let deletecartdetails = await cartModel.findOneAndUpdate(
            { userId: userId },
            { $set: { items: [0], totalItems: 0, totalPrice: 0 } },
            { new: true }
        )
        if (!deletecartdetails) {
            return res.status(404).send({ status: false, message: "THE CART ALREADY DELETED" })
        }
        return res.status(204).send({ status: true, message: "DELETED SUCESSFULLY COMPLETED", data: deletecartdetails })
    } catch (error) {
        res.status(500).send({ message: error.message, status: "false" });

    }


}

module.exports = { createcart, updatecart, getcart, deletecart }