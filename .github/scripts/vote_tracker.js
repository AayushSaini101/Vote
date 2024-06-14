const fs = require('fs');

const commentBody = process.env.COMMENT_BODY;

console.log("Comment Body:", commentBody);

// Function to extract information from the comment body
function extractVoteDetails(comment) {
    const votePassedRegex = /The vote \*\*(\w+)\*\*/;
    const percentageRegex = /`(\d+.\d+)%` of the users with binding vote/;
    const thresholdRegex = /passing threshold: `(\d+)%`/;
    const summaryRegex = /### Summary([\s\S]+?)### Binding votes/;
    const bindingVotesRegex = /### Binding votes \(\d+\)([\s\S]+?)(?=<details>|$)/;

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

// Function to clean binding votes section and format as "name totalvotes"
function cleanBindingVotes(bindingVotes) {
    if (!bindingVotes) return null;

    // Remove table formatting and extract rows
    const rows = bindingVotes.split('\n').filter(row => row.trim().startsWith('| @'));

    // Remove all symbols and keep only the data
    const cleanedRows = rows.map(row => {
        const cleanedRow = row.replace(/[|:]/g, '').trim();
        const [user, vote, timestamp] = cleanedRow.split(' ').filter(Boolean);
        return `${user} ${vote}`;
    });

    return cleanedRows.join('\n');
}

const voteDetails = extractVoteDetails(commentBody);

// Clean the binding votes section
if (voteDetails.bindingVotes) {
    voteDetails.bindingVotes = cleanBindingVotes(voteDetails.bindingVotes);
}

// Write the cleaned binding votes to a file
const outputPath = '.github/scripts/binding_votes.txt';
if (voteDetails.bindingVotes) {
    fs.writeFileSync(outputPath, voteDetails.bindingVotes);
    console.log(`Binding votes written to ${outputPath}`);
} else {
    console.log('No binding votes to write.');
}

console.log("Vote Details:", voteDetails);
