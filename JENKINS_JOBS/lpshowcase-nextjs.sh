#!/bin/bash

# Print the repository URLs to verify they are passed correctly
echo "Cloning repositories..."
echo "Input data repository: $WEBSITE_DATA_REPO"

# Change to the Jenkins workspace directory
cd "$WORKSPACE" || { echo "Error: Couldn't access workspace directory"; exit 1; }

# Clone the input data repository using credentials
echo "Cloning input data repository..."
git clone "https://$GITHUB_USERNAME:$GITHUB_TOKEN@github.com/vivekweberon/$WEBSITE_DATA_REPO.git" data || { echo "Failed to clone input data repository"; exit 1; }

echo "Cloning Mautic tracker repository..."
git clone "https://$GITHUB_USERNAME:$GITHUB_TOKEN@$MAUTIC_TRACKER"

echo "Repositories cloned successfully."

# Print out the contents of the code repository
echo "Listing contents of the code repository:"
ls -l

# Print out the contents of next.config.js to verify the changes
echo "Updated next.config.js:"
cat next.config.js

# Function to echo start message
echoStart() {
    echo "Starting $1"
}

# Function to echo end message
echoEnd() {
    echo "Finished $1"
}

# Function to check if command was successful
chkCMD() {
    if [ $? -ne 0 ]; then
        echo "Error: Command failed"
        exit 1
    fi
}

# Function to set up NodeJS
setUPNodeJS() {
    processInfo="Setting up NodeJS - Specific Version"
    echoStart "$processInfo"
    source $JENKINS_HOME/.bashrc
    # Check if nvm is installed
    if ! command -v nvm &> /dev/null; then
        echo "nvm is not installed. Please install nvm first."
        return 1
    fi
    nvm --version
    # Install and use the specific Node.js version
    NODE_VERSION="v22.4.1"
    npm_VERSION="v10.8.1"
    nvm install $NODE_VERSION; chkCMD
    nvm use $NODE_VERSION; chkCMD
    # Check if the desired npm version is installed
    current_npm_version=$(npm -v)
    if [ "$current_npm_version" != "$npm_VERSION" ]; then
        npm install -g npm@$npm_VERSION; chkCMD
    fi
    echo "Node version: $(node -v)"
    echo "npm version: $(npm -v)"
    echoEnd "$processInfo"
}

# Function to install dependencies
installDependencies() {
    processInfo="Installing Dependencies"
    echoStart "$processInfo"
    npm install || { echo "Error: Dependency installation failed"; exit 1; }
    echoEnd "$processInfo"
}

# Function to print out the contents of the data folder
listDataFolderContents() {
    echo "Listing contents of the data folder:"
    ls -l data
}

runBuilder() {
    echo "Running builder.js..."
    node ./builder.js --websiteName $WEBSITE_DIRECTORY_NAME --siteName $siteName --config $config --messagesDir $messagesDir --mauticTrackerDir $mauticTrackerDir --dataDir $dataDir --publicDir $publicDir --buildCmd $buildCmd || { echo "Error: builder.js execution failed"; exit 1; }
    echo "builder.js executed successfully."
}

# Function to check for the website type and set up the final repository
checkForWebsiteType() {
    cd $WORKSPACE
    mkdir final-repo
    cd final-repo || { echo "Error: final-repo folder does not exist"; exit 1; }
    git init
    git config user.name "vivekWeberon"
    git config user.email "vivek@weberon.net"
    git remote add origin https://$GITHUB_TOKEN@$FINAL_REPO
    git checkout -B $DCS_FINAL_REPO || { echo "Error: $DCS_FINAL_REPO branch does not exist"; exit 1; }

    if git ls-remote origin | grep -sw $DCS_FINAL_REPO 2>&1>/dev/null
    then
        echo "$DCS_FINAL_REPO BRANCH EXISTS ON REMOTE REPO"
        git pull origin $DCS_FINAL_REPO

        if [ "$WEBSITE_TYPE" = "UNBRANDED" ]; then
            echo "Website is Unbranded"
            git rm -r *
        elif [ "$WEBSITE_TYPE" = "BRANDED" ]; then
            echo "Website is Branded"
            rm -rf -- components configs modules pages public .gitignore next.config.js package.json package-lock.json README.md
        else
            echo "Website is a sub-directory"
            rm -rf $WEBSITE_DIRECTORY_NAME
        fi

        echo "Removed the existing files"
    else
        echo "$DCS_FINAL_REPO BRANCH NOT FOUND ON REMOTE REPO"
    fi

    # Read commit hash from git_log.txt
    commit_hash=$(awk '{print $2}' "$WORKSPACE/lp-showcase-nextjs/.git/logs/HEAD")
    # Read Git repository URL
    git_repo=$(grep -oP '(?<=clone: from ).*' "$WORKSPACE/lp-showcase-nextjs/.git/logs/HEAD")
    # Output file
    output_file="$WORKSPACE/final-repo/git_log.txt"
    # Write to the output file
    echo "Commit hash: $commit_hash" > "$output_file"
    echo "Git repository: $git_repo" >> "$output_file"
    echo "Data has been saved to $output_file"
}

# Function to copy website content to the GitHub repository
copyWebsiteToGithubRepo() {
    # Create the WEBSITE_DIRECTORY_NAME directory if it does not exist
    if [ ! -d "$WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME" ]; then
        mkdir -p "$WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME" || { echo "Error: Could not create $WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME"; exit 1; }
        echo "Created $WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME directory"
    else
        echo "$WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME already exists"
    fi

    # Copy contents of the out directory to the final repo inside the WEBSITE_DIRECTORY_NAME folder
    cp -r "$WORKSPACE/out/." "$WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME/"
    echo "Files copied into the $WORKSPACE/final-repo/$WEBSITE_DIRECTORY_NAME folder"

    # Navigate to the final-repo directory
    cd "$WORKSPACE/final-repo/" || { echo "Error: Could not access $WORKSPACE/final-repo/"; exit 1; }

    # List the files in the directory
    ls

    # Stage all changes for commit
    git add .

    # Check if there are any changes to commit
    if git diff-index --quiet HEAD; then
        echo "No changes to commit."
    else
        # Commit the changes
        git commit -m "Automated Commit from the Jenkins build: $(date)" || { echo "Error: Commit failed"; exit 1; }
        echo "Commit to github.com/vivekweberon/lp-showcase-final-repo.git repo is done"
    fi

    echo "Trying to push to $DCS_FINAL_REPO branch on https://github.com/vivekweberon/lp-showcase-final-repo.git repo"

    # Check if the branch exists on the remote repository
    if git ls-remote --heads origin "$DCS_FINAL_REPO" | grep "$DCS_FINAL_REPO" >/dev/null 2>&1; then
        # Push the changes to the specified branch
        git push -u origin "$DCS_FINAL_REPO" -v || { echo "Error: Push failed"; exit 1; }
        echo "Code pushed to github.com/vivekweberon/lp-showcase-final-repo.git repo on branch $DCS_FINAL_REPO"
    else
        echo "Error: Branch $DCS_FINAL_REPO does not exist on the remote repository."
        exit 1
    fi
}

# Call functions in the correct order
setUPNodeJS
installDependencies
listDataFolderContents
runBuilder
checkForWebsiteType
copyWebsiteToGithubRepo