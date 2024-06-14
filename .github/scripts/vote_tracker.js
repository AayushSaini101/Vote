const fs = require('fs');
const path = require('path');

const message = process.env.COMMENT_BODY;

// Adjusted regex to handle both cases: with and without <details>
const bindingVotesSectionMatch = message.match(/Binding votes \(\d+\)[\s\S]*?(?=(<details>|$))/);

if (!bindingVotesSectionMatch) {
  console.error('No binding votes section found');
  process.exit(1);
}

const bindingVotesSection = bindingVotesSectionMatch[0];

// Extract the rows of the table using a more flexible regex
const rows = bindingVotesSection.match(/\| @\w+.*?\|.*?\|.*?\|/g);

if (!rows) {
  console.error('No binding vote rows found');
  process.exit(1);
}

// Parse the extracted rows to get user names, votes, and timestamps
const newBindingVotes = rows.map(row => {
  const columns = row.split('|').map(col => col.trim());
  return {
    user: columns[1],
    vote: columns[2],
    timestamp: columns[3]
  };
});

// Read existing binding votes data from bindingVotes.json
let existingBindingVotes = [];
const filePath = path.join('bindingVotes.json');

try {
  if (fs.existsSync(filePath)) {
    const data = fs.readFileSync(filePath, 'utf8');
    existingBindingVotes = JSON.parse(data);
  }
} catch (err) {
  console.error('Error reading bindingVotes.json', err);
}

// Function to check if a user has voted in the last 90 days
function hasVotedInLast90Days(userVotes) {
  const ninetyDaysAgo = new Date();
  ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

  const lastVoteTimestamp = userVotes[userVotes.length - 1].timestamp;  // Assuming votes are ordered by timestamp
  const lastVoteDate = new Date(lastVoteTimestamp);

  return lastVoteDate > ninetyDaysAgo;
}

// Update or add new binding votes to existingBindingVotes
newBindingVotes.forEach(newVote => {
  const existingUserIndex = existingBindingVotes.findIndex(vote => vote.user === newVote.user);

  if (existingUserIndex !== -1) {
    // User exists in existingBindingVotes
    const userVotes = existingBindingVotes[existingUserIndex].votes;

    // Check if user has voted in the last 90 days
    const votedRecently = hasVotedInLast90Days(userVotes);

    if (votedRecently) {
      console.log(`User ${newVote.user} has voted in the last 90 days.`);
      // Update existing vote with new timestamp
      existingBindingVotes[existingUserIndex].votes.push(newVote);
    } else {
      console.log(`User ${newVote.user} has not voted in the last 90 days.`);
      // Replace existing votes with new votes
      existingBindingVotes[existingUserIndex].votes = [newVote];
    }
  } else {
    // User does not exist in existingBindingVotes, add new entry
    existingBindingVotes.push({
      user: newVote.user,
      votes: [newVote]
    });

    console.log(`Added user ${newVote.user} to bindingVotes.json.`);
  }
});

// Write the updated binding votes data to bindingVotes.json
fs.writeFile(filePath, JSON.stringify(existingBindingVotes, null, 2), (err) => {
  if (err) {
    console.error('Error writing to JSON file', err);
  } else {
    console.log('Updated binding votes data has been saved to bindingVotes.json');
  }
});
