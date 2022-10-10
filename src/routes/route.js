const express = require('express')
const router = express.Router()
const { createUser, userLogin, getUser, updateUser } = require('../controllers/UserController')
const { authorization, authentication } = require('../middlewares/auth')

router.get('/register', createUser)
router.post('/login', userLogin)
router.get('/user/:userId/profile', authentication, getUser)
router.put('/user/:userId/profile', authentication, authorization, updateUser)


router.all("/*", function (req, res) {
    return res.status(400).send({
        status: false, message: "Make Sure Your Endpoint is Correct !!!"
    })
})
module.exports = router