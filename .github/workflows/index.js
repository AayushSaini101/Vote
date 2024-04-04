const yaml = require('js-yaml');
const fs = require('fs');
const commenterName = 'AayushSaini101';

try {
    // Load YAML file
    const data = yaml.load(fs.readFileSync('../../MAINTAINERS.yaml', 'utf8'));

    let isTSCMember = false;
    
    // Filter persons who are TSC members and whose GitHub username matches commenterName
    const istscMember = data.find(person => {
        return (person.isTscMember === true || person.isTscMember === "true") && person.github === commenterName;
    });
    // Check if a TSC member was found
if (istscMember) {
    isTSCMember = true;
}
   
    core.setOutput('isTSCMember', isTSCMember);
} catch (e) {
    console.log(e);
}
