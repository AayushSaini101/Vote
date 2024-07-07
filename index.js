const yaml = require('js-yaml');
const { readFile, writeFile , readFileSync} = require('fs').promises;
const path = require('path');

const filePath = 'voteTrackingFile.json';  // Update this path as needed

async function processYamlFile() {
   
  const yamlData = await readFile('MAINTAINERS.yaml', 'utf8');
  const parsedData = yaml.load(yamlData);

  const voteDetails = JSON.parse( await readFile(filePath, 'utf8'));
  console.log(voteDetails)
}
//const voteDetails = JSON.parse(fs.readFileSync(filePath, 'utf8'));

processYamlFile();
