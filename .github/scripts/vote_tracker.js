const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');
const message = process.env.COMMENT_BODY;
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

function insertVotingDetails(newBindingVotes){

  let existingData = fs.readFileSync(filePath);
  existingData = JSON.parse(existingData);

  // Push new data into existing array
  existingData.push(...newBindingVotes)
  
}
// Parse the extracted rows to get user names, votes, and timestamps
const newBindingVotes = rows.map(row => {
  const columns = row.split('|').map(col => col.trim());
  return {
    user: columns[1],
    vote: columns[2],
    timestamp: columns[3],
    isVotedInLast3Month: true
  };
});
console.log(newBindingVotes)

const filePath = path.join( 'VoteTracking.json');

// Check if the file exists
if (!fs.existsSync(filePath)) {
    // File does not exist, create a new one with initial content
    const yamlData = fs.readFileSync("../../MAINTAINERS.yml", 'utf8');
    const parsedData = yaml.load(yamlData);
    const tscMembers = parsedData.filter(entry => entry.isTscMember === true)
                                 .map(entry => ({
                                     name: entry.github,
                                     isVotedInLast3Months: "Not Started",
                                     lastClosedVoteTime: new Date().toISOString()
                                 }));

    fs.writeFileSync(filePath, JSON.stringify(tscMembers, null, 2));
} 
else {
verifyVotingTime(newBindingVotes);
}
function verifyVotingTime(newBindingVotes){
  const voteDetailsAll = fs.readFileSync(filePath, 'utf8');
  const voteDetails =  JSON.parse(voteDetailsAll)
  voteDetails.forEach(voteinfo=>{
    const index = newBindingVotes.findIndex(vote=>vote.user==voteinfo.name)
    const currentTime = new Date().toISOString;
    if(index!=-1){
      voteinfo["isVotedInLast3Months"]=true
      voteinfo["lastClosedVoteTime"]=currentTime

    }
    else{
      const lastVoteDate = new Date(voteinfo.lastClosedVoteTime);
      const currentDate = new Date();
      const diffInMilliseconds = currentDate - lastVoteDate;
      const threeMonthsInMilliseconds = 3 * 30 * 24 * 60 * 60 * 1000;
      if (diffInMilliseconds <= threeMonthsInMilliseconds && voteinfo.isVotedInLast3Months!=="Not Started") {
        voteinfo.isVotedInLast3Months = true;
        voteinfo.lastClosedVoteTime = currentTime;
    } else {
        voteinfo.isVotedInLast3Months = false;
    }
    }
  })
  fs.writeFileSync(filePath, JSON.stringify(voteDetails, null, 2));
}

