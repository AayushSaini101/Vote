const fs = require('fs').promises; // using promises version of fs
const filePath = 'TSC_MEMBERS.json';
const commenterName = '${{inputs.authorName}}';
console.log(commenterName);
let isTSCMember = false;

async function readFileAndProcess() {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    // Iterate over each object in the array
    jsonData.forEach(item => {
      if (item.github === commenterName) {
        isTSCMember = true;
      }
    });
    return isTSCMember;
  } catch (error) {
    throw error;
  }
}

(async () => {
  try {
    const result = await readFileAndProcess();
    console.log('Is TSC Member:', result);
    core.setOutput('isTSCMember', result);
  } catch (error) {
    console.error('Error:', error);
  }
})();