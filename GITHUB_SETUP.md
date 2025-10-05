# GitHub Actions Setup Instructions

## Step 1: Enable GitHub Container Registry

1. **Go to your GitHub repository**: https://github.com/priyam191/Connectly

2. **Navigate to Settings**:
   - Click on "Settings" tab in your repository
   - Scroll down to "Actions" in the left sidebar
   - Click on "General"

3. **Configure Workflow permissions**:
   - Scroll down to "Workflow permissions"
   - Select "Read and write permissions"
   - Check "Allow GitHub Actions to create and approve pull requests"
   - Click "Save"

## Step 2: Enable GitHub Container Registry

1. **Go to your GitHub profile**:
   - Click your profile picture (top right)
   - Click "Settings"

2. **Enable Container Registry**:
   - In the left sidebar, click "Developer settings"
   - Click "Personal access tokens"
   - Click "Tokens (classic)"
   - Click "Generate new token" → "Generate new token (classic)"

3. **Configure the token** (Optional - for manual use):
   - Note: "Docker CI/CD Token"
   - Expiration: Choose appropriate time
   - Scopes: Check these boxes:
     - `read:packages`
     - `write:packages`
     - `delete:packages`
   - Click "Generate token"
   - **IMPORTANT**: Copy the token immediately (you won't see it again)

## Step 3: Verify GitHub Actions

1. **Check the workflow run**:
   - Go to your repository: https://github.com/priyam191/Connectly
   - Click on "Actions" tab
   - You should see a workflow run for your recent push

2. **If the workflow fails**:
   - Click on the failed run to see details
   - Check the error messages
   - Common issues:
     - Permissions not set correctly
     - Container registry not enabled

## Step 4: Configure Environments (Optional)

1. **Go to repository Settings**:
   - Click "Settings" tab
   - Click "Environments" in left sidebar

2. **Create staging environment**:
   - Click "New environment"
   - Name: "staging"
   - Click "Configure environment"
   - Add any required reviewers or protection rules

3. **Create production environment**:
   - Click "New environment"
   - Name: "production"
   - Click "Configure environment"
   - Add required reviewers for production deployments

## Step 5: Branch Protection (Recommended)

1. **Go to Settings → Branches**
2. **Add rule for main branch**:
   - Branch name pattern: `main`
   - Check "Require a pull request before merging"
   - Check "Require status checks to pass before merging"
   - Check "Require branches to be up to date before merging"
   - Select the CI checks you want to require

## Workflow Overview

Your CI/CD pipeline will now:

1. **On Pull Requests**:
   - Run tests on Node.js 18.x and 20.x
   - Perform security scanning with Trivy
   - Build and test the application

2. **On Push to `develop` branch**:
   - Run all tests
   - Build and push Docker images
   - Deploy to staging environment

3. **On Push to `main` branch**:
   - Run all tests
   - Build and push Docker images
   - Deploy to production environment

## Docker Images

Once the workflow runs successfully, your Docker images will be available at:
- Server: `ghcr.io/priyam191/connectly-server:latest`
- Client: `ghcr.io/priyam191/connectly-client:latest`

## Next Steps

1. Start Docker Desktop on your machine
2. Run: `npm run dev` to test locally
3. Create a pull request to test the CI/CD pipeline
4. Check the Actions tab to see the workflow in action