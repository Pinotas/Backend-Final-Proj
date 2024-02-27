const express = require("express");
const router = express.Router();
const services = require("./services");
const schemas = require("./schemas");
const { getDB, pollsCollection } = require("../db/mongodb");

router.post("/", async (req, res) => {
  const { error, value } = schemas.createPollSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }
  const db = await getDB();
  const insertRes = await db.collection(pollsCollection).insertOne(value);

  const result = await services.getPollById(insertRes.insertedId);
  res.status(201).json(result);
});

router.put("/:id/vote", async (req, res) => {
  const { error, value } = schemas.voteSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }
  const pollId = req.params.id;
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }
  const db = await getDB();
  const updateRes = await db.collection(pollsCollection).updateOne(
    { _id: poll._id },
    {
      $push: { votes: value },
    }
  );
  if (updateRes.modifiedCount === 0) {
    return res.status(404).json({ error: "No document updated" });
  }

  res.status(201).json(value);
});

router.get("/", async (req, res) => {
  const polls = await services.getAllPolls();
  res.status(200).json(polls);
});

router.get("/:id", async (req, res) => {
  const pollId = req.params.id;
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }
  res.status(200).json(poll);
});

router.delete("/:id", async (req, res) => {
  const pollId = req.params.id;

  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }

  const deleted = await services.deletePollById(pollId);
  if (!deleted) {
    return res.status(500).json({ error: "failed to delete poll" });
  }

  res.status(200).json({ message: "poll deleted successfully" });
});

module.exports = router;
