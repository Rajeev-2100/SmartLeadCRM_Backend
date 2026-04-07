const express = require('express')
const app = express()

app.use(express.json())

const Lead = require('./models/lead.model.js')
const SalesAgent = require('./models/salesAgent.model.js')
const comment = require('./models/comment.model.js')
const Tags = require('./models/tag.model.js')


const { initializeDatabase } = require('./db/db.connect.js')
initializeDatabase()

async function createSalesAgent(newAgent){
    try {
        const agent = new SalesAgent(newAgent)
        const savedAgent = await agent.save()
        return savedAgent 
    } catch (error) {
        throw error
    }
}

app.post('/agents', async (req,res) => {
    try {
        const agent = await createSalesAgent(req.body)
        if(agent){
            res.status(201).json({message: 'Agent successfully loaded', data: agent})
        }else{
            res.status(404).json({error: 'Something went wrong in this agent Data'})
        }
    } catch (error) {
        res.status(500).json({error: 'Failed to fetch Agent Data'})
    }
})

const PORT = 3001
app.listen(PORT, () => {
    console.log('Server is running on 3001')
})