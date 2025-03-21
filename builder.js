const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

// Set up yargs to get the name argument
const argv = yargs
  .option('name', {
    alias: 'n',
    describe: 'Directory name to set in basePath and siteName',
    type: 'string',
    demandOption: true
  })
  .help()
  .argv;

const configPath = path.join(__dirname, 'next.config.js');
const websiteDirectoryName = argv.name;

try {
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Replace basePath and siteName dynamically
  configContent = configContent
    .replace(/basePath:\s*"\/[^"]*"/, `basePath: "/${websiteDirectoryName}"`)
    .replace(/siteName:\s*'[^']*'/, `siteName: '${websiteDirectoryName}'`);

  fs.writeFileSync(configPath, configContent, 'utf8');

  console.log(`Updated next.config.js with basePath: "/${websiteDirectoryName}" and siteName: '${websiteDirectoryName}'`);
} catch (error) {
  console.error('Error updating next.config.js:', error);
}
