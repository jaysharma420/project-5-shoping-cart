const express = require("express")
const app = express()
const route = require("./routes/route")
const mongoose = require("mongoose")

app.use(express.json())

mongoose.connect('mongodb+srv://jay420:gRLzeLdOa6ENyasF@cluster0.dnkg3q6.mongodb.net/group41Dtabase', { useNewUrlParser: true })
    .then(() => console.log("mongodb is connected"))
    .catch((err) => console.log(err))

app.use('/', route)

app.listen(process.env.PORT || 3000, () => console.log('express is running on port' + (process.env.PORT || 3000)))