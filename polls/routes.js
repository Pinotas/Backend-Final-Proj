const express = require("express");
const router = express.Router();
const services = require("./services");
const { options } = require("joi");
const schemas = require("./schemas");
const middle = require("../middleware");

router.get("/", async (req, res) => {
  const polls = await services.getAllPolls();
  res.status(200).json(polls);
});

router.get("/:id", async (req, res) => {
  const poll = await services.getPollById(req.params.id);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }
  res.status(200).json(poll);
});

router.use(middle.auth);

router.post("/", async (req, res) => {
  const { error, value } = schemas.createPollSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }

  value.options = value.options.map((option) => ({ option, votes: 0 }));

  const createPoll = await services.createPoll(value, options);
  res.status(201).json(createPoll);
});

router.put("/:id/vote", async (req, res) => {
  const pollId = req.params.id;
  const option = req.body.option;

  const { error, value } = schemas.voteSchema.validate(req.body);
  if (error) {
    return res.status(400).json(error.details);
  }
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }
  const uptadeResult = await services.votePoll(pollId, option);
  if (!uptadeResult) {
    return res.status(500).json({ error: "failed to vote" });
  }
  res.status(200).json({ message: "voted!" });
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
