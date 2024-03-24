const fs = require('fs');

// Path to your JSON file
const filePath = '../../users.json';

// Read the JSON file
fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) {
        console.error('Error reading file:', err);
        return;
    }

    try {
        // Parse JSON data
        const jsonData = JSON.parse(data);

        // Iterate over each object in the array
        jsonData.forEach(item => {
            console.log('Name:', item.name);
            console.log('GitHub:', item.github);
            console.log('LinkedIn:', item.linkedin);
            console.log('Slack:', item.slack);
            console.log('Twitter:', item.twitter);
            console.log('Available for hire:', item.availableForHire);
            console.log('Repos:', item.repos.join(', '));
            console.log(''); // Add an empty line for separation
        });
    } catch (parseError) {
        console.error('Error parsing JSON data:', parseError);
    }
});