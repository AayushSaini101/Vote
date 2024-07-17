const yaml = require('js-yaml');
const { readFile, writeFile } = require('fs').promises;
const path = require('path');

module.exports = async ({ context }) => {
  try {
    // Extract necessary details from the context
    const message = context.payload.comment.body;
    const eventNumber = context.issue.number;
    const eventTitle = context.payload.issue.title;
    const orgName = context.issue.owner;
    const repoName = context.issue.repo;

    // Parse the vote-closed comment to get voting rows
    const votingRows = await parseVoteClosedComment();

    // Extract latest votes information from the parsed voting rows
    const latestVotes = votingRows.map(row => {
        const [, user, vote, timestamp] = row.split('|').map(col => col.trim());
        return {
            user: user.replace('@', ''),
            vote,
            timestamp,
            isVotedInLast3Months: true
        };
    });


    const maintainerInfo = await readFile('MAINTAINERS.yaml', 'utf8');
    const maintainerInformation = yaml.load(maintainerInfo);

    // Update the TSC Members 
    await updateVoteTrackingFile();


    // Read and parse the vote tracking file
    const voteDetails = JSON.parse(await readFile(voteTrackingFile, 'utf8'));
    //  console.log(voteDetails)

    const updatedVoteDetails = [];

    // Process each vote detail to update voting information
    voteDetails.forEach(voteInfo => {
        // Checking only valid vote done by TSC Member
        const isTscMember = maintainerInformation.some(item => item.github === voteInfo.name);

        if (isTscMember) {
            const userVote = latestVotes.find(vote => vote.user === voteInfo.name);
            let currentTime
            if (userVote && userVote.timestamp) {
                currentTime = userVote.timestamp.toString().split(" ")[0];
            }
            const userInfo = latestVotes.find(vote => vote.user === voteInfo.name);
            const voteChoice = userInfo ? userInfo.vote : "Not participated";
            voteInfo.lastVoteClosedTime = "2024-06-14";

            if (userInfo) {
                voteInfo.isVotedInLast3Months = true;
                voteInfo.lastParticipatedVoteTime = currentTime;
                voteInfo[voteChoice === "In favor" ? 'agreeCount' : voteChoice === "Against" ? 'disagreeCount' : 'abstainCount']++;
            } else {
                 voteInfo.notParticipatingCount++;
                if (isVotingWithinLastThreeMonths(voteInfo)) {
                    voteInfo.isVotedInLast3Months = false;
                }
            }

            // Update vote information with the issue title and number
            let updatedVoteInfo = {};
            Object.keys(voteInfo).forEach(key => {
                if (key === 'name') {
                    updatedVoteInfo['name'] = voteInfo.name;
                    updatedVoteInfo[eventTitle + "$$" + eventNumber] = voteChoice;
                } else {
                    updatedVoteInfo[key] = voteInfo[key];
                }
            });
            updatedVoteDetails.push(updatedVoteInfo);
        }
    });

    // Write the updated vote details back to the file
    try {
        await writeFile(voteTrackingFile, JSON.stringify(updatedVoteDetails, null, 2));
    } catch (writeError) {
        console.error('Error writing to voteTrackingFile.json:', writeError);
    }

    // Generate the markdown table and write it to a file
    const markdownTable = await jsonToMarkdownTable(updatedVoteDetails);
    try {
        await writeFile('TSC_VOTING_OVERVIEW.md', markdownTable);
        console.log('Markdown table has been written to TSC_VOTING_OVERVIEW.md');
    } catch (writeError) {
        console.error('Error writing to TSC_VOTING_OVERVIEW.md:', writeError);
    }

    async function jsonToMarkdownTable(data) {
        if (!data || data.length === 0) {
            console.error("Data is empty or undefined");
            return '';
        }
        const keys = Object.keys(data[0]).filter(key => key !== 'firstVoteClosedTime');

        const titles = {
            name: "GitHub user name",
            lastParticipatedVoteTime: "Last time the TSC member participated in a vote",
            hasVotedInLast3Months: "Flag indicating if TSC member voted in last 3 months. This information is calculated after each voting, and not basing on a schedule as there might be moments when there is no voting in place for 3 months and therefore no TSC member votes.",
            lastVoteClosedTime: "Date when last vote was closed. It indicated when the last voting took place and marks the date when this tracking document was updated.",
            agreeCount: "Number of times TSC member agreed in a vote.",
            disagreeCount: "Number of times TSC member did not agree in a vote.",
            abstainCount: "Number of times TSC member abstained from voting.",
            notParticipatingCount: "Number of times TSC member did not participate in voting."
        };

        // Fill missing properties with default values and log the processing
        data = data.map((obj, index) => {
            const newObj = {};
            keys.forEach(key => {
                newObj[key] = obj[key] !== undefined ? obj[key] : 'N/A';
            });
            return newObj;
        });

        let markdownTable = '| ' + keys.map(key => {
            if (key.includes('$$')) {
                const [title, number] = key.split('$$');
                return `[${title}](https://github.com/${orgName}/${repoName}/issues/${number})`;
            }
            return `<span style="position: relative; cursor: pointer;" title="${titles[key] || key}">${key}</span>`;
        }).join(' | ') + ' |\n';

        markdownTable += '| ' + keys.map(() => '---').join(' | ') + ' |\n';
        markdownTable += data.map(obj => '| ' + keys.map(key => {
            if (key === 'name') return `[${obj[key]}](https://github.com/${obj[key]})`;
            if (key.includes('$$')) {
                const icons = {
                    "In favor": "👍",
                    "Against": "👎",
                    "Abstain": "👀",
                    "Not participated": "🔕"
                };
                return `<span style="position: relative; cursor: pointer;" title="${obj[key]}">${icons[obj[key]] || obj[key]}</span>`;
            }
            return obj[key];
        }).join(' | ') + ' |').join('\n');

        return markdownTable;
    }


    // Parse the vote-closed comment created by git-vote[bot]
    async function parseVoteClosedComment() {
        const bindingVotesSectionMatch = message.match(/Binding votes \(\d+\)[\s\S]*?(?=(<details>|$))/);
        const bindingVotesSection = bindingVotesSectionMatch ? bindingVotesSectionMatch[0] : '';
        return bindingVotesSection.match(/\| @\w+.*?\|.*?\|.*?\|/g) || [];
    }

    // Check if voting duration is within the last three months
    function isVotingWithinLastThreeMonths(voteInfo) {
        const currentDate = new Date();
        let previousDate;
        if (voteInfo.isVotedInLast3Months === "Member has not voted in all previous voting process.") {
            previousDate = new Date(voteInfo.firstVoteClosedTime)

        } else {
            previousDate = new Date(voteDetails.lastVoteClosedTime);
        }
        const yearDiff = currentDate.getFullYear() - previousDate.getFullYear();
        const monthDiff = currentDate.getMonth() - previousDate.getMonth();

        const totalMonthsDiff = yearDiff * 12 + monthDiff;
       

        return totalMonthsDiff > 3;
    }

    // Function to update the voteTrackingFile with updated TSC Members 

    async function updateVoteTrackingFile() {
        const tscMembers = maintainerInformation.filter(entry => entry.isTscMember);
        let voteDetails = [];
        try {
            voteDetails = JSON.parse(await readFile(voteTrackingFile, 'utf8'));
        } catch (readError) {
            console.error('Error reading voteTrackingFile.json:', readError);
        }

        const updatedTSCMembers = [];

        const requiredKeys = ['name', 'lastParticipatedVoteTime', 'isVotedInLast3Months', 'lastVoteClosedTime', 'agreeCount', 'disagreeCount', 'abstainCount', 'notParticipatingCount'];

        // Function to check if an object has all required keys
        const isValidExampleMember = (member) => {
            return requiredKeys.every(key => member.hasOwnProperty(key));
        };

        // Find the first valid example member
        const validExampleMember = voteDetails.find(isValidExampleMember);

        if (validExampleMember) {
            tscMembers.forEach(member => {
                const existingMember = voteDetails.find(voteInfo => voteInfo.name === member.github);
                if (!existingMember) {
                    // Create a new member by copying the structure of the valid example member
                    const newMember = {};

                    // Copy the keys from the valid example member to the new member with default values
                    Object.keys(validExampleMember).forEach(key => {
                        switch (key) {
                            case 'name':
                                newMember[key] = member.github;
                                break;
                            case 'lastParticipatedVoteTime':
                                newMember[key] = 'Member has not participated in all previous voting process.';
                                break;
                            case 'isVotedInLast3Months':
                                newMember[key] = 'Member has not participated in all previous voting process.'
                                break;
                            case 'lastVoteClosedTime':
                                newMember[key] = new Date().toISOString().split('T')[0];
                                break;
                            case 'firstVoteClosedTime':
                                newMember[key] = validExampleMember['firstVoteClosedTime']
                                break;
                            case 'agreeCount':
                            case 'disagreeCount':
                            case 'abstainCount':
                            case 'notParticipatingCount':
                                newMember[key] = 0;
                                break;
                            default:
                                newMember[key] = "Not participated";
                        }
                    });

                    updatedTSCMembers.push(newMember);
                }
            });
        } else {
            console.log('No valid example member found in voteDetails.');
        }


        if (updatedTSCMembers.length > 0) {
            try {
                const combinedData = [...voteDetails, ...updatedTSCMembers];
                await writeFile(voteTrackingFile, JSON.stringify(combinedData, null, 2));
            } catch (writeError) {
                console.error('Error writing to voteTrackingFile.json:', writeError);
            }
        }
    }
} catch (error) {
    console.error('Error in while running the vote_tracker workflow:', error);
}

};
