const express = require("express")
require("dotenv").config()
require('./db')
const cors = require("cors")
const app = express()
const userRouter = require('./routes/userroute')

const PORT = process.env.PORT || 4000
app.use(cors())
app.use(express.json())
app.use('/api/user/', userRouter)
// app.post('/api/user/create', (req, res, next) => {
//     req.on('data', (chunk) => {
//         console.log(JSON.parse(chunk))
//     })
//     res.send('Created')
// })
// app.get('/api/user/create', (req, res) => {
//     res.send('Created')
// })

app.listen(PORT, () => {
    console.log(`App is running on ${PORT}`)
})