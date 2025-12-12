# Chapter 7: Publishing to Docker Hub

## Table of Contents

1. [Introduction to Docker Hub](#introduction-to-docker-hub)
2. [Creating Docker Hub Account](#creating-docker-hub-account)
3. [Authenticating with Docker Hub](#authenticating-with-docker-hub)
4. [Tagging for Docker Hub](#tagging-for-docker-hub)
5. [Pushing Images to Docker Hub](#pushing-images-to-docker-hub)
6. [Managing Repositories on Docker Hub](#managing-repositories-on-docker-hub)
7. [Pulling Images from Docker Hub](#pulling-images-from-docker-hub)
8. [Automated Builds with Docker Hub](#automated-builds-with-docker-hub)
9. [Comparison: GHCR vs Docker Hub](#comparison-ghcr-vs-docker-hub)

## Introduction to Docker Hub

### What is Docker Hub?

**Docker Hub** is Docker's official cloud-based registry service. It's the default registry for Docker and hosts millions of container images.

### Benefits of Docker Hub

1. **Default Registry**: Used by default in Docker commands
2. **Large Community**: Millions of images available
3. **Free Tier**: Free for public repositories
4. **Automated Builds**: Build images from GitHub/Bitbucket
5. **Webhooks**: Integrate with CI/CD pipelines
6. **Organizations**: Team collaboration features

### Docker Hub vs GHCR

| Feature | Docker Hub | GHCR |
|---------|------------|------|
| Free Public Images | Yes | Yes |
| Free Private Images | 1 private repo | Limited |
| Default Registry | Yes | No |
| Integration | Docker Hub | GitHub |
| Authentication | Docker Hub account | GitHub account |
| URL Format | `username/image` | `ghcr.io/username/image` |

## Creating Docker Hub Account

### Step 1: Sign Up

1. **Visit Docker Hub**
   - Go to: https://hub.docker.com

2. **Create Account**
   - Click "Sign Up"
   - Enter username, email, and password
   - Accept terms and conditions
   - Click "Sign Up"

3. **Verify Email**
   - Check your email
   - Click verification link

### Step 2: Choose Plan

**Free Plan** (Recommended for learning):
- Unlimited public repositories
- 1 private repository
- Unlimited pulls
- Limited pushes per day

**Pro/Team Plans** (For production):
- More private repositories
- Higher rate limits
- Team collaboration
- Advanced features

### Step 3: Complete Profile

1. **Add Profile Information** (optional)
   - Profile picture
   - Bio
   - Location

2. **Verify Account** (optional but recommended)
   - Add phone number
   - Enables higher rate limits

## Authenticating with Docker Hub

### Method 1: Using Docker Login

```bash
docker login
```

**Interactive Login**:
```
Username: your-username
Password: your-password
```

**Expected Output**:
```
Login Succeeded
```

### Method 2: Using Command Line

```bash
docker login -u your-username -p your-password
```

**Note**: Less secure (password visible in command history)

### Method 3: Using Password from STDIN

```bash
echo "your-password" | docker login -u your-username --password-stdin
```

**More Secure**: Password not visible in command history

### Method 4: Using Access Token (Recommended)

**Step 1: Create Access Token**

1. Go to Docker Hub → Account Settings → Security
2. Click "New Access Token"
3. Enter description: `Docker CLI Access`
4. Set permissions: `Read, Write, Delete`
5. Click "Generate"
6. **Copy token immediately** (won't see it again!)

**Step 2: Login with Token**

```bash
echo "your-access-token" | docker login -u your-username --password-stdin
```

**Benefits**:
- More secure than password
- Can be revoked
- Better for automation

### Verify Login

```bash
cat ~/.docker/config.json
```

**Should contain**:
```json
{
  "auths": {
    "https://index.docker.io/v1/": {
      "auth": "base64_encoded_credentials"
    }
  }
}
```

### Logout

```bash
docker logout
```

## Tagging for Docker Hub

### Understanding Docker Hub Image Names

**Format**: `USERNAME/IMAGE_NAME:TAG`

**Examples**:
- `myusername/iot-flask-api:latest`
- `myusername/iot-flask-api:v1.0.0`
- `myusername/iot-flask-api:main`

**Note**: No registry prefix needed (Docker Hub is default)

### Tagging Existing Images

#### Tag Flask API Image

```bash
# Build image first
cd api
docker build -t iot-flask-api:latest .

# Tag for Docker Hub
docker tag iot-flask-api:latest your-username/iot-flask-api:latest
```

#### Tag Node-RED Image

```bash
cd docker/node-red
docker build -t iot-node-red:latest .
docker tag iot-node-red:latest your-username/iot-node-red:latest
```

#### Tag Simulator Image

```bash
cd simulator
docker build -t iot-simulator:latest .
docker tag iot-simulator:latest your-username/iot-simulator:latest
```

### Tagging with Versions

**Semantic Versioning**:
```bash
docker tag iot-flask-api:latest your-username/iot-flask-api:v1.0.0
docker tag iot-flask-api:latest your-username/iot-flask-api:v1.0
docker tag iot-flask-api:latest your-username/iot-flask-api:v1
```

**Git-based Tagging**:
```bash
# Tag with git commit hash
docker tag iot-flask-api:latest your-username/iot-flask-api:$(git rev-parse --short HEAD)

# Tag with git branch
docker tag iot-flask-api:latest your-username/iot-flask-api:$(git branch --show-current)
```

### Viewing Tags

```bash
docker images | grep your-username
```

**Output**:
```
your-username/iot-flask-api    latest    abc123def456    2 hours ago    120MB
your-username/iot-flask-api    v1.0.0    abc123def456    2 hours ago    120MB
```

## Pushing Images to Docker Hub

### Push Single Image

```bash
docker push your-username/iot-flask-api:latest
```

**Expected Output**:
```
The push refers to repository [docker.io/your-username/iot-flask-api]
abc123def456: Pushing [==================================================>]  120MB
def456ghi789: Pushing [==================================================>]  2.5MB
ghi789jkl012: Layer already exists
latest: digest: sha256:abc123... size: 1234
```

### Push Multiple Tags

```bash
# Push all tags
docker push your-username/iot-flask-api:latest
docker push your-username/iot-flask-api:v1.0.0
docker push your-username/iot-flask-api:v1.0
```

### Push All Project Images

**Create a script** (`push-to-dockerhub.sh`):

```bash
#!/bin/bash

USERNAME="your-username"

# Login to Docker Hub
docker login -u $USERNAME

# Build and push Flask API
cd api
docker build -t iot-flask-api:latest .
docker tag iot-flask-api:latest $USERNAME/iot-flask-api:latest
docker push $USERNAME/iot-flask-api:latest

# Build and push Node-RED
cd ../docker/node-red
docker build -t iot-node-red:latest .
docker tag iot-node-red:latest $USERNAME/iot-node-red:latest
docker push $USERNAME/iot-node-red:latest

# Build and push Simulator
cd ../../simulator
docker build -t iot-simulator:latest .
docker tag iot-simulator:latest $USERNAME/iot-simulator:latest
docker push $USERNAME/iot-simulator:latest

echo "All images pushed successfully!"
```

**Make executable and run**:
```bash
chmod +x push-to-dockerhub.sh
./push-to-dockerhub.sh
```

### Verify Push

**Check on Docker Hub**:
1. Go to https://hub.docker.com
2. Click on your username
3. Click "Repositories"
4. You should see your images

**Or visit directly**:
```
https://hub.docker.com/r/your-username/iot-flask-api
```

## Managing Repositories on Docker Hub

### Creating Repository

**Method 1: Web Interface**

1. Go to Docker Hub → Repositories
2. Click "Create Repository"
3. Enter repository name: `iot-flask-api`
4. Choose visibility: Public or Private
5. Click "Create"

**Method 2: Auto-Created on Push**

- Repository is automatically created when you push
- Default visibility: Public

### Repository Settings

**Access Repository Settings**:
1. Go to your repository
2. Click "Settings" tab

**Available Settings**:
- **Description**: Add repository description
- **Visibility**: Public/Private
- **Collaborators**: Add team members
- **Webhooks**: Configure webhooks
- **Builds**: Configure automated builds

### Making Repository Private

1. Go to repository → Settings
2. Scroll to "Repository Visibility"
3. Click "Make Private"
4. Confirm action

### Adding Description and Documentation

**In Repository Settings**:
- **Short Description**: Brief summary
- **Full Description**: Detailed documentation (Markdown supported)
- **Dockerfile Location**: Path to Dockerfile
- **Source Code**: Link to GitHub repository

**Example Full Description**:
```markdown
# IoT Flask API

Flask REST API for IoT Home Automation Learning Platform.

## Features

- MQTT publishing/subscribing
- InfluxDB read/write operations
- Device management
- Health check endpoint

## Usage

```bash
docker run -p 5000:5000 your-username/iot-flask-api:latest
```

## Documentation

See [project documentation](https://github.com/your-username/project) for details.
```

## Pulling Images from Docker Hub

### Pull Public Images

```bash
docker pull your-username/iot-flask-api:latest
```

**No authentication needed** for public images.

### Pull Private Images

**Step 1: Authenticate**
```bash
docker login
```

**Step 2: Pull Image**
```bash
docker pull your-username/iot-flask-api:latest
```

### Using in Docker Compose

**Update docker-compose.yml**:

```yaml
services:
  flask-api:
    image: your-username/iot-flask-api:latest
    # ... rest of configuration
```

**Pull before starting**:
```bash
docker-compose pull
docker-compose up -d
```

## Automated Builds with Docker Hub

### Setting Up Automated Builds

**Step 1: Connect Source Repository**

1. Go to Docker Hub → Account Settings → Linked Accounts
2. Connect GitHub/Bitbucket account
3. Authorize Docker Hub access

**Step 2: Create Automated Build**

1. Go to Repositories → Create Repository
2. Select "Build Settings"
3. Choose source: GitHub/Bitbucket
4. Select repository and branch
5. Configure build settings:
   - **Dockerfile Location**: `api/Dockerfile`
   - **Docker Tag**: `latest`, `{branch}`, `{sourceref}`
   - **Build Context**: `/`
6. Click "Save and Build"

### Build Triggers

**Automatic Triggers**:
- Push to connected branch
- Create/update tag
- Manual trigger from web interface

**Webhook Triggers**:
- Configure webhook URL
- Docker Hub calls webhook on build events

### Build Configuration

**Example Build Settings**:

```
Source Repository: github.com/username/project
Branch: main
Dockerfile Location: api/Dockerfile
Docker Tag Name: latest
```

**Advanced Options**:
- Build arguments
- Build cache
- Build timeout
- Build hooks

### Benefits of Automated Builds

1. **Automatic**: Builds on every push
2. **Versioned**: Tagged with branch/tag
3. **Secure**: Builds in Docker Hub infrastructure
4. **History**: Build history and logs
5. **Integration**: Works with GitHub/Bitbucket

## Comparison: GHCR vs Docker Hub

### When to Use Docker Hub

**Use Docker Hub when**:
- You want the default registry
- You need Docker Hub's ecosystem
- You want automated builds from GitHub
- You prefer Docker's interface
- You need team collaboration features

### When to Use GHCR

**Use GHCR when**:
- Your code is on GitHub
- You want GitHub integration
- You prefer GitHub's interface
- You want fine-grained permissions
- You use GitHub Actions

### Using Both

**You can use both**:
- Push to both registries
- Use different registries for different purposes
- Provide users with choice

**Example Workflow**:
```bash
# Tag for both
docker tag image:latest your-username/image:latest
docker tag image:latest ghcr.io/your-username/image:latest

# Push to both
docker push your-username/image:latest
docker push ghcr.io/your-username/image:latest
```

## Key Takeaways

1. **Docker Hub** is the default Docker registry
2. **Account required** for pushing images
3. **Tag images** with username prefix
4. **Automated builds** integrate with GitHub/Bitbucket
5. **Public/private** repositories available
6. **Both registries** can be used together

## Next Steps

Now that you can publish to Docker Hub, proceed to:
- [Chapter 8: Advanced Topics](08-advanced-topics.md) - Advanced Docker concepts
- [Chapter 9: Troubleshooting and Best Practices](09-troubleshooting.md) - Common issues and solutions

## Exercises

1. **Create a Docker Hub account** and verify email
2. **Authenticate** with Docker Hub using access token
3. **Build and tag** all three project images for Docker Hub
4. **Push images** to Docker Hub
5. **Set up automated builds** for one repository
6. **Compare** the process with GHCR (Chapter 6)

