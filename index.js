const express = require("express");
const app = express();
const cors = require("cors");

app.use(express.json());
app.use(cors());

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

async function getLeadStatusCounts() {
  try {
    const result = await Lead.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);
    return result;
  } catch (error) {
    throw error;
  }
}

app.get("/leads/status-count", async (req, res) => {
  try {
    const data = await getLeadStatusCounts();
    if (data) {
      res.status(200).json({ message: "Lead status counts", data });
    } else {
      res.status(404).json({ error: "Lead Status not found" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch status counts" });
  }
});

async function getLeadsDataByLeadStatus(leadStatus) {
  try {
    const lead = await Lead.findOne({ status: leadStatus });
    return lead;
  } catch (error) {
    throw error;
  }
}

app.get("/leads/:leadStatus", async (req, res) => {
  try {
    const lead = await getLeadsDataByLeadStatus(req.params.leadStatus);
    if (lead) {
      res.status(200).json({ message: "Lead Status is this: ", data: lead });
    } else {
      res.status(404).json({ error: "This Lead Status not exist" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch Lead Data" });
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

async function createNewCommentsToLead(leadId, authorId, newComment) {
  try {
    const comment = new Comment({
      lead: leadId,
      author: authorId,
      commentText: newComment,
    });
    const savedComment = await comment.save();
    return savedComment;
  } catch (error) {
    throw error;
  }
}

app.post("/leads/:id/comments", async (req, res) => {
  try {
    const { commentText, author } = req.body;
    const comment = await createNewCommentsToLead(req.params.id, author, commentText);
    if (comment) {
      res.status(201).json({ message: "New Comment Added successfully", data: comment });
    } else {
      res.status(404).json({ error: "Something wrong in this comment" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment Details" });
  }
});

async function getAllCommentDetailByCommentId(leadId) {
  try {
    const comment = await Comment.find({lead: leadId})
      .populate("lead")
      .populate("author");
    return comment;
  } catch (error) {
    throw error;
  }
}

app.get("/leads/:leadId/comments", async (req, res) => {
  try {
    const comment = await getAllCommentDetailByCommentId(req.params.leadId);
    if (comment) {
      res.status(201).json({ message: "All comments this", data: comment });
    } else {
      res.status(404).json({ error: "Something wrong in this comment" });
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch comment Details" });
  }
})

async function getReportClosedAtLastWeek() {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const lead = await Lead.find({
      status: "Closed",
      closedAt: {
        $gte: sevenDaysAgo,
      },
    })
      .populate("salesAgent")
      .select("name salesAgent closedAt");

    // console.log('Lead: ', lead)

    return lead;
  } catch (error) {
    throw error;
  }
}

app.get("/report/last-week", async (req, res) => {
  try {
    const report = await getReportClosedAtLastWeek();
    res.status(201).json({ message: "Last week data is this: ", data: report });
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report Details" });
    console.error(error.message);
  }
});

async function getTotalLeadsInPipeline() {
  try {
    const count = await Lead.countDocuments({
      status: { $ne: "Closed" },
    });
    return count;
  } catch (error) {
    throw error;
  }
}

app.get("/report/pipeline", async (req, res) => {
  try {
    const total = await getTotalLeadsInPipeline();
    console.log("total: ", total);

    if (total) {
      res.status(201).json({ totalLeadsInPipeline: total });
    } else {
      re.status(404).json({ error: "Something wrong in pipeline data" });
      console.error(error.message);
    }
  } catch (error) {
    res.status(500).json({ error: "Failed to fetch report data" });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log("Server is running on 3001");
});
