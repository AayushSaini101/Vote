const yaml = require('js-yaml');
const fs = require('fs');
const commenterName = 'AayushSaini101';

try {
    // Load YAML file
    const data = yaml.load(fs.readFileSync('../../MAINTAINERS.yaml', 'utf8'));

    let isTSCMember = false;
    
    // Filter persons who are TSC members and whose GitHub username matches commenterName
    const filteredPersons = data.filter(person => {
        return (person.isTscMember === true || person.isTscMember === "true") && person.github === commenterName;
    });

    // Log filtered persons
    filteredPersons.forEach(person => {
        isTSCMember = true;
    });
   
    core.setOutput('isTSCMember', isTSCMember);
} catch (e) {
    console.log(e);
}