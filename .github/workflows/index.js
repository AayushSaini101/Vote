const fs = require('fs');
const filePath = '../../users.json';
const commenterName = "AayushSaini101"

let isTSCMember = false;
function readFileAndProcess(callback) {
fs.readFile(filePath, 'utf8', (err, data) => {
try {
  const jsonData = JSON.parse(data);

  // Iterate over each object in the array
  jsonData.forEach(item => {
      console.log(item.github);
      if (item.github === commenterName) {
          isTSCMember = true;
      }
  });

  // Invoke the callback function with the result
  callback(null, isTSCMember);
} catch (parseError) {
  callback(parseError, null);
}
});
}


readFileAndProcess((error, result) => {
if (error) {
  console.error('Error:', error);
} else {
  console.log('Is TSC Member:', result);
   core.setOutput('isTSCMember', isTSCMember);
}
});
