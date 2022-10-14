const productModel = require('../models/ProductModel')
const { isPresent, isValidPrice,isValidadd, isValid } = require('../validation/validation')
const { uploadFile } = require('../AWS/aws')

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

        if (files.length == 0) {
            return res.status(400).send({ status: false, message: "Please provide product image file!!" })
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
            let size = availableSizes.toUpperCase().split(",")
            console.log(size);
            data.availableSizes = size;
        }
        if (typeof (installments) !== 'undefined') {

        if (!(installments || typeof installments == Number)) {
            return res.status(400).send({ status: false, message: "Installments should in correct format" })
        }}
        let productImg = await uploadFile(files[0]);
        data.productImage = productImg;

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
            if (!pricesort == -1 || pricesort == 1) { return res.status(400).send({ status: false, message: "Please enter valid price pricesort" }) }
        }

        let filter = { isDeleted: false }
        let availableSizes = size
        if (availableSizes) {
            let size = availableSizes.toUpperCase().split(",")
            availableSizes = size

            for (let i = 0; i < availableSizes.length; i++) {
                if (!validator.isValidSize(availableSizes[i])) {
                    return res.status(400).send({ status: false, message: "Size shouldbe one of them [S,XS,M,X,XL,XXL]" })
                }
            }
            filter.availableSizes = { $in: size }
        }
        if (name) {
            filter["title"] = { $regex: name };
        }

        filter.title = name


        if (priceLessThan) {
            if (!validPrice(priceLessThan)) {
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

        if (!isValidObjectId(productId))
            return res.status(500).send({ status: false, msg: 'please enter a valid productId!!' })

        const findProduct = await productModel.findOne({ _Id: productId, isDeleted: false })
        if (!findProduct) return res.status(400).send({ status: false, msg: 'product not found or product is deleted!!!' })

        res.status(200).send({ status: true, data: productId })
    }
    catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
const updateproduct = async function (req, res) {

}
const deleteproduct = async function (req, res) {

}

module.exports = { createproduct, getproduct, getproductbyid, updateproduct, deleteproduct }
