const yaml = require('js-yaml');
const { readFile, writeFile , readFileSync} = require('fs').promises;
const path = require('path');

const filePath = 'voteTrackingFile.json';  // Update this path as needed

async function processYamlFile() {
   
  const yamlData = await readFile('MAINTAINERS.yaml', 'utf8');
  const parsedData = yaml.load(yamlData);

  const tscMembers = parsedData.filter(entry => entry.isTscMember).map(entry => ({
    name: entry.github,
    lastParticipatedVoteTime: '',
    isVotedInLast3Months: 'false',
    lastVoteClosedTime: new Date().toISOString().split('T')[0],
    agreeCount: 0,
    disagreeCount: 0,
    abstainCount: 0,
    notParticipatingCount: 0
  }));
  await writeFile(filePath, JSON.stringify(tscMembers, null, 2));

}
//const voteDetails = JSON.parse(fs.readFileSync(filePath, 'utf8'));

processYamlFile();
