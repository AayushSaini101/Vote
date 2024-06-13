// .github/scripts/vote_tracker.js

const commentBody = process.env.COMMENT_BODY;

console.log("Comment Body:", commentBody);

// Function to extract information from the comment body
function extractVoteDetails(comment) {
    const votePassedRegex = /The vote \*\*(\w+)\*\*/;
    const percentageRegex = /`(\d+.\d+)%` of the users with binding vote/;
    const thresholdRegex = /passing threshold: `(\d+)%`/;
    const summaryRegex = /### Summary([\s\S]+)### Binding votes/;
    const bindingVotesRegex = /### Binding votes \(\d+\)([\s\S]+)/;

    const votePassedMatch = comment.match(votePassedRegex);
    const percentageMatch = comment.match(percentageRegex);
    const thresholdMatch = comment.match(thresholdRegex);
    const summaryMatch = comment.match(summaryRegex);
    const bindingVotesMatch = comment.match(bindingVotesRegex);

    const votePassed = votePassedMatch ? votePassedMatch[1] : null;
    const percentage = percentageMatch ? percentageMatch[1] : null;
    const threshold = thresholdMatch ? thresholdMatch[1] : null;
    const summary = summaryMatch ? summaryMatch[1].trim() : null;
    const bindingVotes = bindingVotesMatch ? bindingVotesMatch[1].trim() : null;

    return {
        votePassed,
        percentage,
        threshold,
        summary,
        bindingVotes,
    };
}

const voteDetails = extractVoteDetails(commentBody);

console.log("Vote Details: Aayush", voteDetails);

// Further processing can be done here
// e.g., logging the details to a file, updating an external system, etc.
