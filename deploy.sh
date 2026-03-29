aws ecr get-login-password --region ap-south-1 | docker login --username AWS --password-stdin 678308814622.dkr.ecr.ap-south-1.amazonaws.com
docker build --platform linux/amd64 -t taksh-api-repo .
docker tag taksh-api-repo:latest 678308814622.dkr.ecr.ap-south-1.amazonaws.com/taksh-api-repo:latest
docker push 678308814622.dkr.ecr.ap-south-1.amazonaws.com/taksh-api-repo:latest