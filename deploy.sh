#!/bin/bash

echo "Starting deployment process..."

# 1. Log in to AWS ECR
aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 678308814622.dkr.ecr.ap-south-1.amazonaws.com

# 2. Build the Docker image
docker build --platform linux/amd64 -t taksh-api-repo .

# 3. Tag the image for ECR
docker tag taksh-api-repo:latest 678308814622.dkr.ecr.ap-south-1.amazonaws.com/taksh-api-repo:latest

# 4. Push the image to ECR
docker push 678308814622.dkr.ecr.ap-south-1.amazonaws.com/taksh-api-repo:latest

# 5. (Optional) Tell App Runner to deploy it immediately
aws apprunner start-deployment --service-arn arn:aws:apprunner:ap-south-1:678308814622:service/takshstore-backend/7ce1eb8dc711406cb1507ccfd0d6431a

echo "Deployment triggered successfully! 🚀"