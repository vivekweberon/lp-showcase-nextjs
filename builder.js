const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { exec } = require('child_process');

// ------------------------------
// Set up command line options using yargs
// ------------------------------
const argv = yargs
  .option('name', {
    alias: 'n',
    describe: 'Directory name to set in basePath and siteName',
    type: 'string',
    demandOption: true
  })
  .option('config', {
    alias: 'c',
    describe: 'Path to next.config.js file',
    type: 'string',
    default: 'next.config.js'
  })
  .option('messagesDir', {
    alias: 'm',
    describe: 'Path to messages directory',
    type: 'string',
    default: 'messages'
  })
  .option('mauticTrackerDir', {
    alias: 't',
    describe: 'Path to Mautic tracker JS directory',
    type: 'string',
    default: 'mautic_tracker/js'
  })
  .option('dataDir', {
    alias: 'd',
    describe: 'Path to data directory',
    type: 'string',
    default: 'data'
  })
  .option('publicDir', {
    alias: 'p',
    describe: 'Path to public directory',
    type: 'string',
    default: 'public'
  })
  .option('buildCmd', {
    alias: 'b',
    describe: 'Command to build the project',
    type: 'string',
    default: 'npm run build'
  })
  .help()
  .argv;

// ------------------------------
// Validation and exit function
// ------------------------------
const { runValidation } = require('./utils/inCodeValidation.js');

function validateAndExit() {
  // Run validation first
  runValidation();

  // Check for errorMessage.json in the provided messagesDir
  const errorMessagePath = path.join(__dirname, argv.messagesDir, 'errorMessage.json');
  console.log("🔍 Checking for errorMessage.json at:", errorMessagePath);

  if (fs.existsSync(errorMessagePath)) {
    console.error("🚫 errorMessage.json detected. Aborting execution.");
    process.exit(1); // Exit script immediately
  }
}

// ------------------------------
// Update next.config.js Section
// ------------------------------
const configPath = path.join(__dirname, argv.config);
const websiteDirectoryName = argv.name;

try {
  let configContent = fs.readFileSync(configPath, 'utf8');

  // Update basePath and siteName values
  configContent = configContent
    .replace(/basePath:\s*"\/[^"]*"/, `basePath: "/${websiteDirectoryName}"`)
    .replace(/siteName:\s*'[^']*'/, `siteName: '${websiteDirectoryName}'`);

  fs.writeFileSync(configPath, configContent, 'utf8');
  console.log(`✅ Updated ${argv.config} with basePath: "/${websiteDirectoryName}" and siteName: '${websiteDirectoryName}'`);
} catch (error) {
  console.error('❌ Error updating next.config.js:', error);
  process.exit(1);
}

// ------------------------------
// Function to copy the Mautic tracker JS files
// ------------------------------
function copyMauticTrackerJSFiles() {
  console.log("📦 Copying Mautic tracker JS files to public/js folder...");

  const sourceDir = path.join(__dirname, argv.mauticTrackerDir);
  const targetDir = path.join(__dirname, argv.publicDir, 'js');

  try {
    fs.mkdirSync(targetDir, { recursive: true });

    if (!fs.existsSync(sourceDir)) {
      console.warn("⚠️ Mautic tracker JS source directory does not exist. Skipping...");
      return;
    }

    fs.cpSync(sourceDir, targetDir, { recursive: true });
    console.log("✅ Mautic tracker JS files copied successfully.");
  } catch (error) {
    console.error("❌ Error copying Mautic tracker JS files:", error);
    process.exit(1);
  }
}

// ------------------------------
// Function to copy images folders to public
// ------------------------------
function copyFoldersToPublic() {
  const processInfo = "Copying images directories (if present) to public";
  console.log(`Starting: ${processInfo}`);

  // Create public/data folder
  try {
    fs.mkdirSync(path.join(__dirname, argv.publicDir, 'data'), { recursive: true });
  } catch (err) {
    console.error("❌ Error: Failed to create public/data directory", err);
    process.exit(1);
  }

  // Get list of directories in data folder (parameterized)
  const dataPath = path.join(__dirname, argv.dataDir);
  let dirs;
  try {
    dirs = fs.readdirSync(dataPath);
  } catch (err) {
    console.error("❌ Error: Failed to read data directory", err);
    process.exit(1);
  }

  // Loop over each subdirectory in data/ (excluding 'global')
  dirs.forEach(dir => {
    const currentDirPath = path.join(dataPath, dir);
    if (fs.statSync(currentDirPath).isDirectory() && dir !== 'global') {
      const imagesDirPath = path.join(currentDirPath, 'images');
      if (fs.existsSync(imagesDirPath) && fs.statSync(imagesDirPath).isDirectory()) {
        const targetDir = path.join(__dirname, argv.publicDir, 'data', dir);
        try {
          fs.mkdirSync(targetDir, { recursive: true });
        } catch (err) {
          console.error(`❌ Error: Failed to create ${targetDir}`, err);
          process.exit(1);
        }
        try {
          fs.cpSync(imagesDirPath, path.join(targetDir, 'images'), { recursive: true });
        } catch (err) {
          console.error(`❌ Error: Failed to copy images to ${targetDir}`, err);
          process.exit(1);
        }
      }
    }
  });

  // Copy only the images folder from data/global to public/images
  const globalImagesDir = path.join(__dirname, argv.dataDir, 'global', 'images');
  const publicImagesDir = path.join(__dirname, argv.publicDir, 'images');
  try {
    if (fs.existsSync(publicImagesDir)) {
      fs.rmSync(publicImagesDir, { recursive: true, force: true });
    }
    fs.mkdirSync(publicImagesDir, { recursive: true });
    fs.cpSync(globalImagesDir, publicImagesDir, { recursive: true });
  } catch (err) {
    console.error(`❌ Error: Failed to copy images from ${globalImagesDir} to ${publicImagesDir}`, err);
    process.exit(1);
  }
  console.log(`Finished: ${processInfo}`);
}

// ------------------------------
// Function to rename folders in public/data
// ------------------------------
const { getPropertyOutputDirectoryName } = require('./utils/renameUtils.js');

async function renameFolders(directory) {
  console.log(`Renaming folders in ${directory}`);

  const folders = fs.readdirSync(directory);
  for (const folder of folders) {
    const folderPath = path.join(directory, folder);
    if (fs.statSync(folderPath).isDirectory()) {
      if (folder === 'global') continue;

      if (/^[0-9-]+$/.test(folder)) {
        let newFolderName;
        try {
          newFolderName = getPropertyOutputDirectoryName(folder);
          if (newFolderName instanceof Promise) {
            newFolderName = await newFolderName;
          }
        } catch (error) {
          console.error(`❌ Error generating new name for ${folder}:`, error);
          process.exit(1);
        }

        newFolderName = newFolderName.trim();
        if (newFolderName.length > 0) {
          const newFolderPath = path.join(directory, newFolderName);
          try {
            fs.renameSync(folderPath, newFolderPath);
            console.log(`Renamed ${folder} to ${newFolderName}`);
          } catch (error) {
            console.error(`❌ Error renaming folder ${folder} to ${newFolderName}:`, error);
            process.exit(1);
          }
        } else {
          console.error(`❌ Error: New folder name is empty for ${folder}`);
        }
      } else {
        console.log(`Skipping ${folder} as it does not match the pattern`);
      }
    }
  }
}

async function renamingPublicDataDirectories() {
  const publicDataPath = path.join(__dirname, argv.publicDir, 'data');
  if (!fs.existsSync(publicDataPath)) {
    console.error("❌ Error: public/data directory does not exist");
    process.exit(1);
  }
  await renameFolders(publicDataPath);
}

// ------------------------------
// Function to run the build command
// ------------------------------
function runBuild() {
  console.log("🚀 Starting project build...");
  const child = exec(argv.buildCmd);

  child.stdout.on('data', (data) => console.log(data.toString()));
  child.stderr.on('data', (data) => console.error(data.toString()));

  child.on('close', (code) => {
    if (code === 0) {
      console.log("✅ Finished project build");
    } else {
      console.error(`❌ Build failed with exit code ${code}`);
      process.exit(1);
    }
  });
}

// ------------------------------
// Main Execution
// ------------------------------
async function main() {
  validateAndExit();
  // copyMauticTrackerJSFiles(); // Uncomment if needed
  copyFoldersToPublic();
  await renamingPublicDataDirectories();
  runBuild();
}

main();
