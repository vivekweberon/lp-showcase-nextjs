#!/bin/bash

CODE_REPO_DIR="code-repo"
DATA_REPO_DIR="data-repo"
MAUTIC_TRACKER_REPO_DIR="mautic-tracker-repo"
BUILD_TOOL_REPO_DIR="build-tool-repo"
DEPLOYMENT_REPO_DIR="deployment-repo"
VERSION_DIR="version"
VERSION_FILE="version.txt"
OUTPUT_DIR="output"

createVersionFile() {
  local repo_dir="$1"
  local git_archival_file="git_archival_$repo_dir.txt"

  echo "$WORKSPACE/$repo_dir"
  
  cd "$WORKSPACE/$repo_dir" || { echo "Error: Could not access $repo_dir"; return 1; }

  if [ -d ".git" ]; then
    git show --oneline -s | awk '{print $1}' > "$WORKSPACE/$repo_dir/$git_archival_file"
    echo "Created $git_archival_file in $repo_dir"
    mv "$WORKSPACE/$repo_dir/$git_archival_file" "$WORKSPACE/$VERSION_DIR/"
  else
    echo "Error: $repo_dir is not a git repository"
    exit 1
  fi
}

mergeVersionFiles(){
    output_file="$WORKSPACE/$VERSION_DIR/$VERSION_FILE"
    {
        echo "DATA:        $(cat "$WORKSPACE/$VERSION_DIR/git_archival_$DATA_REPO_DIR.txt")"
        echo "CODE:        $(cat "$WORKSPACE/$VERSION_DIR/git_archival_$CODE_REPO_DIR.txt")"
        echo "TRACKER:     $(cat "$WORKSPACE/$VERSION_DIR/git_archival_$MAUTIC_TRACKER_REPO_DIR.txt")"
        echo "BUILD_TOOL:  $(cat "$WORKSPACE/$VERSION_DIR/git_archival_$BUILD_TOOL_REPO_DIR.txt")"
    } > "$output_file"
    echo "Consolidated version info written to $output_file"
}

cloneRepo() {
    local repo_name="$1"
    local repo_url="$2"
    local branch_name="$3"
    local target_dir="$4"

    echo "Cloning $repo_name repository..."
    cd "$WORKSPACE" || { echo "Error: Couldn't access workspace directory"; exit 1; }
    git clone -b "$branch_name" "https://$GITHUB_USERNAME:$GITHUB_TOKEN@$repo_url" "$target_dir" || { echo "Failed to clone $repo_name repository"; exit 1; }
}

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
    cd $WORKSPACE/$CODE_REPO_DIR || { echo "Error: $CODE_REPO_DIR directory does not exist"; exit 1; }
    processInfo="Installing Dependencies"
    echoStart "$processInfo"
    npm install || { echo "Error: Dependency installation failed"; exit 1; }
    echoEnd "$processInfo"
}

runBuilder() {
    echo "Running builder.js..."
    cd $WORKSPACE/build-tool-repo/ || { echo "Error: build-tool-repo directory does not exist"; exit 1; }
    npm install || { echo "Error: Dependency installation failed"; exit 1; }
    node builder.js --codeRepoDir $CODE_REPO_DIR --dataRepoDir $DATA_REPO_DIR --mauticTrackerRepoDir $MAUTIC_TRACKER_REPO_DIR --siteName "$SITE_NAME" --websiteName "$WEBSITE_DIRECTORY_NAME" --versionDir $VERSION_DIR  --outputDir $OUTPUT_DIR || { echo "Error: builder.js execution failed"; exit 1; }
    echo "builder.js executed successfully."
}

setupDeploymentRepo() {
    cd "$WORKSPACE"
    mkdir -p $DEPLOYMENT_REPO_DIR
    cd $DEPLOYMENT_REPO_DIR || { echo "Error: $DEPLOYMENT_REPO_DIR folder does not exist"; exit 1; }
    git init
    git config user.name "vivekWeberon"
    git config user.email "vivek@weberon.net"
    git remote add origin https://$GITHUB_TOKEN@$DEPLOYMENT_REPO
    git checkout -B $DCS_DEPLOYMENT_REPO || { echo "Error: $DCS_DEPLOYMENT_REPO branch does not exist"; exit 1; }

    if git ls-remote origin | grep -sw $DCS_DEPLOYMENT_REPO 2>&1>/dev/null; then
        echo "$DCS_DEPLOYMENT_REPO BRANCH EXISTS ON REMOTE REPO"
        git pull origin $DCS_DEPLOYMENT_REPO

    else
        echo "$DCS_DEPLOYMENT_REPO BRANCH NOT FOUND ON REMOTE REPO"
    fi

}

copyWebsiteToGithubRepo() {

    cd "$WORKSPACE"

    cd $DEPLOYMENT_REPO_DIR || { echo "Error: Could not access $DEPLOYMENT_REPO_DIR directory"; exit 1; }

    # Loop through all website directories found in the output directory
    for website_dir in "$WORKSPACE/$OUTPUT_DIR"/*/; do

        website_name=$(basename "$website_dir")

        rm -rf "$website_name"

        cp -r "$website_dir" .
        echo "Copied '$website_name'."
    done

    # Stage all changes for commit
    git add .

    # Check if there are any changes to commit
    if git diff-index --quiet HEAD; then
        echo "No changes to commit."
    else
        git commit -m "Automated Commit from the Jenkins build: $BUILD_URL" || { echo "Error: Commit failed"; exit 1; }
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

cd "$WORKSPACE" || { echo "Error: Couldn't access workspace directory"; exit 1; }
mkdir -p "$WORKSPACE/$VERSION_DIR"
createVersionFile "$CODE_REPO_DIR"
cloneRepo "data" "$DATA_REPO" "$DCS_DATA_REPO" "$DATA_REPO_DIR"
createVersionFile "$DATA_REPO_DIR"
cloneRepo "mautic_tracker" "$MAUTIC_TRACKER_REPO" "$DCS_MAUTIC_TRACKER_REPO" "$MAUTIC_TRACKER_REPO_DIR"
createVersionFile "$MAUTIC_TRACKER_REPO_DIR"
cloneRepo "data" "$BUILD_TOOL_REPO" "$DCS_BUILD_TOOL_REPO" "$BUILD_TOOL_REPO_DIR"
createVersionFile "$BUILD_TOOL_REPO_DIR"
mergeVersionFiles

setUPNodeJS
installDependencies
runBuilder
setupDeploymentRepo
copyWebsiteToGithubRepo