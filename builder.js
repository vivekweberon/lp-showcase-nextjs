const fs = require('fs');
const path = require('path');
const yargs = require('yargs');

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

  // Update basePath and siteName values
  configContent = configContent
    .replace(/basePath:\s*"\/[^"]*"/, `basePath: "/${websiteDirectoryName}"`)
    .replace(/siteName:\s*'[^']*'/, `siteName: '${websiteDirectoryName}'`);

  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log(`Updated next.config.js with basePath: "/${websiteDirectoryName}" and siteName: '${websiteDirectoryName}'`);
} catch (error) {
  console.error('Error updating next.config.js:', error);
  process.exit(1);
}

function copyFoldersToPublic() {
  const processInfo = "Copying images directories (if present) to public";
  console.log(`Starting: ${processInfo}`);

  // Create public/data folder
  try {
    fs.mkdirSync(path.join(__dirname, 'public/data'), { recursive: true });
  } catch (err) {
    console.error("Error: Failed to create public/data directory", err);
    process.exit(1);
  }

  // Get list of directories in data folder
  const dataPath = path.join(__dirname, 'data');
  let dirs;
  try {
    dirs = fs.readdirSync(dataPath);
  } catch (err) {
    console.error("Error: Failed to read data directory", err);
    process.exit(1);
  }

  // Loop over each subdirectory in data/ (excluding 'global')
  dirs.forEach(dir => {
    const currentDirPath = path.join(dataPath, dir);
    if (fs.statSync(currentDirPath).isDirectory() && dir !== 'global') {
      const imagesDirPath = path.join(currentDirPath, 'images');
      if (fs.existsSync(imagesDirPath) && fs.statSync(imagesDirPath).isDirectory()) {
        const targetDir = path.join(__dirname, 'public/data', dir);
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch (err) {
          console.error(`Error: Failed to create public/data/${dir}`, err);
          process.exit(1);
        }
        try {
          // Copy the entire images folder recursively
          fs.cpSync(imagesDirPath, path.join(targetDir, 'images'), { recursive: true });
        } catch (err) {
          console.error(`Error: Failed to copy images to public/data/${dir}`, err);
          process.exit(1);
        }
      }
    }
  });

  // Copy only the images folder from data/global to public/images
  const globalImagesDir = path.join(__dirname, 'data/global/images');
  const publicImagesDir = path.join(__dirname, 'public/images');
  try {
    // Remove the destination directory if it exists to ensure a clean copy.
    if (fs.existsSync(publicImagesDir)) {
      fs.rmSync(publicImagesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicImagesDir, { recursive: true });
    // Copy the contents of data/global/images directly into public/images
    fs.cpSync(globalImagesDir, publicImagesDir, { recursive: true });
  } catch (err) {
    console.error("Error: Failed to copy images from data/global/images to public/images", err);
    process.exit(1);
  }
  console.log(`Finished: ${processInfo}`);
}

// Instead of dynamic import, require the CommonJS module
const { getPropertyOutputDirectoryName } = require('./utils/renameUtils.js');

async function renameFolders(directory) {
  console.log(`Renaming folders in ${directory}`);

  // Get list of folders in the provided directory
  const folders = fs.readdirSync(directory);
  for (const folder of folders) {
    const folderPath = path.join(directory, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      // Skip the global directory if present
      if (folder === 'global') continue;

      // Check if folder name consists of only digits and dashes
      if (/^[0-9-]+$/.test(folder)) {
        let newFolderName;
        try {
          newFolderName = getPropertyOutputDirectoryName(folder);
          // If the function returns a promise, wait for it (unlikely in CommonJS)
          if (newFolderName instanceof Promise) {
            newFolderName = await newFolderName;
          }
        } catch (error) {
          console.error(`Error generating new name for ${folder}:`, error);
          process.exit(1);
        }

        newFolderName = newFolderName.trim();
        if (newFolderName.length > 0) {
          const newFolderPath = path.join(directory, newFolderName);
          try {
            fs.renameSync(folderPath, newFolderPath);
            console.log(`Renamed ${folder} to ${newFolderName}`);
          } catch (error) {
            console.error(`Error renaming folder ${folder} to ${newFolderName}:`, error);
            process.exit(1);
          }
        } else {
          console.error(`Error: New folder name is empty for ${folder}`);
        }
      } else {
        console.log(`Skipping ${folder} as it does not match the pattern`);
      }
    }
  }
}

async function renamingPublicDataDirectories() {
  const publicDataPath = path.join(__dirname, 'public/data');
  if (!fs.existsSync(publicDataPath)) {
    console.error("Error: public/data directory does not exist");
    process.exit(1);
  }
  await renameFolders(publicDataPath);
}

async function main() {
  copyFoldersToPublic();
  await renamingPublicDataDirectories();
}

main();
