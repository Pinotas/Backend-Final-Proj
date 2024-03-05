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
  const pollId = req.params.id;
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "poll not found" });
  }
  res.status(200).json(poll);
});

router.get("/:id", async (req, res) => {
  const pollId = req.params.id;
  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "Poll Not Found" });
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
    return res.status(404).json({ error: "Poll Not Found" });
  }
  if (poll.expiresAt && poll.expiresAt < new Date()) {
    return res.status(400).json({ error: "expired poll" });
  }

  const uptadeResult = await services.votePoll(pollId, option);
  if (!uptadeResult) {
    return res.status(500).json({ error: "Failed To Vote" });
  }
  res.status(200).json({ message: "Voted!" });
});

router.delete("/:id", async (req, res) => {
  const pollId = req.params.id;

  const poll = await services.getPollById(pollId);
  if (!poll) {
    return res.status(404).json({ error: "Poll Not Found" });
  }

  const deleted = await services.deletePollById(pollId);
  if (!deleted) {
    return res.status(500).json({ error: "Failed To Delete Poll" });
  }

  res.status(200).json({ message: "Poll Deleted Successfully" });
});

module.exports = router;
