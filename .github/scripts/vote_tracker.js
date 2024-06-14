const fs = require('fs');

const message = process.env.COMMENT_BODY;


const bindingVotesSectionMatch = message.match(/Binding votes \(\d+\)[\s\S]*?(?=<details>)/);
if (!bindingVotesSectionMatch) {
  console.error('No binding votes section found');
  return;
}
const bindingVotesSection = bindingVotesSectionMatch[0];

// Extract the rows of the table using a more flexible regex
const rows = bindingVotesSection.match(/\| @\w+.*?\|.*?\|.*?\|/g);

if (!rows) {
  console.error('No binding vote rows found');
  return;
}

// Parse the extracted rows to get user names, votes, and timestamps
const bindingVotes = rows.map(row => {
  const columns = row.split('|').map(col => col.trim());
  return {
    user: columns[1],
    vote: columns[2],
    timestamp: columns[3]
  };
});

fs.writeFile('voteTracking.json', JSON.stringify(bindingVotes, null, 2), (err) => {
  if (err) {
    console.error('Error writing to JSON file', err);
  } else {
    console.log('Binding votes data has been saved to bindingVotes.json');
  }
});
