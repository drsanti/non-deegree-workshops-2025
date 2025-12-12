# Chapter 6: Publishing to GitHub Container Registry

## Table of Contents

1. [Introduction to GHCR](#introduction-to-ghcr)
2. [Setting Up GitHub Personal Access Token](#setting-up-github-personal-access-token)
3. [Authenticating with GHCR](#authenticating-with-ghcr)
4. [Tagging Images](#tagging-images)
5. [Pushing Images to GHCR](#pushing-images-to-ghcr)
6. [Making Images Public/Private](#making-images-publicprivate)
7. [Pulling Images from GHCR](#pulling-images-from-ghcr)
8. [Using GitHub Actions for Automated Builds](#using-github-actions-for-automated-builds)
9. [Best Practices for Versioning](#best-practices-for-versioning)

## Introduction to GHCR

### What is GitHub Container Registry (GHCR)?

**GitHub Container Registry** (ghcr.io) is a container image registry service provided by GitHub. It allows you to store and manage Docker container images alongside your code.

### Benefits of GHCR

1. **Integrated with GitHub**: Works seamlessly with GitHub repositories
2. **Free for Public Repos**: Free storage for public images
3. **Fine-grained Permissions**: Control who can access images
4. **Package Management**: Images appear as packages in your repository
5. **Version Control**: Tag images with versions, branches, or commits

### GHCR vs Docker Hub

| Feature | GHCR | Docker Hub |
|---------|------|------------|
| Free Public Images | Yes | Yes |
| Free Private Images | Limited | 1 private repo |
| Integration | GitHub | Docker Hub |
| Authentication | GitHub PAT | Docker Hub account |
| URL Format | `ghcr.io/username/image` | `username/image` |

## Setting Up GitHub Personal Access Token

### Step 1: Create Personal Access Token

1. **Go to GitHub Settings**
   - Visit: https://github.com/settings/tokens
   - Or: GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)

2. **Generate New Token**
   - Click "Generate new token" → "Generate new token (classic)"

3. **Configure Token**
   - **Note**: `Docker GHCR Access` (descriptive name)
   - **Expiration**: Choose expiration (90 days, 1 year, or no expiration)
   - **Scopes**: Select `write:packages` and `read:packages`

4. **Generate and Copy Token**
   - Click "Generate token"
   - **Important**: Copy the token immediately (you won't see it again!)

### Step 2: Save Token Securely

**Option 1: Environment Variable**
```bash
# Linux/Mac
export GHCR_TOKEN=ghp_your_token_here

# Windows (PowerShell)
$env:GHCR_TOKEN="ghp_your_token_here"

# Windows (CMD)
set GHCR_TOKEN=ghp_your_token_here
```

**Option 2: Docker Credential Helper**
```bash
echo $GHCR_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**Option 3: Store in File (Not Recommended for Production)**
```bash
# Create .env file (add to .gitignore!)
echo "GHCR_TOKEN=ghp_your_token_here" >> .env
```

## Authenticating with GHCR

### Method 1: Using Docker Login

```bash
echo $GHCR_TOKEN | docker login ghcr.io -u YOUR_GITHUB_USERNAME --password-stdin
```

**Expected Output**:
```
Login Succeeded
```

**Verify Login**:
```bash
cat ~/.docker/config.json
```

**Should contain**:
```json
{
  "auths": {
    "ghcr.io": {
      "auth": "base64_encoded_credentials"
    }
  }
}
```

### Method 2: Using Personal Access Token Directly

```bash
docker login ghcr.io -u YOUR_GITHUB_USERNAME -p YOUR_TOKEN
```

**Note**: Less secure (token visible in command history)

### Method 3: Using GitHub CLI (gh)

```bash
# Install GitHub CLI first
gh auth login

# Then login to GHCR
echo $GHCR_TOKEN | docker login ghcr.io -u $(gh api user --jq .login) --password-stdin
```

## Tagging Images

### Understanding GHCR Image Names

**Format**: `ghcr.io/OWNER/IMAGE_NAME:TAG`

**Examples**:
- `ghcr.io/myusername/iot-flask-api:latest`
- `ghcr.io/myusername/iot-flask-api:v1.0.0`
- `ghcr.io/myusername/iot-flask-api:main`

### Tagging Existing Images

#### Tag Flask API Image

```bash
# Build image first
cd api
docker build -t iot-flask-api:latest .

# Tag for GHCR
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:latest
```

#### Tag Node-RED Image

```bash
cd docker/node-red
docker build -t iot-node-red:latest .
docker tag iot-node-red:latest ghcr.io/YOUR_USERNAME/iot-node-red:latest
```

#### Tag Simulator Image

```bash
cd simulator
docker build -t iot-simulator:latest .
docker tag iot-simulator:latest ghcr.io/YOUR_USERNAME/iot-simulator:latest
```

### Tagging with Versions

**Semantic Versioning**:
```bash
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:v1.0.0
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:v1.0
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:v1
```

**Git-based Tagging**:
```bash
# Tag with git commit hash
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:$(git rev-parse --short HEAD)

# Tag with git branch
docker tag iot-flask-api:latest ghcr.io/YOUR_USERNAME/iot-flask-api:$(git branch --show-current)
```

### Viewing Tags

```bash
docker images | grep ghcr.io
```

**Output**:
```
ghcr.io/username/iot-flask-api    latest    abc123def456    2 hours ago    120MB
ghcr.io/username/iot-flask-api    v1.0.0    abc123def456    2 hours ago    120MB
```

## Pushing Images to GHCR

### Push Single Image

```bash
docker push ghcr.io/YOUR_USERNAME/iot-flask-api:latest
```

**Expected Output**:
```
The push refers to repository [ghcr.io/username/iot-flask-api]
abc123def456: Pushing [==================================================>]  120MB
def456ghi789: Pushing [==================================================>]  2.5MB
ghi789jkl012: Layer already exists
latest: digest: sha256:abc123... size: 1234
```

### Push Multiple Tags

```bash
# Push all tags
docker push ghcr.io/YOUR_USERNAME/iot-flask-api:latest
docker push ghcr.io/YOUR_USERNAME/iot-flask-api:v1.0.0
docker push ghcr.io/YOUR_USERNAME/iot-flask-api:v1.0
```

### Push All Project Images

**Create a script** (`push-to-ghcr.sh`):

```bash
#!/bin/bash

USERNAME="YOUR_GITHUB_USERNAME"

# Login to GHCR
echo $GHCR_TOKEN | docker login ghcr.io -u $USERNAME --password-stdin

# Build and push Flask API
cd api
docker build -t iot-flask-api:latest .
docker tag iot-flask-api:latest ghcr.io/$USERNAME/iot-flask-api:latest
docker push ghcr.io/$USERNAME/iot-flask-api:latest

# Build and push Node-RED
cd ../docker/node-red
docker build -t iot-node-red:latest .
docker tag iot-node-red:latest ghcr.io/$USERNAME/iot-node-red:latest
docker push ghcr.io/$USERNAME/iot-node-red:latest

# Build and push Simulator
cd ../../simulator
docker build -t iot-simulator:latest .
docker tag iot-simulator:latest ghcr.io/$USERNAME/iot-simulator:latest
docker push ghcr.io/$USERNAME/iot-simulator:latest

echo "All images pushed successfully!"
```

**Make executable and run**:
```bash
chmod +x push-to-ghcr.sh
./push-to-ghcr.sh
```

### Verify Push

**Check on GitHub**:
1. Go to your GitHub repository
2. Click "Packages" on the right sidebar
3. You should see your container images

**Or visit directly**:
```
https://github.com/USERNAME?tab=packages
```

## Making Images Public/Private

### Default Visibility

By default, images are **private** when pushed to GHCR.

### Making Image Public

**Method 1: GitHub Web Interface**

1. Go to your GitHub repository
2. Click "Packages" → Select your package
3. Click "Package settings"
4. Scroll to "Danger Zone"
5. Click "Change visibility" → "Make public"

**Method 2: Using GitHub API**

```bash
curl -X PATCH \
  -H "Authorization: token $GHCR_TOKEN" \
  -H "Accept: application/vnd.github.v3+json" \
  https://api.github.com/user/packages/container/PACKAGE_NAME \
  -d '{"visibility":"public"}'
```

### Making Image Private

Same process, but select "Make private" instead.

### Checking Visibility

```bash
curl -H "Authorization: token $GHCR_TOKEN" \
  https://api.github.com/user/packages/container/PACKAGE_NAME
```

## Pulling Images from GHCR

### Pull Public Images

```bash
docker pull ghcr.io/USERNAME/iot-flask-api:latest
```

**No authentication needed** for public images.

### Pull Private Images

**Step 1: Authenticate**
```bash
echo $GHCR_TOKEN | docker login ghcr.io -u USERNAME --password-stdin
```

**Step 2: Pull Image**
```bash
docker pull ghcr.io/USERNAME/iot-flask-api:latest
```

### Using in Docker Compose

**Update docker-compose.yml**:

```yaml
services:
  flask-api:
    image: ghcr.io/YOUR_USERNAME/iot-flask-api:latest
    # ... rest of configuration
```

**Pull before starting**:
```bash
docker-compose pull
docker-compose up -d
```

## Using GitHub Actions for Automated Builds

### Create GitHub Actions Workflow

**Create file**: `.github/workflows/docker-build.yml`

```yaml
name: Build and Push Docker Images

on:
  push:
    branches: [ main ]
    tags:
      - 'v*'
  pull_request:
    branches: [ main ]

env:
  REGISTRY: ghcr.io
  IMAGE_PREFIX: ${{ github.repository_owner }}

jobs:
  build:
    runs-on: ubuntu-latest
    permissions:
      contents: read
      packages: write

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Log in to GHCR
      uses: docker/login-action@v2
      with:
        registry: ${{ env.REGISTRY }}
        username: ${{ github.actor }}
        password: ${{ secrets.GITHUB_TOKEN }}

    - name: Build and push Flask API
      uses: docker/build-push-action@v4
      with:
        context: ./api
        push: ${{ github.event_name != 'pull_request' }}
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-flask-api:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-flask-api:${{ github.sha }}
        cache-from: type=gha
        cache-to: type=gha,mode=max

    - name: Build and push Node-RED
      uses: docker/build-push-action@v4
      with:
        context: ./docker/node-red
        push: ${{ github.event_name != 'pull_request' }}
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-node-red:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-node-red:${{ github.sha }}

    - name: Build and push Simulator
      uses: docker/build-push-action@v4
      with:
        context: ./simulator
        push: ${{ github.event_name != 'pull_request' }}
        tags: |
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-simulator:latest
          ${{ env.REGISTRY }}/${{ env.IMAGE_PREFIX }}/iot-simulator:${{ github.sha }}
```

### How It Works

1. **Triggers**: Runs on push to main, tags, or pull requests
2. **Authentication**: Uses `GITHUB_TOKEN` (automatically provided)
3. **Build**: Builds all three images
4. **Push**: Pushes to GHCR (skips on pull requests)
5. **Cache**: Uses GitHub Actions cache for faster builds

### Benefits

- **Automated**: Images built on every push
- **Versioned**: Tagged with commit SHA
- **Secure**: Uses GitHub's built-in token
- **Fast**: Layer caching enabled

## Best Practices for Versioning

### Semantic Versioning

**Format**: `MAJOR.MINOR.PATCH`

**Examples**:
- `v1.0.0`: Initial release
- `v1.0.1`: Bug fix
- `v1.1.0`: New feature
- `v2.0.0`: Breaking change

**Tagging Strategy**:
```bash
# Major version
docker tag image:latest ghcr.io/username/image:v2.0.0
docker tag image:latest ghcr.io/username/image:v2.0
docker tag image:latest ghcr.io/username/image:v2

# Minor version
docker tag image:latest ghcr.io/username/image:v1.1.0
docker tag image:latest ghcr.io/username/image:v1.1

# Patch version
docker tag image:latest ghcr.io/username/image:v1.0.1
```

### Git-based Tagging

**Commit Hash**:
```bash
docker tag image:latest ghcr.io/username/image:$(git rev-parse --short HEAD)
```

**Branch Name**:
```bash
docker tag image:latest ghcr.io/username/image:$(git branch --show-current)
```

**Git Tag**:
```bash
git tag v1.0.0
docker tag image:latest ghcr.io/username/image:v1.0.0
```

### Latest Tag Strategy

**Always tag as latest**:
```bash
docker tag image:latest ghcr.io/username/image:latest
```

**Benefits**:
- Easy to pull latest version
- Default tag for users
- Can be updated with each release

### Version Management

**Keep multiple versions**:
- `latest`: Most recent stable
- `v1.0.0`: Specific version
- `v1.0`: Minor version alias
- `main`: Branch-based tag

**Cleanup old versions**:
- Periodically remove old tags
- Keep last N versions
- Archive important versions

## Key Takeaways

1. **GHCR** integrates with GitHub repositories
2. **Personal Access Token** required for authentication
3. **Tag images** before pushing
4. **Public/private** visibility can be changed
5. **GitHub Actions** can automate builds
6. **Versioning** helps manage releases

## Next Steps

Now that you can publish to GHCR, proceed to:
- [Chapter 7: Publishing to Docker Hub](07-publishing-dockerhub.md) - Alternative publishing method
- [Chapter 8: Advanced Topics](08-advanced-topics.md) - Advanced Docker concepts

## Exercises

1. **Create a GitHub Personal Access Token** with package permissions
2. **Authenticate** with GHCR using your token
3. **Build and tag** all three project images
4. **Push images** to GHCR
5. **Make one image public** and verify it can be pulled without authentication
6. **Set up GitHub Actions** to automate image builds

