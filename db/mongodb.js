const { MongoClient, ObjectId } = require("mongodb");

let _db;

// init is responsible for the setup of a connection to MongoDB
// and must be called before any database operation (so, before any getDB())
async function init() {
  const client = new MongoClient(process.env.DB_URL);
  const connection = await client.connect();
  _db = connection.db(process.env.DB_NAME);
}

// getDB returns a MongoDB database object
function getDB() {
  return _db;
}

function toMongoID(id) {
  return new ObjectId(id);
}

module.exports = {
  init,
  getDB,
  toMongoID,
  usersCollection: "users",
  pollsCollection: "Polls",
};
