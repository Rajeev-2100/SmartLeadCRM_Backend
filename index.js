const express = require("express");
const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const Lead = require("./models/lead.model.js");
const SalesAgent = require("./models/salesAgent.model.js");
const Comment = require("./models/comment.model.js");
const Tags = require("./models/tag.model.js");

const { initializeDatabase } = require("./db/db.connect.js");
initializeDatabase();

async function createSalesAgent(newAgent) {
  try {
    const agent = new SalesAgent(newAgent);
    const savedAgent = await agent.save();
    return savedAgent;
  } catch (error) {
    throw error;
  }
}

app.post("/agents", async (req, res) => {
  try {
    const agent = await createSalesAgent(req.body);
    if (agent) {
      res
        .status(201)
        .json({ message: "Agent successfully loaded", data: agent });
    } else {
      res
        .status(404)
        .json({ error: "Something went wrong in this agent Data" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Agent Data" });
  }
});

async function getAllSalesAgent() {
  try {
    const agent = await SalesAgent.find();
    return agent;
  } catch (error) {
    throw error;
  }
}

app.get("/agents", async (req, res) => {
  try {
    const agent = await getAllSalesAgent();
    res.status(201).json({ message: "All Sales Data is this", data: agent });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Sales Data" });
  }
});

async function createALead(newLead) {
  try {
    const lead = new Lead(newLead);
    const savedLead = await lead.save();
    return savedLead;
  } catch (error) {
    throw error;
  }
}

app.post("/leads", async (req, res) => {
  try {
    const lead = await createALead(req.body);
    if (lead) {
      res.status(201).json({ message: "Lead successfully loaded", data: lead });
    } else {
      res.status(404).json({ error: "Something went wrong in this lead" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lead Data" });
    console.error(error.message);
  }
});

async function getAllLeadsData() {
  try {
    const leads = await Lead.find().populate("salesAgent");
    return leads;
  } catch (error) {
    throw error;
  }
}

app.get("/leads", async (req, res) => {
  try {
    const { status, salesAgent, source } = req.query;
    // console.log(status, salesAgent, source);
    const leads = await getAllLeadsData();
    if (leads) {
      res.status(200).json({ message: "All Lead Data this", data: leads });
    } else {
      res.status(400).json({ error: "Something wrong is the Data" });
    }
  } catch (error) {
    throw error;
  }
});

async function updatedLeadByLeadId(leadId, dataToUpdate) {
  try {
    const lead = await Lead.findByIdAndUpdate(leadId, dataToUpdate, {
      new: true,
    });
    return lead;
  } catch (error) {
    throw error;
  }
}

app.put("/leads/:leadId", async (req, res) => {
  try {
    const lead = await updatedLeadByLeadId(req.params.leadId, req.body);
    if (lead) {
      res
        .status(201)
        .json({ message: "Lead Data Updated Successfully", data: lead });
    } else {
      res.status(404).json({ error: "Lead Id not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lead data" });
  }
});

async function deletedLeadByLeadId(leadId) {
  try {
    const lead = await Lead.findByIdAndDelete(leadId);
    return lead;
  } catch (error) {
    throw error;
  }
}

app.delete("/leads/:leadId", async (req, res) => {
  try {
    const lead = await deletedLeadByLeadId(req.params.leadId);
    if (lead) {
      res.status(201).json({ message: "Lead deleted successfully" });
    } else {
      res.status(404).json({ error: "Lead Id not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch lead Details" });
  }
});

async function createNewCommentsToLead(leadId, newComment){
  try {
    const lead = await Lead.findByIdAndUpdate(leadId)
      const comment = new Comment(newComment)
      const savedComment = await comment.save()
      return savedComment
  } catch (error) {
    throw error
  }
}

app.post('/leads/:leadId/comments', async (req,res) => {
  try {
    const comment = await createNewCommentsToLead(req.params.leadId, req.body)
    if(comment){
      res.status(201).json({message: 'New Comment Added successfully', data: comment})
    }else{
      res.status(404).json({error: 'Something wrong in this comment'})
      console.error(error.message)
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment Details" });
  }
})

async function getAllCommentForLead(){
  try {
    const comment = await Comment.find().populate('lead').populate('author')
    return comment
  } catch (error) {
    throw error
  }
}
 
app.get('/leads/comment', async (req,res) => {
  try {
    const comment = await getAllCommentForLead()
    if(comment){
      res.status(201).json({message: 'All comments this', data: comment})
    }else{
      res.status(404).json({error: 'Something wrong in this comment'})
    }
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch comment Details'})
    console.error(error.message)
  }
})

async function getReportClosedAtLastWeek(){
  try {
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    const lead = await Lead.find({
      status: "Closed",
      closedAt: {
        $gte: sevenDaysAgo
      }
    })
    .populate('salesAgent')
    .select('name salesAgent closedAt')

    // console.log('Lead: ', lead)

    return lead
  } catch (error) {
    throw error
  }
}

app.get('/report/last-week', async (req,res) => {
  try {
    const report = await getReportClosedAtLastWeek()
    res.status(201).json({message: 'Last week data is this: ', data: report})
  } catch (error) {
        res.status(500).json({error: 'Failed to fetch report Details'})
        console.error(error.message)
  }
})

async function getTotalLeadsInPipeline(){
  try {
    const count = await Lead.countDocuments({
      status: { $ne: 'Closed'}
    })
    return count
  } catch (error) {
    throw error
  }
}

app.get('/report/pipeline', async (req,res) => {
  try {
    const total = await getTotalLeadsInPipeline()
    console.log('total: ',total);

    if(total){
      res.status(201).json({totalLeadsInPipeline: total})
    }else{
      re.status(404).json({error: 'Something wrong in pipeline data'})
      console.error(error.message)
    }
  } catch (error) {
    res.status(500).json({error: 'Failed to fetch report data'})
  }
})

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server is running on 3001");
});