const fs = require('fs');
const path = require('path');
const yargs = require('yargs');
const { exec } = require('child_process');
const { runValidation } = require('./utils/inCodeValidation.js');
const { getPropertyOutputDirectoryName } = require('./utils/renameUtils.js');

const argv = yargs
  .option('websiteName', {
    alias: 'n',
    describe: 'Comma separated list of website names where the pages will be deployed (these become the basePath values)',
    type: 'string',
    demandOption: true
  })
  .option('siteName', {
    alias: 's',
    describe: 'Comma separated list of site names that will be used in the data files',
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

// Path to the configuration file
const configPath = path.join(__dirname, argv.config);

// Parse comma separated values for websiteName and siteName
const websiteNames = argv.websiteName.split(',').map(name => name.trim());
const siteNames = argv.siteName.split(',').map(name => name.trim());

if (websiteNames.length !== siteNames.length) {
  console.error("❌ Error: The number of website names must match the number of site names.");
  process.exit(1);
}

function validateAndExit() {
  // Run validation first
  runValidation();

  // Check for errorMessage.json in the provided messagesDir
  const errorMessagePath = path.join(__dirname, argv.messagesDir, 'errorMessage.json');
  console.log("DirName:", __dirname);
  console.log("🔍 Checking for errorMessage.json at:", errorMessagePath);

  if (fs.existsSync(errorMessagePath)) {
    console.error("🚫 errorMessage.json detected. Aborting execution.");
    process.exit(1);
  }
}

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

// Helper function to move (rename) a directory.
// If fs.renameSync fails due to permission issues, it copies the directory and then removes the original.
function moveDirectory(source, dest) {
  try {
    fs.renameSync(source, dest);
    console.log(`Renamed directory from ${source} to ${dest}`);
  } catch (err) {
    if (err.code === 'EPERM') {
      console.warn(`⚠️ Rename failed due to permissions. Attempting copy and delete...`);
      try {
        fs.cpSync(source, dest, { recursive: true });
        fs.rmSync(source, { recursive: true, force: true });
        console.log(`Moved directory by copying from ${source} to ${dest} and deleting ${source}`);
      } catch (copyErr) {
        console.error(`❌ Error during copy and delete:`, copyErr);
        process.exit(1);
      }
    } else {
      console.error(`❌ Error renaming directory from ${source} to ${dest}:`, err);
      process.exit(1);
    }
  }
}

// Updated runBuild function to return a Promise
function runBuild() {
  return new Promise((resolve, reject) => {
    console.log("🚀 Starting project build...");
    const child = exec(argv.buildCmd);

    child.stdout.on('data', (data) => console.log(data.toString()));
    child.stderr.on('data', (data) => console.error(data.toString()));

    child.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Finished project build");
        resolve();
      } else {
        console.error(`❌ Build failed with exit code ${code}`);
        reject(new Error(`Build failed with exit code ${code}`));
      }
    });
  });
}

async function main() {
  // Pre-build tasks (run once)
  validateAndExit();
  copyMauticTrackerJSFiles();
  copyFoldersToPublic();
  await renamingPublicDataDirectories();

  // Loop over each website name and corresponding site name to update config, build, and rename output folder
  for (let i = 0; i < websiteNames.length; i++) {
    const website = websiteNames[i];
    const site = siteNames[i];

    console.log(`\n🔄 Processing build for website: ${website} with site name: ${site}`);

    // Update next.config.js for the current website build
    try {
      let configContent = fs.readFileSync(configPath, 'utf8');
      configContent = configContent
        .replace(/basePath:\s*"\/[^"]*"/, `basePath: "/${website}"`)
        .replace(/siteName:\s*'[^']*'/, `siteName: '${site}'`);
      fs.writeFileSync(configPath, configContent, 'utf8');
      console.log(`✅ Updated ${argv.config} with basePath: "/${website}" and siteName: '${site}'`);
    } catch (error) {
      console.error('❌ Error updating next.config.js:', error);
      process.exit(1);
    }

    // Run the build command and wait for it to finish
    try {
      await runBuild();
    } catch (error) {
      process.exit(1);
    }

    // Move (rename) the default 'out' directory to the website name (without any prefix)
    const outDir = path.join(__dirname, 'out');
    const newDir = path.join(__dirname, website);
    moveDirectory(outDir, newDir);
  }
}

main();
