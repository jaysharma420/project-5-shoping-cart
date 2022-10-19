const express = require('express')
const router = express.Router()
const { createUser, userLogin, getUser, updateUser } = require('../controllers/UserController')
const { authorization1, authentication } = require('../middlewares/auth')
const { createproduct, getproduct, getproductbyid, updateproduct, deleteproduct } = require('../controllers/ProductController')
const {createcart,updatecart,getcart,deletecart} = require('../controllers/Cartcontroller')
// ---------------------------USER--------------------------------------------
router.post('/register', createUser)
router.post('/login', userLogin)
router.get('/user/:userId/profile', authentication, getUser)
router.put('/user/:userId/profile', authentication, authorization1, updateUser)

// ------------------------------PRODUCT--------------------------------------
router.post('/products', createproduct)
router.get('/products', getproduct)
router.get('/products/:productId', getproductbyid)
router.put('/products/:productId', updateproduct)
router.delete('/products/:productId', deleteproduct)

// ---------------------------------CART----------------------------------------------
router.post('/users/:userId/cart',authentication,authorization1,createcart)
router.put('/users/:userId/cart',authentication,authorization1,updatecart)
router.get('/users/:userId/cart',authentication,authorization1,getcart)
router.delete('/users/:userId/cart',authentication,authorization1,deletecart)

router.all("/*", function (req, res) {
    return res.status(400).send({ status: false, message: "Make Sure Your Endpoint is Correct !!!"
})
})
module.exports = router