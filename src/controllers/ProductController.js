const productModel = require('../models/ProductModel')
const mongoose = require('mongoose')
const { isPresent, isValidPrice,isValidadd, isValid ,isValidSize} = require('../validation/validation')
const { uploadFile } = require('../AWS/aws')
const Objectid = mongoose.Types.ObjectId.isValid

const createproduct = async function (req, res) {
    try {
        let data = req.body
        let files = req.files

        if (Object.keys(data).length == 0 && typeof (files) == 'undefined') {
            return res.status(400).send({ status: "false", message: "Please enter the data to create a user" });
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;
       
        if (!isPresent(title)) {
            return res.status(400).send({ status: false, message: "Title is mandatory or title can't be an empty string" })
        }
        if (!isValidadd(title)) {
            return res.status(400).send({ status: false, message: "Title contains only [a-zA-Z_ ,.-] " })
        }
        if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "This title is already exists" })

        if (!isPresent(description)) {
            return res.status(400).send({ status: false, message: "Description of product is mandatory" })
        }
        
        if (!isValid(description)) {
            return res.status(400).send({ status: false, message: "Description contain only [a-zA-Z0-9_ ,.-@#()]" })
        }

        if (!isPresent(price)) {
            return res.status(400).send({ status: false, message: "Price of product is mandatory or can't be empty" })
        }

        if (!isValidPrice(price)) {
            return res.status(400).send({ status: false, message: "Price is not present in correct format" })
        }

        if (!isPresent(currencyId)) {
            return res.status(400).send({ status: false, message: "CurrencyId is mandatory or can't be empty string" })
        }

        if (currencyId !== "INR") {
            return res.status(400).send({status: false, message: "possible vaue of currencyid is 'INR'  "})
        }

        if (!isPresent(currencyFormat)) {
            return res.status(400).send({ status: false, message: "CurrencyFormat is mandatory or can't be empty string" })
        }

        if (currencyFormat !== '₹') {
            return res.status(400).send({ status: false, message: "possible value of currencyformat is '₹'" })
        }

        if (files.length !== 1) {
            return res.status(400).send({ status: false, message: "Please provide product image file or only one file is allowed!!" })
        }


        if (typeof (isFreeShipping) !== 'undefined') {
            if (!isPresent(isFreeShipping)) {
                return res.status(400).send({ status: false, message: "isfreeshipping can't be empty" })
            }
            if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
                return res.status(400).send({ status: false, message: "Please enter only true or false" })
            }
        }
        if (typeof (style) !== 'undefined') {
        if (!isPresent(style)) {
            return res.status(400).send({ status: false, message: "Style can't be empty" })
        }
        if (!isValid(style)) {
            return res.status(400).send({ status: false, message: "Style containt only [a-zA-Z0-9_ ,.-@#()]" })
        }
    }
    if (typeof (availableSizes) !== 'undefined') {
        if (!isPresent(availableSizes)) {
            return res.status(400).send({ status: false, message: "availablesizes can't be empty" })
        }
        // if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes)) return res.status(400).send({ status: false, message: 'availablesizes possible value only [S, XS,M,X, L,XXL, XL]'})
        // if(typeof(JSON.parse(availableSizes)) !== "object") return res.status(400).send({status:false,msg:"put value in array of strings"})
        //     let size = availableSizes.toUpperCase().split(",")
        //     console.log(size);
        //     if(!isValidSize(size)){
        //     return res.status(400).send({ status: false, message: 'availablesizes possible value only ["S", "XS","M","X", "L","XXL", "XL"]'})   
        //     }
        //     data.availableSizes = size;
        console.log(availableSizes.split(",").length);
if(availableSizes.split(",").length===1){
    if(!["S", "XS","M","X", "L","XXL", "XL"].includes(availableSizes)) return res.status(400).send({ status: false, message: 'availablesizes possible value only [S, XS,M,X, L,XXL, XL]'})
}else{
    try{
console.log(JSON.parse(availableSizes));
    }catch(err){
        return res.status(400).send({status:false,message:"put value in array of string"})
    }
}

        }
        if (typeof (installments) !== 'undefined') {
        if (!/^[0-9]{1,4}$/.test(installments)) {
            return res.status(400).send({ status: false, message: "Installments must be a integer number and can't be empty" })
        }}
        if(files && files.length>0){
        let productImg = await uploadFile(files[0]);
        data.productImage = productImg;}

        let createProduct = await productModel.create(data);
        return res.status(201).send({ status: true, message: "Success", data: createProduct });
    }
    catch (error) {
        res.status(500).send({ status: "false", message: error.message })

    }


}
const getproduct = async function (req, res) {
    try {
        let data = req.query

        let { name, pricesort, size, priceGreaterthan, priceLessThan } = data
        if (pricesort) {
            if (!pricesort == -1 || !pricesort == 1) { return res.status(400).send({ status: false, message: "Please enter valid price pricesort" }) }
        }

        let filter = { isDeleted: false }

         
    if(size){
        let checkSizes=["S", "XS","M","X", "L","XXL", "XL"]
        let arraySize=size.split(",")
        for(let i=0;i<arraySize.length;i++){
            if(checkSizes.includes(arraySize[i]))
            continue;
            else
            return res.status(400).send({status:false,message:"Sizes should in this ENUM only S/XS/M/X/L/XXL/XL"})
        }
        filter.availableSizes={$in:arraySize}
      
    }
   
        if(name){
            if (!isPresent(name)) return res.status(400).send({ status: false, message: "name is in incorrect format" })
            filter["title"] = {"$regex": name};
        }

        if (priceLessThan) {
            if (!isValidPrice(priceLessThan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }

            filter['price'] = { $lt: priceLessThan }
        }

        if (priceGreaterthan) {

            if (!isValidPrice(priceGreaterthan)) {
                return res.status(400).send({ status: false, message: " please enter valid price " })
            }

            filter['price'] = { $gt: priceGreaterthan }
        }
        if (priceGreaterthan && priceLessThan) {
            filter['price'] = { $lt: priceLessThan, $gt: priceGreaterthan }
        }

        let finalData = await productModel.find(filter).sort({ price: pricesort })

        if (finalData.length == 0) {
            return res.status(200).send({ status: false, message: "No product available" })
        }

        return res.status(200).send({ status: true, message: "Success", data: finalData })

    } catch (error) {
        return res.status(500).send({ message: error.message });
    }


}
const getproductbyid = async function (req, res) {
    try {
        const productId = req.params.productId

        if (!Objectid(productId)) return res.status(400).send({ status: false, msg: 'please enter a valid productId!!' })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, msg: 'product not found with this productId!!!' })
        res.status(200).send({ status: true, data: productId })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const updateproduct = async function (req, res) {
    try {
        const productId = req.params.productId
        if (!Objectid(productId)) return res.status(400).send({ status: false, msg: 'please enter a valid productId!!' })

        const findProduct = await productModel.findOne({ _id: productId, isDeleted: false })
        if (!findProduct) return res.status(404).send({ status: false, msg: 'product not found with this productId!!!' })

        let data = req.body
        let files = req.files

        if (Object.keys(data).length == 0 && typeof (files) == 'undefined') {
            return res.status(400).send({ status: "false", message: "Please enter the data to create a user" });
        }

        const { title, description, price, currencyId, currencyFormat, isFreeShipping, style, availableSizes, installments } = data;

        if (title != null){
            if (!isValidadd(title)) {
                return res.status(400).send({ status: false, message: "Title contains only [a-zA-Z_ ,.-] " })
            }
            if (await productModel.findOne({ title })) return res.status(400).send({ status: false, message: "This title is already exists" })
        }
        if (typeof(description)!=="undefined"){
            if (!isValid(description)) {
                return res.status(400).send({ status: false, message: "Description contain only [a-zA-Z0-9_ ,.-@#()]" })
            }
        }
        if (typeof(price)!=="undefined"){
            if (!isValidPrice(price)) {
                return res.status(400).send({ status: false, message: "Price is not present in correct format" })
            }
    
        }
        if (typeof(currencyId)!=="undefined"){
            if (currencyId !== "INR") {
                return res.status(400).send({status: false, message: "possible vaue of currencyid is 'INR'  "})
            }
        }
        if (typeof(currencyFormat)!=="undefined"){
            if (currencyFormat !== '₹') {
                return res.status(400).send({ status: false, message: "possible value of currencyformat is '₹'" })
            }
        }
        if (typeof(isFreeShipping)!=="undefined"){
            if (!(isFreeShipping == "true" || isFreeShipping == "false")) {
                return res.status(400).send({ status: false, message: "Please enter only true or false" })
            }
        }
        if (typeof(style)!=="undefined"){
            if (!isValid(style)) {
                return res.status(400).send({ status: false, message: "Style containt only [a-zA-Z0-9_ ,.-@#()]" })
            }
        }
        if (typeof(availableSizes)!=="undefined"){

        }
        if (typeof(installments)!=="undefined"){
            if (!/^[0-9]{1,4}$/.test(installments)) {
                return res.status(400).send({ status: false, message: "Installments must be a integer number and can't be empty" })
            }
        }
if(files != null){
    if (files.length !== 1) {
        return res.status(400).send({ status: false, message: "Please provide product image file or only one file is allowed!!" })
    }
    let productImg = await uploadFile(files[0]);
        data.productImage = productImg;
}

        let updatedata = await productModel.findOneAndUpdate(
            {_id:productId},
            {$set:data},
            {new:true}
        )
        return res.status(200).send({status:false,message:"data updated successfully",data:updatedata})

    }catch (err){
        return res.status(500).send({status:false,message:err.message})
    }

}
const deleteproduct = async function (req, res) {
    try {
        const productId = req.params.productId;
        if (!mongoose.Types.ObjectId.isValid(productId)) {
            return res
                .status(400)
                .send({ status: false, message: "Invalid product id" });
        }

        const productById = await productModel.findOne({
            _id: productId,
            isDeleted: false,
            deletedAt: null,
        });

        if (!productById) {
            return res.status(404).send({
                status: false,
                message: "No product found by this product id",
            });
        }

        const mark = await productModel.findOneAndUpdate({ _id: productId }, { $set: { isDeleted: true, deletedAt: Date.now() } });

        res
            .status(200)
            .send({ status: true, message: "Product successfully deleted" });
    } catch (error) {
        res.status(500).send({ error: error.message });
    }
}

module.exports = { createproduct, getproduct, getproductbyid, updateproduct, deleteproduct }
