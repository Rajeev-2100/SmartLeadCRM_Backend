const mongoose = require('mongoose')
require('dotenv').config()

const mongo_Uri= process.env.MONGO_URL

const initializeDatabase = async () => {
    await mongoose
    .connect(mongo_Uri)
    .then(() => {
        console.log('Connect to Database')
    }).catch(() => {
        console.log('Failed to Connect Database')
    })
}

module.exports = { initializeDatabase } 