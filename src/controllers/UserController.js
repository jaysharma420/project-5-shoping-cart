const userModel = require('../models/UserModel')
const mongoose = require('mongoose')
const jwt = require("jsonwebtoken")
const bcrypt = require('bcrypt')
// const aws = require('aws-sdk')
const Objectid = mongoose.Types.ObjectId.isValid
const { isPresent, isValidName, isValidEmail, isValidImg, isValidPhone, isValidPassword, isValidPin } = require('../validation/validation')

const { uploadFile } = require('../AWS/aws')



const createUser = async function (req, res) {
    try {

        const data = req.body
        const file = req.files

        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Enter data to Create the User" })

        const { fname, lname, email, phone, password, address } = data
        console.log(typeof(fname));
        console.log(typeof(phone));
        console.log(typeof(address));

        if (!isPresent(fname)) return res.status(400).send({ status: false, message: "fname is mandatory" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please Provide the valid fname" })

        if (!isPresent(lname)) return res.status(400).send({ status: false, message: "lname is mandatory" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please Provide the valid lname" })

        if (!isPresent(email)) return res.status(400).send({ status: false, message: "email is mandatory" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email should be in  valid format eg:- name@gmail.com" })

        if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })

        if (!isPresent(file)) return res.status(400).send({ status: false, message: "profile Image can't be empty" })

        // if (!isValidImg(profileImage)) return res.status(400).send({ status: false, message: "profile Image should be valid with this extensions .png|.jpg|.gif" })

        if (!isPresent(phone)) return res.status(400).send({ status: false, message: "Phone is mandatory" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })

        if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })

        if (!isPresent(password)) return res.status(400).send({ status: false, message: "Password is mandatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })

        // ---------> Address <---------

        if (!isPresent(address)) return res.status(400).send({ status: false, message: "Address is mandatory" })

        const parseAddress = address

        // ---------> Shipping Address <---------

        if (!isPresent(parseAddress.shipping)) return res.status(400).send({ status: false, message: "Please provide the Shipping address" })
        if (!isPresent(parseAddress.shipping.street)) return res.status(400).send({ status: false, message: "Street is mandatory" })
        if (!isPresent(parseAddress.shipping.city)) return res.status(400).send({ status: false, message: "city is mandatory" })
        if (!isPresent(parseAddress.shipping.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory" })
        if (!isValidPin(parseAddress.shipping.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode" })

        // ---------> Billing Address <---------

        if (!isPresent(parseAddress.billing)) return res.status(400).send({ status: false, message: "Please provide address for billing" })
        if (!isPresent(parseAddress.billing.street)) return res.status(400).send({ status: false, message: "Street is mandatory" })
        if (!isPresent(parseAddress.billing.city)) return res.status(400).send({ status: false, message: "city is mandatory" })
        if (!isPresent(parseAddress.billing.pincode)) return res.status(400).send({ status: false, message: "pincode is mandatory" })
        if (!isValidPin(parseAddress.billing.pincode)) return res.status(400).send({ status: false, message: "Please provide valid Pincode" })

        // const profileImg = await imgUpload.uploadFile(files[0])
        const encyptPassword = await bcrypt.hash(password, 10)

        if (file && file.length > 0) {
            //upload to s3 and get the uploaded link
            // res.send the link back to frontend/postman
            // let Image =await uploadFile(file[ 0])
            // console.log(Image);
            data.profileImage = await uploadFile(file[ 0])
// console.log(data);

        }
        else {
            return res.status(400).send({ msg: "PROFILE IMAGE FILE IS REQUIRED" })
        }
        data.password = encyptPassword
        // console.log(data);


        let createdata = await userModel.create(data)
        return res.status(201).send({ status: true, message: "user created", data: createdata })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}

const userLogin = async function (req, res) {
    try {
        let { email, password } = req.body
        const encyptPassword = await bcrypt.hash(password, 10)
        // console.log(encyptPassword);
        if (Object.entries(req.body).length === 0) {
            return res.status(400).send({ status: false, message: "Please enter email and Password" })
        }
        if (!isPresent(email)) {
            return res.status(400).send({ status: false, message: "Please enter email" })
        }
        if (!isPresent(password)) {
            return res.status(400).send({ status: false, message: "Please enter Password" })
        }
        if (isValidEmail(email) == false) {
            return res.status(400).send({ status: false, message: "Please enter correct Email" })
        }
        if (!isValidPassword(password)) {
            return res.status(400).send({ status: false, message: "Please enter correct Password" })
        }
        let data = await userModel.findOne({ email: email})
        if (!data) {
            return res.status(404).send({ status: false, message: "User not found with this email" })
        }
        let hash = data.password
       let checkpassword = await bcrypt.compare(password, hash);
       if(!checkpassword)  return res.status(400).send({ status: false, message: "login failed this password not matches with email" })
        const token = jwt.sign({
            id: data._id.toString(),
            exp: (Date.now() / 1000) + 60 * 60 * 24 * 14
        }, "mykey")
        return res.status(201).send({ status: true, message: "user login successfull", data: { userid: data._id, token: token } })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}
const getUser = async function (req, res) {
    try {
        let userId = req.params.userId
        if (!Objectid(userId)) {
            return re.status(400).send({ status: false, message: " PLEASE ENTER CORRECT USER ID" })
        }
        const findUseridInDb = await userModel.findById(userId)
        if (!findUseridInDb) {
            return res.status(400).send({ status: false, message: "THIS USER IS NOT PRESENT IN OUR MONGODB" })
        }
        return res.status(200).send({ status: true, message: "USER PROFILE DETAILS", data: findUseridInDb })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }



}
const updateUser = async function (req, res) {
    try {
        let data = req.body
        if (Object.keys(data).length == 0) return res.status(400).send({ status: false, message: "Please Enter data to update the User" })

        const { fname, lname, email, phone, password, address } = data

        if(fname){
            if (!isPresent(fname)) return res.status(400).send({ status: false, message: "fname is mandatory" })
        if (!isValidName(fname)) return res.status(400).send({ status: false, message: "Please Provide the valid fname" })
        }
if(lname){
    if (!isPresent(lname)) return res.status(400).send({ status: false, message: "lname is mandatory" })
        if (!isValidName(lname)) return res.status(400).send({ status: false, message: "Please Provide the valid lname" })
}
if(email){
    if (!isPresent(email)) return res.status(400).send({ status: false, message: "email is mandatory" })
        if (!isValidEmail(email)) return res.status(400).send({ status: false, message: "email should be in  valid format eg:- name@gmail.com" })

        if (await userModel.findOne({ email })) return res.status(400).send({ status: false, message: "This email is already Registered Please give another Email" })
}

if(phone){
    if (!isPresent(phone)) return res.status(400).send({ status: false, message: "Phone is mandatory" })
        if (!isValidPhone(phone)) return res.status(400).send({ status: false, message: "please provide Valid phone Number with 10 digits starts with 6||7||8||9" })

        if (await userModel.findOne({ phone })) return res.status(400).send({ status: false, message: "This Phone is already Registered Please give another Phone" })
}
if(password){
    if (!isPresent(password)) return res.status(400).send({ status: false, message: "Password is mandatory" })
        if (!isValidPassword(password)) return res.status(400).send({ status: false, message: "please provide Valid password with 1st letter should be Capital letter and contains spcial character with Min length 8 and Max length 15" })
}
if(address.shipping.street){

}

        let updatedata = await userModel.findByIdAndUpdate(
            { _id: req.params.userId },
            { $set: data },
            { new: true }
        )
        return res.status(200).send({ status: true, message: "data updated successfully", data: updatedata })
    } catch (error) {
        return res.status(500).send({ msg: error.message, status: false })
    }
}

module.exports = { createUser, userLogin, getUser, updateUser }