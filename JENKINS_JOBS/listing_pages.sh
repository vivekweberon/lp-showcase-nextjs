#!/bin/bash

cd "$WORKSPACE" || { echo "Error: Couldn't access workspace directory"; exit 1; }

echo "Cloning input data repository..."
git clone -b $DCS_DATA_REPO "https://$GITHUB_USERNAME:$GITHUB_TOKEN@$DATA_REPO" data-repo || { echo "Failed to clone input data repository"; exit 1; }

echo "Cloning Mautic tracker repository..."
git clone -b $DCS_MAUTIC_TRACKER_REPO "https://$GITHUB_USERNAME:$GITHUB_TOKEN@$MAUTIC_TRACKER_REPO" mautic-tracker-repo || { echo "Failed to clone input data repository"; exit 1; }

echo "Cloning build tool repository..."
git clone -b $DCS_BUILD_TOOL_REPO "https://$GITHUB_USERNAME:$GITHUB_TOKEN@$BUILD_TOOL_REPO" build-tool-repo || { echo "Failed to clone input data repository"; exit 1; }
    
echoStart() {
    echo "Starting $1"
}

echoEnd() {
    echo "Finished $1"
}

chkCMD() {
    if [ $? -ne 0 ]; then
        echo "Error: Command failed"
        exit 1
    fi
}

setUPNodeJS() {
    processInfo="Setting up NodeJS - Specific Version"
    echoStart "$processInfo"
    source $JENKINS_HOME/.bashrc

    if ! command -v nvm &> /dev/null; then
        echo "nvm is not installed. Please install nvm first."
        return 1
    fi
    nvm --version

    NODE_VERSION="v22.4.1"
    npm_VERSION="v10.8.1"
    nvm install $NODE_VERSION; chkCMD
    nvm use $NODE_VERSION; chkCMD

    current_npm_version=$(npm -v)
    if [ "$current_npm_version" != "$npm_VERSION" ]; then
        npm install -g npm@$npm_VERSION; chkCMD
    fi
    echo "Node version: $(node -v)"
    echo "npm version: $(npm -v)"
    echoEnd "$processInfo"
}

installDependencies() {
    cd code-repo || { echo "Error: code-repo directory does not exist"; exit 1; }
    processInfo="Installing Dependencies"
    echoStart "$processInfo"
    npm install || { echo "Error: Dependency installation failed"; exit 1; }
    echoEnd "$processInfo"
}

runBuilder() {
    echo "Running builder.js..."
    cd $WORKSPACE/build-tool-repo/ || { echo "Error: build-tool-repo directory does not exist"; exit 1; }
    npm install || { echo "Error: Dependency installation failed"; exit 1; }
    node builder.js --websiteName "$WEBSITE_DIRECTORY_NAME" --siteName "$SITE_NAME" || { echo "Error: builder.js execution failed"; exit 1; }
    echo "builder.js executed successfully."
}

setupDeploymentRepo() {
    cd "$WORKSPACE"
    mkdir -p deployment-repo
    cd deployment-repo || { echo "Error: deployment-repo folder does not exist"; exit 1; }
    git init
    git config user.name "vivekWeberon"
    git config user.email "vivek@weberon.net"
    git remote add origin https://$GITHUB_TOKEN@$DEPLOYMENT_REPO
    git checkout -B $DCS_DEPLOYMENT_REPO || { echo "Error: $DCS_DEPLOYMENT_REPO branch does not exist"; exit 1; }

    if git ls-remote origin | grep -sw $DCS_DEPLOYMENT_REPO 2>&1>/dev/null; then
        echo "$DCS_DEPLOYMENT_REPO BRANCH EXISTS ON REMOTE REPO"
        git pull origin $DCS_DEPLOYMENT_REPO

        # Remove the directory if it already exists in the final repo
        # rm -rf "$WEBSITE_DIRECTORY_NAME"
        # echo "Removed the existing files"
    else
        echo "$DCS_DEPLOYMENT_REPO BRANCH NOT FOUND ON REMOTE REPO"
    fi

    commit_hash=$(awk '{print $2}' "$WORKSPACE/code-repo/.git/logs/HEAD")
    git_repo=$(grep -oP '(?<=clone: from ).*' "$WORKSPACE/code-repo/.git/logs/HEAD")
    output_file="$WORKSPACE/deployment-repo/git_log.txt"
    echo "Commit hash: $commit_hash" > "$output_file"
    echo "Git repository: $git_repo" >> "$output_file"
    echo "Data has been saved to $output_file"
}

copyWebsiteToGithubRepo() {

    cd "$WORKSPACE"
    # Assume WEBSITE_DIRECTORY_NAME is a comma-separated list of directory names
    IFS=',' read -r -a websiteArray <<< "$WEBSITE_DIRECTORY_NAME"

    # Navigate to deployment-repo and create a directory to hold all website builds (if desired)
    cd deployment-repo || { echo "Error: Could not access deployment-repo directory"; exit 1; }

    for website in "${websiteArray[@]}"; do
        website=$(echo "$website" | xargs)  # Trim whitespace
        # Now check for the website directory inside code-repo
        if [ -d "$WORKSPACE/code-repo/$website" ]; then
            # Remove any existing copy in deployment-repo, then copy the website build from code-repo
            rm -rf "$website"
            cp -r "$WORKSPACE/code-repo/$website" .
            echo "Copied directory '$website' from code-repo to deployment-repo."
        else
            echo "Directory '$website' does not exist under code-repo."
            exit 1
        fi
    done

    # Stage all changes for commit
    git add .

    # Check if there are any changes to commit
    if git diff-index --quiet HEAD; then
        echo "No changes to commit."
    else
        git commit -m "Automated Commit from the Jenkins build: $(date)" || { echo "Error: Commit failed"; exit 1; }
        echo "Commit to $DEPLOYMENT_REPO repo is done"
    fi

    echo "Attempting to push to branch $DCS_DEPLOYMENT_REPO on $DEPLOYMENT_REPO"

    if git ls-remote --heads origin "$DCS_DEPLOYMENT_REPO" | grep "$DCS_DEPLOYMENT_REPO" >/dev/null 2>&1; then
        git push -u origin "$DCS_DEPLOYMENT_REPO" -v || { echo "Error: Push failed"; exit 1; }
        echo "Code pushed to $DEPLOYMENT_REPO on branch $DCS_DEPLOYMENT_REPO"
    else
        echo "Error: Branch $DCS_DEPLOYMENT_REPO does not exist on the remote repository."
        exit 1
    fi
}

setUPNodeJS
installDependencies
runBuilder
setupDeploymentRepo
copyWebsiteToGithubRepo