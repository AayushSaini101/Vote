const yaml = require('js-yaml').;
const { readFile, writeFile , readFileSync} = require('fs').promises;
const { existsSync } = require('fs');
const path = require('path');

const filePath = 'voteTrackingFile.json';  // Update this path as needed

async function processYamlFile() {
    const yamlData = await readFile('MAINTAINERS.yaml', 'utf8');
    const parsedData = await yaml.load(yamlData);
    console.log(parsedData)
  
}

processYamlFile();
