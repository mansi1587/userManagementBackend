require("dotenv").config();

const {
  runUserAgent,
} = require("./agents/userAgent");

const test = async () => {
  const answer =
    await runUserAgent(
    //   "How many users are from Madhya Pradesh?"
    "How many users are interested in Reading?"
    );

  console.log("\nAgent Answer:");
  console.log(answer);
};

test();