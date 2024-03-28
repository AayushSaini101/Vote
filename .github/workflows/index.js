         const yaml = require('js-yaml');
          const fs = require('fs');
          const commenterName = 'AayushSaini101';
          let isTSCMember = false;
          try {
              // Load YAML file
              const data = yaml.load(fs.readFileSync('../../MAINTAINERS.yaml', 'utf8'));
              // Iterate over each person object
              data.forEach(person => {
                  // Check if the person is a TSC member or not
                  if (person.isTscMember && person.github == commenterName) {
                      isTSCMember = true;
                      core.setOutput('isTSCMember', result);
                  }
              });
          } catch (e) {
              console.log(e);
          }