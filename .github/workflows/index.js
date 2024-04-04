const yaml = require('js-yaml');
const fs = require('fs');
const commenterName = '${{ inputs.authorName }}';
let isTSCMember = false;
try {
  // Load YAML file
  const data = yaml.load(fs.readFileSync('../../MAINTAINERS.yaml', 'utf8'));

  // Filter persons who are TSC members and whose GitHub username matches commenterName
  const isTscMember = data.find(person => {
      return (person.isTscMember === true || person.isTscMember === "true") && person.github === commenterName;
  });
  // Check if a TSC member was found
  if(isTscMember) {
      isTSCMember = true;
  }
  
  core.setOutput('isTSCMember', isTSCMember);
} catch (e) {
  console.log(e);
}