const isPresent = function (value) {
    if (typeof value === 'undefined' || value === null) return false
    if (typeof value === 'string' && value.trim().length === 0) return false
    return true
}

const isValidName = function (name) {
    return (/^[a-zA-Z ]{2,30}$/).test(name)
}
const isValidadd = function(value){
    return (/^[a-zA-Z0-9_ ,.-]{2,50}$/).test(value)
}
const isValidEmail = function (email) {
    return (/^[a-z0-9][a-z0-9-_\.]+@([a-z]|[a-z0-9]?[a-z0-9-]+[a-z0-9])\.[a-z0-9]{2,10}(?:\.[a-z]{2,10})?$/).test(email)
}

const isValidImg = function (imgLink) {
    return (/^https?:\/\/.\.[s3].\.(png|gif|webp|jpeg|jpg)\??.*$/gim).test(imgLink)
}

const isValidPhone = function (phone) {
    return (/^((\+91)?|91)?[6-9][0-9]{9}$/).test(phone);
}

const isValidPassword = function (password) {
    var passRegex = /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,15}$/

    return passRegex.test(password)
}

const isValidPin = function (pin) {
    return /^\+?([1-9]{1})\)?([0-9]{5})$/.test(pin);
}
const isValidPrice = function (price) {
    return /^[1-9]\d{0,7}(?:\.\d{1,2})?$/.test(price);
}
const isValid = function(value){
    return (/^[a-zA-Z0-9_ ,.-@#()]{2,10000}$/).test(value)
}
const isValidSize = function(value){
  return  ["S", "XS","M","X", "L","XXL", "XL"].includes(value)

}
const parseJSONSafely=(str)=> {
    try {
        return JSON.parse(str);
    } catch (e) {
        return null
    }
}
const isValids = (value) => {
    if (typeof value == "undefined" || typeof value == null) return false;    //"",null,undefinded
    if (typeof value === "string" && value.trim().length === 0) return false; //""
    return true;
}

module.exports = {isPresent,parseJSONSafely,
     isValidName, isValidEmail, isValidImg, 
     isValids ,isValidPhone, isValidPassword, isValidPin,isValidadd,isValidPrice,isValid,isValidSize}