

require("dotenv").config()
const http = require('http')
const app = require("./src/app")
const ConnectDB = require("./src/db/db")
const initSocketServer = require('./src/sockets/socket.server')

const PORT = process.env.PORT || 3000

const httpServer = http.createServer(app)

ConnectDB()

initSocketServer(httpServer)

httpServer.listen(PORT, () => {console.log(`🚀 JobScribe server running on PORT ${PORT}`)})

// just for commit
