const sentimentReader = require("../analyze/sentimentReader");

module.exports = {
  getSentiment: async (textItem, tag) => {
    if (textItem) {
      const sentimentScore = sentimentReader.getSentiment(textItem);
      const sentimentResult =
        sentimentScore > 0
          ? "POSITIVE"
          : sentimentScore === 0
          ? "NEUTRAL"
          : "NEGATIVE";

      return { text: textItem, sentiment: sentimentResult, tag };
    }
  },
};
