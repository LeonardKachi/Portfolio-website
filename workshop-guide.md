# AWS Three-Tier Web Architecture Workshop Guide

## Table of Contents
1. Introduction
2. Architecture Overview
3. Prerequisites
4. Step-by-Step Implementation
5. Testing & Validation
6. Cleanup Procedure
7. Troubleshooting Guide
8. Additional Resources

---

## 1. Introduction

### 1.1 Workshop Overview
This hands-on workshop guides you through implementing a production-ready three-tier web architecture on AWS. You'll learn how to design, deploy, and manage a scalable web application using AWS best practices.

### 1.2 Learning Objectives
- Design and implement a three-tier architecture in AWS
- Configure networking with VPC, subnets, and security groups
- Implement high availability with Auto Scaling and Multi-AZ RDS
- Configure load balancing at multiple tiers
- Set up monitoring and alerting
- Implement security best practices

### 1.3 Target Audience
- Cloud Engineers
- DevOps Engineers
- Solutions Architects
- AWS Certification Candidates

---

## 2. Architecture Overview

### 2.1 Architecture Diagram
```
┌─────────────────────────────────────────────────────────┐
│                     INTERNET                             │
└───────────────┬─────────────────────────────────────────┘
                │ HTTPS/HTTP
                ▼
┌─────────────────────────────────────────────────────────┐
│          EXTERNAL APPLICATION LOAD BALANCER              │
│                    (Public Subnet)                       │
└───────────────┬─────────────────────────────────────────┘
                │ HTTP:80 (Web-Tier-SG)
                ▼
┌─────────────────────────────────────────────────────────┐
│                 WEB TIER (Public Subnet)                 │
│               Auto Scaling Group (2+ instances)          │
│          Nginx + React.js + Node.js Runtime             │
└───────────────┬─────────────────────────────────────────┘
                │ HTTP:4000 (Internal-LB-SG)
                ▼
┌─────────────────────────────────────────────────────────┐
│          INTERNAL APPLICATION LOAD BALANCER              │
│                   (Private Subnet)                       │
└───────────────┬─────────────────────────────────────────┘
                │ HTTP:4000 (App-Tier-SG)
                ▼
┌─────────────────────────────────────────────────────────┐
│              APPLICATION TIER (Private Subnet)           │
│               Auto Scaling Group (2+ instances)          │
│                    Node.js API Server                    │
└───────────────┬─────────────────────────────────────────┘
                │ MySQL:3306 (DB-Tier-SG)
                ▼
┌─────────────────────────────────────────────────────────┐
│               DATABASE TIER (Private Subnet)             │
│            Amazon RDS Aurora MySQL (Multi-AZ)            │
│                   2+ Read Replicas                       │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Key Components
1. **Presentation Tier (Web Tier)**: Public-facing layer serving React.js application
2. **Application Tier (Business Logic)**: Private layer handling API requests
3. **Data Tier**: Highly available database layer
4. **Load Balancers**: Distribute traffic across instances
5. **Auto Scaling Groups**: Maintain availability during traffic fluctuations
6. **Security Groups**: Control traffic flow between tiers

---

## 3. Prerequisites

### 3.1 AWS Account Requirements
- Active AWS account with AdministratorAccess or equivalent permissions
- IAM user with programmatic access (Access Key ID and Secret Access Key)
- AWS CLI configured (version 2.x recommended)
- AWS CloudShell or local terminal access

### 3.2 Local Development Environment
```bash
# Verify AWS CLI installation
aws --version

# Configure AWS credentials
aws configure
# Enter: Access Key ID, Secret Access Key, Region (us-east-1), Output (json)
```

### 3.3 GitHub Repository
```bash
# Clone the workshop repository
git clone https://github.com/your-repo/aws-three-tier-workshop.git
cd aws-three-tier-workshop

# Repository structure
/aws-three-tier-workshop
├── web-tier/
│   ├── react-app/          # Frontend React application
│   └── nginx/             # Nginx configuration files
├── app-tier/
│   └── node-api/          # Backend Node.js API
├── scripts/
│   ├── setup.sh           # Initial setup script
│   └── cleanup.sh         # Resource cleanup script
└── README.md
```

### 3.4 Estimated Costs
- **Estimated Monthly Cost**: $50-150 (depending on instance sizes)
- **Workshop Duration Cost**: $5-15 (for 4-8 hours)
- **Free Tier Eligible**: Partial (some resources may incur charges)

---

## 4. Step-by-Step Implementation

### 4.1 Step 1: Prepare S3 Buckets

#### 4.1.1 Create S3 Buckets
```bash
# Create timestamp for unique bucket names
TIMESTAMP=$(date +%s)

# Create bucket for application code
aws s3api create-bucket \
    --bucket "app-code-${TIMESTAMP}" \
    --region us-east-1 \
    --create-bucket-configuration LocationConstraint=us-east-1

# Create bucket for VPC flow logs
aws s3api create-bucket \
    --bucket "vpc-flow-logs-${TIMESTAMP}" \
    --region us-east-1 \
    --create-bucket-configuration LocationConstraint=us-east-1
```

#### 4.1.2 Upload Application Code
```bash
# Upload web tier code
aws s3 sync web-tier/ s3://app-code-${TIMESTAMP}/web-tier/

# Upload app tier code
aws s3 sync app-tier/ s3://app-code-${TIMESTAMP}/app-tier/

# Upload nginx configuration
aws s3 cp nginx/nginx.conf s3://app-code-${TIMESTAMP}/config/
```

### 4.2 Step 2: Create IAM Roles and Policies

#### 4.2.1 Create IAM Policy for S3 Access
```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "s3:GetObject",
                "s3:ListBucket"
            ],
            "Resource": [
                "arn:aws:s3:::app-code-*",
                "arn:aws:s3:::app-code-*/*"
            ]
        }
    ]
}
```

#### 4.2.2 Create IAM Role for EC2
```bash
# Create IAM role
aws iam create-role \
    --role-name ThreeTierEC2Role \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "ec2.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Attach policies
aws iam attach-role-policy \
    --role-name ThreeTierEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam attach-role-policy \
    --role-name ThreeTierEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

# Create instance profile
aws iam create-instance-profile \
    --instance-profile-name ThreeTierEC2InstanceProfile

aws iam add-role-to-instance-profile \
    --instance-profile-name ThreeTierEC2InstanceProfile \
    --role-name ThreeTierEC2Role
```

### 4.3 Step 3: Create VPC and Networking

#### 4.3.1 Create VPC
```bash
# Create VPC
VPC_ID=$(aws ec2 create-vpc \
    --cidr-block 10.0.0.0/16 \
    --tag-specifications 'ResourceType=vpc,Tags=[{Key=Name,Value=ThreeTierVPC}]' \
    --query 'Vpc.VpcId' --output text)

# Enable DNS hostnames
aws ec2 modify-vpc-attribute \
    --vpc-id $VPC_ID \
    --enable-dns-hostnames "{\"Value\":true}"

# Enable DNS support
aws ec2 modify-vpc-attribute \
    --vpc-id $VPC_ID \
    --enable-dns-support "{\"Value\":true}"
```

#### 4.3.2 Create Subnets
```bash
# Create public subnets (Web Tier)
PUBLIC_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.1.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PublicSubnet1-WebTier}]' \
    --query 'Subnet.SubnetId' --output text)

PUBLIC_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.2.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PublicSubnet2-WebTier}]' \
    --query 'Subnet.SubnetId' --output text)

# Create private subnets (App Tier)
PRIVATE_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.3.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PrivateSubnet1-AppTier}]' \
    --query 'Subnet.SubnetId' --output text)

PRIVATE_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.4.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=PrivateSubnet2-AppTier}]' \
    --query 'Subnet.SubnetId' --output text)

# Create database subnets
DB_SUBNET_1=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.5.0/24 \
    --availability-zone us-east-1a \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=DBSubnet1}]' \
    --query 'Subnet.SubnetId' --output text)

DB_SUBNET_2=$(aws ec2 create-subnet \
    --vpc-id $VPC_ID \
    --cidr-block 10.0.6.0/24 \
    --availability-zone us-east-1b \
    --tag-specifications 'ResourceType=subnet,Tags=[{Key=Name,Value=DBSubnet2}]' \
    --query 'Subnet.SubnetId' --output text)

# Enable auto-assign public IP for public subnets
aws ec2 modify-subnet-attribute \
    --subnet-id $PUBLIC_SUBNET_1 \
    --map-public-ip-on-launch

aws ec2 modify-subnet-attribute \
    --subnet-id $PUBLIC_SUBNET_2 \
    --map-public-ip-on-launch
```

#### 4.3.3 Create Internet Gateway
```bash
# Create Internet Gateway
IGW_ID=$(aws ec2 create-internet-gateway \
    --tag-specifications 'ResourceType=internet-gateway,Tags=[{Key=Name,Value=ThreeTierIGW}]' \
    --query 'InternetGateway.InternetGatewayId' --output text)

# Attach to VPC
aws ec2 attach-internet-gateway \
    --internet-gateway-id $IGW_ID \
    --vpc-id $VPC_ID
```

#### 4.3.4 Create NAT Gateway
```bash
# Allocate Elastic IP
EIP_ALLOC_ID=$(aws ec2 allocate-address \
    --domain vpc \
    --query 'AllocationId' --output text)

# Create NAT Gateway in public subnet
NAT_GW_ID=$(aws ec2 create-nat-gateway \
    --subnet-id $PUBLIC_SUBNET_1 \
    --allocation-id $EIP_ALLOC_ID \
    --tag-specifications 'ResourceType=natgateway,Tags=[{Key=Name,Value=ThreeTierNATGateway}]' \
    --query 'NatGateway.NatGatewayId' --output text)

# Wait for NAT Gateway to be available
aws ec2 wait nat-gateway-available \
    --nat-gateway-ids $NAT_GW_ID
```

#### 4.3.5 Create Route Tables
```bash
# Create public route table
PUBLIC_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=PublicRouteTable}]' \
    --query 'RouteTable.RouteTableId' --output text)

# Add route to Internet Gateway
aws ec2 create-route \
    --route-table-id $PUBLIC_RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --gateway-id $IGW_ID

# Associate public subnets with public route table
aws ec2 associate-route-table \
    --route-table-id $PUBLIC_RT_ID \
    --subnet-id $PUBLIC_SUBNET_1

aws ec2 associate-route-table \
    --route-table-id $PUBLIC_RT_ID \
    --subnet-id $PUBLIC_SUBNET_2

# Create private route table
PRIVATE_RT_ID=$(aws ec2 create-route-table \
    --vpc-id $VPC_ID \
    --tag-specifications 'ResourceType=route-table,Tags=[{Key=Name,Value=PrivateRouteTable}]' \
    --query 'RouteTable.RouteTableId' --output text)

# Add route to NAT Gateway
aws ec2 create-route \
    --route-table-id $PRIVATE_RT_ID \
    --destination-cidr-block 0.0.0.0/0 \
    --nat-gateway-id $NAT_GW_ID

# Associate private subnets with private route table
aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $PRIVATE_SUBNET_1

aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $PRIVATE_SUBNET_2

aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $DB_SUBNET_1

aws ec2 associate-route-table \
    --route-table-id $PRIVATE_RT_ID \
    --subnet-id $DB_SUBNET_2
```

#### 4.3.6 Enable VPC Flow Logs
```bash
# Create IAM role for flow logs
aws iam create-role \
    --role-name VPCFlowLogsRole \
    --assume-role-policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Effect": "Allow",
            "Principal": {"Service": "vpc-flow-logs.amazonaws.com"},
            "Action": "sts:AssumeRole"
        }]
    }'

# Create flow logs policy
aws iam put-role-policy \
    --role-name VPCFlowLogsRole \
    --policy-name VPCFlowLogsPolicy \
    --policy-document '{
        "Version": "2012-10-17",
        "Statement": [{
            "Action": [
                "logs:CreateLogGroup",
                "logs:CreateLogStream",
                "logs:PutLogEvents",
                "logs:DescribeLogGroups",
                "logs:DescribeLogStreams"
            ],
            "Effect": "Allow",
            "Resource": "*"
        }]
    }'

# Enable VPC flow logs
aws ec2 create-flow-logs \
    --resource-type VPC \
    --resource-ids $VPC_ID \
    --traffic-type ALL \
    --log-destination-type s3 \
    --log-destination "arn:aws:s3:::vpc-flow-logs-${TIMESTAMP}" \
    --max-aggregation-interval 60
```

### 4.4 Step 4: Create Security Groups

#### 4.4.1 External Load Balancer Security Group
```bash
EXTERNAL_LB_SG=$(aws ec2 create-security-group \
    --group-name External-Load-Balancer-SG \
    --description "Security group for external load balancer" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Allow HTTP from anywhere
aws ec2 authorize-security-group-ingress \
    --group-id $EXTERNAL_LB_SG \
    --protocol tcp \
    --port 80 \
    --cidr 0.0.0.0/0

# Allow HTTPS from anywhere
aws ec2 authorize-security-group-ingress \
    --group-id $EXTERNAL_LB_SG \
    --protocol tcp \
    --port 443 \
    --cidr 0.0.0.0/0
```

#### 4.4.2 Web Tier Security Group
```bash
WEB_TIER_SG=$(aws ec2 create-security-group \
    --group-name Web-Tier-SG \
    --description "Security group for web tier instances" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Allow HTTP from external load balancer only
aws ec2 authorize-security-group-ingress \
    --group-id $WEB_TIER_SG \
    --protocol tcp \
    --port 80 \
    --source-group $EXTERNAL_LB_SG

# Allow SSH from your IP (optional, for debugging)
YOUR_IP=$(curl -s ifconfig.me)
aws ec2 authorize-security-group-ingress \
    --group-id $WEB_TIER_SG \
    --protocol tcp \
    --port 22 \
    --cidr "${YOUR_IP}/32"
```

#### 4.4.3 Internal Load Balancer Security Group
```bash
INTERNAL_LB_SG=$(aws ec2 create-security-group \
    --group-name Internal-Load-Balancer-SG \
    --description "Security group for internal load balancer" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Allow HTTP from web tier only
aws ec2 authorize-security-group-ingress \
    --group-id $INTERNAL_LB_SG \
    --protocol tcp \
    --port 80 \
    --source-group $WEB_TIER_SG
```

#### 4.4.4 Application Tier Security Group
```bash
APP_TIER_SG=$(aws ec2 create-security-group \
    --group-name App-Tier-SG \
    --description "Security group for application tier instances" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Allow custom port (4000) from internal load balancer only
aws ec2 authorize-security-group-ingress \
    --group-id $APP_TIER_SG \
    --protocol tcp \
    --port 4000 \
    --source-group $INTERNAL_LB_SG

# Allow SSH from web tier (for debugging)
aws ec2 authorize-security-group-ingress \
    --group-id $APP_TIER_SG \
    --protocol tcp \
    --port 22 \
    --source-group $WEB_TIER_SG
```

#### 4.4.5 Database Tier Security Group
```bash
DB_TIER_SG=$(aws ec2 create-security-group \
    --group-name DB-Tier-SG \
    --description "Security group for database tier" \
    --vpc-id $VPC_ID \
    --query 'GroupId' --output text)

# Allow MySQL from application tier only
aws ec2 authorize-security-group-ingress \
    --group-id $DB_TIER_SG \
    --protocol tcp \
    --port 3306 \
    --source-group $APP_TIER_SG
```

### 4.5 Step 5: Create Database Tier

#### 4.5.1 Create DB Subnet Group
```bash
# Create DB subnet group
aws rds create-db-subnet-group \
    --db-subnet-group-name ThreeTierDBSubnetGroup \
    --db-subnet-group-description "Subnet group for three-tier architecture database" \
    --subnet-ids $DB_SUBNET_1 $DB_SUBNET_2
```

#### 4.5.2 Create RDS Aurora MySQL Database
```bash
# Create database cluster parameter group
aws rds create-db-cluster-parameter-group \
    --db-cluster-parameter-group-name ThreeTierClusterParamGroup \
    --db-parameter-group-family aurora-mysql5.7 \
    --description "Custom cluster parameter group for three-tier workshop"

# Create database parameter group
aws rds create-db-parameter-group \
    --db-parameter-group-name ThreeTierDBParamGroup \
    --db-parameter-group-family aurora-mysql5.7 \
    --description "Custom parameter group for three-tier workshop"

# Create Aurora MySQL cluster
DB_CLUSTER_ID=$(aws rds create-db-cluster \
    --db-cluster-identifier three-tier-cluster \
    --engine aurora-mysql \
    --engine-version 5.7.mysql_aurora.2.11.2 \
    --master-username admin \
    --master-user-password "SecurePass123!" \
    --db-subnet-group-name ThreeTierDBSubnetGroup \
    --vpc-security-group-ids $DB_TIER_SG \
    --db-cluster-parameter-group-name ThreeTierClusterParamGroup \
    --backup-retention-period 7 \
    --preferred-backup-window "03:00-04:00" \
    --preferred-maintenance-window "sun:04:00-sun:05:00" \
    --enable-cloudwatch-logs-exports '["audit","error","general","slowquery"]' \
    --storage-encrypted \
    --deletion-protection \
    --query 'DBCluster.DBClusterIdentifier' --output text)

# Wait for cluster to be available
aws rds wait db-cluster-available \
    --db-cluster-identifier $DB_CLUSTER_ID

# Create database instance in the cluster
DB_INSTANCE_ID=$(aws rds create-db-instance \
    --db-instance-identifier three-tier-db-instance \
    --db-instance-class db.t3.small \
    --engine aurora-mysql \
    --db-cluster-identifier $DB_CLUSTER_ID \
    --db-parameter-group-name ThreeTierDBParamGroup \
    --no-auto-minor-version-upgrade \
    --publicly-accessible false \
    --query 'DBInstance.DBInstanceIdentifier' --output text)

# Wait for instance to be available
aws rds wait db-instance-available \
    --db-instance-identifier $DB_INSTANCE_ID
```

### 4.6 Step 6: Create Application Tier

#### 4.6.1 Create Launch Template for Application Tier
```bash
# User data script for application tier
cat > app-tier-user-data.sh << 'EOF'
#!/bin/bash
# Update system
yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install PM2
npm install -g pm2

# Create application directory
mkdir -p /var/www/app
cd /var/www/app

# Download application code from S3
aws s3 cp s3://app-code-${TIMESTAMP}/app-tier/ /var/www/app --recursive

# Install dependencies
npm install

# Configure environment variables
cat > .env << 'ENV_EOF'
DB_HOST=${DB_ENDPOINT}
DB_USER=admin
DB_PASSWORD=SecurePass123!
DB_NAME=three_tier_app
PORT=4000
ENV_EOF

# Start application with PM2
pm2 start server.js --name "three-tier-api"

# Configure PM2 to start on boot
pm2 startup
pm2 save
EOF

# Get database endpoint
DB_ENDPOINT=$(aws rds describe-db-instances \
    --db-instance-identifier three-tier-db-instance \
    --query 'DBInstances[0].Endpoint.Address' \
    --output text)

# Create launch template
aws ec2 create-launch-template \
    --launch-template-name AppTierLaunchTemplate \
    --version-description "Initial version" \
    --launch-template-data "{
        \"ImageId\": \"ami-0c02fb55956c7d316\",
        \"InstanceType\": \"t3.small\",
        \"KeyName\": \"your-key-pair-name\",
        \"SecurityGroupIds\": [\"$APP_TIER_SG\"],
        \"IamInstanceProfile\": {
            \"Name\": \"ThreeTierEC2InstanceProfile\"
        },
        \"UserData\": \"$(base64 -w0 app-tier-user-data.sh)\",
        \"TagSpecifications\": [{
            \"ResourceType\": \"instance\",
            \"Tags\": [{
                \"Key\": \"Name\",
                \"Value\": \"App-Tier-Instance\"
            }]
        }],
        \"BlockDeviceMappings\": [{
            \"DeviceName\": \"/dev/xvda\",
            \"Ebs\": {
                \"VolumeSize\": 20,
                \"VolumeType\": \"gp3\"
            }
        }]
    }"
```

#### 4.6.2 Create Target Group for Application Tier
```bash
# Create target group for application tier
APP_TG_ARN=$(aws elbv2 create-target-group \
    --name App-Tier-TG \
    --protocol HTTP \
    --port 4000 \
    --vpc-id $VPC_ID \
    --health-check-protocol HTTP \
    --health-check-port 4000 \
    --health-check-path /health \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 2 \
    --target-type instance \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
```

#### 4.6.3 Create Internal Load Balancer
```bash
# Create internal load balancer
INTERNAL_LB_ARN=$(aws elbv2 create-load-balancer \
    --name Internal-ALB \
    --subnets $PRIVATE_SUBNET_1 $PRIVATE_SUBNET_2 \
    --security-groups $INTERNAL_LB_SG \
    --scheme internal \
    --type application \
    --ip-address-type ipv4 \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

# Wait for load balancer to be active
aws elbv2 wait load-balancer-available \
    --load-balancer-arns $INTERNAL_LB_ARN

# Get internal load balancer DNS name
INTERNAL_LB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $INTERNAL_LB_ARN \
    --query 'LoadBalancers[0].DNSName' \
    --output text)

# Create listener for internal load balancer
aws elbv2 create-listener \
    --load-balancer-arn $INTERNAL_LB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$APP_TG_ARN
```

#### 4.6.4 Create Auto Scaling Group for Application Tier
```bash
# Create Auto Scaling group
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name App-Tier-ASG \
    --launch-template "LaunchTemplateName=AppTierLaunchTemplate,Version=1" \
    --vpc-zone-identifier "$PRIVATE_SUBNET_1,$PRIVATE_SUBNET_2" \
    --target-group-arns $APP_TG_ARN \
    --min-size 2 \
    --max-size 4 \
    --desired-capacity 2 \
    --health-check-type ELB \
    --health-check-grace-period 300 \
    --tags "Key=Name,Value=App-Tier-Instance,PropagateAtLaunch=true"

# Configure scaling policies
# Scale out policy
aws autoscaling put-scaling-policy \
    --policy-name App-Tier-Scale-Out \
    --auto-scaling-group-name App-Tier-ASG \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration "{
        \"PredefinedMetricSpecification\": {
            \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"
        },
        \"TargetValue\": 70.0
    }"
```

### 4.7 Step 7: Create Web Tier

#### 4.7.1 Update Nginx Configuration
```bash
# Create nginx configuration with internal load balancer DNS
cat > nginx.conf << EOF
server {
    listen 80;
    server_name _;
    
    # Serve React frontend
    location / {
        root /var/www/web;
        index index.html;
        try_files \$uri \$uri/ /index.html;
    }
    
    # Proxy API requests to internal load balancer
    location /api/ {
        proxy_pass http://${INTERNAL_LB_DNS}/;
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
    }
}
EOF

# Upload updated nginx configuration to S3
aws s3 cp nginx.conf s3://app-code-${TIMESTAMP}/config/nginx.conf
```

#### 4.7.2 Create Launch Template for Web Tier
```bash
# User data script for web tier
cat > web-tier-user-data.sh << 'EOF'
#!/bin/bash
# Update system
yum update -y

# Install Node.js
curl -sL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs

# Install Nginx
amazon-linux-extras install nginx1 -y

# Create web directory
mkdir -p /var/www/web
cd /var/www/web

# Download web code from S3
aws s3 cp s3://app-code-${TIMESTAMP}/web-tier/ /var/www/web --recursive

# Download nginx configuration
aws s3 cp s3://app-code-${TIMESTAMP}/config/nginx.conf /etc/nginx/conf.d/default.conf

# Build React application
npm install
npm run build

# Move build to web root
cp -r build/* /var/www/web/

# Start Nginx
systemctl start nginx
systemctl enable nginx

# Start React development server (optional)
# npm start &
EOF

# Create launch template for web tier
aws ec2 create-launch-template \
    --launch-template-name WebTierLaunchTemplate \
    --version-description "Initial version" \
    --launch-template-data "{
        \"ImageId\": \"ami-0c02fb55956c7d316\",
        \"InstanceType\": \"t3.micro\",
        \"KeyName\": \"your-key-pair-name\",
        \"SecurityGroupIds\": [\"$WEB_TIER_SG\"],
        \"IamInstanceProfile\": {
            \"Name\": \"ThreeTierEC2InstanceProfile\"
        },
        \"UserData\": \"$(base64 -w0 web-tier-user-data.sh)\",
        \"TagSpecifications\": [{
            \"ResourceType\": \"instance\",
            \"Tags\": [{
                \"Key\": \"Name\",
                \"Value\": \"Web-Tier-Instance\"
            }]
        }],
        \"BlockDeviceMappings\": [{
            \"DeviceName\": \"/dev/xvda\",
            \"Ebs\": {
                \"VolumeSize\": 20,
                \"VolumeType\": \"gp3\"
            }
        }]
    }"
```

#### 4.7.3 Create Target Group for Web Tier
```bash
# Create target group for web tier
WEB_TG_ARN=$(aws elbv2 create-target-group \
    --name Web-Tier-TG \
    --protocol HTTP \
    --port 80 \
    --vpc-id $VPC_ID \
    --health-check-protocol HTTP \
    --health-check-port 80 \
    --health-check-path / \
    --health-check-interval-seconds 30 \
    --health-check-timeout-seconds 5 \
    --healthy-threshold-count 2 \
    --unhealthy-threshold-count 2 \
    --target-type instance \
    --query 'TargetGroups[0].TargetGroupArn' \
    --output text)
```

#### 4.7.4 Create External Load Balancer
```bash
# Create external load balancer
EXTERNAL_LB_ARN=$(aws elbv2 create-load-balancer \
    --name External-ALB \
    --subnets $PUBLIC_SUBNET_1 $PUBLIC_SUBNET_2 \
    --security-groups $EXTERNAL_LB_SG \
    --scheme internet-facing \
    --type application \
    --ip-address-type ipv4 \
    --query 'LoadBalancers[0].LoadBalancerArn' \
    --output text)

# Wait for load balancer to be active
aws elbv2 wait load-balancer-available \
    --load-balancer-arns $EXTERNAL_LB_ARN

# Get external load balancer DNS name
EXTERNAL_LB_DNS=$(aws elbv2 describe-load-balancers \
    --load-balancer-arns $EXTERNAL_LB_ARN \
    --query 'LoadBalancers[0].DNSName' \
    --output text)

# Create listener for external load balancer
aws elbv2 create-listener \
    --load-balancer-arn $EXTERNAL_LB_ARN \
    --protocol HTTP \
    --port 80 \
    --default-actions Type=forward,TargetGroupArn=$WEB_TG_ARN
```

#### 4.7.5 Create Auto Scaling Group for Web Tier
```bash
# Create Auto Scaling group
aws autoscaling create-auto-scaling-group \
    --auto-scaling-group-name Web-Tier-ASG \
    --launch-template "LaunchTemplateName=WebTierLaunchTemplate,Version=1" \
    --vpc-zone-identifier "$PUBLIC_SUBNET_1,$PUBLIC_SUBNET_2" \
    --target-group-arns $WEB_TG_ARN \
    --min-size 2 \
    --max-size 4 \
    --desired-capacity 2 \
    --health-check-type ELB \
    --health-check-grace-period 300 \
    --tags "Key=Name,Value=Web-Tier-Instance,PropagateAtLaunch=true"

# Configure scaling policies
aws autoscaling put-scaling-policy \
    --policy-name Web-Tier-Scale-Out \
    --auto-scaling-group-name Web-Tier-ASG \
    --policy-type TargetTrackingScaling \
    --target-tracking-configuration "{
        \"PredefinedMetricSpecification\": {
            \"PredefinedMetricType\": \"ASGAverageCPUUtilization\"
        },
        \"TargetValue\": 60.0
    }"
```

### 4.8 Step 8: Configure DNS (Route 53)

```bash
# Get hosted zone ID (if you have a domain)
HOSTED_ZONE_ID=$(aws route53 list-hosted-zones \
    --query 'HostedZones[?Name==`yourdomain.com.`].Id' \
    --output text)

# Create record set
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "CREATE",
            "ResourceRecordSet": {
                "Name": "three-tier.yourdomain.com",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [{
                    "Value": "'"${EXTERNAL_LB_DNS}"'"
                }]
            }
        }]
    }'
```

### 4.9 Step 9: Configure Monitoring and Alerting

#### 4.9.1 Create SNS Topic for Alarms
```bash
# Create SNS topic
SNS_TOPIC_ARN=$(aws sns create-topic \
    --name ThreeTierAlerts \
    --query 'TopicArn' \
    --output text)

# Subscribe email to topic
aws sns subscribe \
    --topic-arn $SNS_TOPIC_ARN \
    --protocol email \
    --notification-endpoint your-email@example.com
```

#### 4.9.2 Create CloudWatch Alarms
```bash
# High CPU alarm for web tier
aws cloudwatch put-metric-alarm \
    --alarm-name Web-Tier-High-CPU \
    --alarm-description "Web tier CPU utilization > 80% for 5 minutes" \
    --metric-name CPUUtilization \
    --namespace AWS/EC2 \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions "Name=AutoScalingGroupName,Value=Web-Tier-ASG" \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN

# Unhealthy host count alarm for external ALB
aws cloudwatch put-metric-alarm \
    --alarm-name External-ALB-Unhealthy-Hosts \
    --alarm-description "External ALB has unhealthy hosts" \
    --metric-name UnHealthyHostCount \
    --namespace AWS/ApplicationELB \
    --statistic Sum \
    --period 60 \
    --threshold 0 \
    --comparison-operator GreaterThanThreshold \
    --dimensions "Name=LoadBalancer,Value=External-ALB" \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN

# Database connection alarm
aws cloudwatch put-metric-alarm \
    --alarm-name RDS-High-Connections \
    --alarm-description "RDS database connections > 80% of max" \
    --metric-name DatabaseConnections \
    --namespace AWS/RDS \
    --statistic Average \
    --period 300 \
    --threshold 80 \
    --comparison-operator GreaterThanThreshold \
    --dimensions "Name=DBInstanceIdentifier,Value=three-tier-db-instance" \
    --evaluation-periods 2 \
    --alarm-actions $SNS_TOPIC_ARN
```

#### 4.9.3 Enable Enhanced Monitoring for RDS
```bash
# Modify RDS instance to enable enhanced monitoring
aws rds modify-db-instance \
    --db-instance-identifier three-tier-db-instance \
    --monitoring-interval 60 \
    --monitoring-role-arn "arn:aws:iam::$(aws sts get-caller-identity --query Account --output text):role/RDSEnhancedMonitoringRole"
```

### 4.10 Step 10: Configure CloudTrail
```bash
# Create CloudTrail trail
aws cloudtrail create-trail \
    --name ThreeTierWorkshopTrail \
    --s3-bucket-name "vpc-flow-logs-${TIMESTAMP}" \
    --is-multi-region-trail \
    --enable-log-file-validation \
    --include-global-service-events

# Start logging
aws cloudtrail start-logging \
    --name ThreeTierWorkshopTrail
```

---

## 5. Testing & Validation

### 5.1 Verify Architecture Components
```bash
# List all created resources
echo "=== VPC and Subnets ==="
aws ec2 describe-vpcs --vpc-ids $VPC_ID
aws ec2 describe-subnets --filters "Name=vpc-id,Values=$VPC_ID"

echo "=== Security Groups ==="
aws ec2 describe-security-groups --group-ids $EXTERNAL_LB_SG $WEB_TIER_SG $INTERNAL_LB_SG $APP_TIER_SG $DB_TIER_SG

echo "=== Load Balancers ==="
aws elbv2 describe-load-balancers

echo "=== Auto Scaling Groups ==="
aws autoscaling describe-auto-scaling-groups

echo "=== RDS Database ==="
aws rds describe-db-instances --db-instance-identifier three-tier-db-instance
```

### 5.2 Test Connectivity
```bash
# Test external load balancer
curl -v http://$EXTERNAL_LB_DNS

# Test web tier instances directly (if needed)
WEB_INSTANCE_IP=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=Web-Tier-Instance" \
    --query 'Reservations[0].Instances[0].PublicIpAddress' \
    --output text)
curl http://$WEB_INSTANCE_IP

# Test database connectivity (from app tier)
APP_INSTANCE_ID=$(aws ec2 describe-instances \
    --filters "Name=tag:Name,Values=App-Tier-Instance" \
    --query 'Reservations[0].Instances[0].InstanceId' \
    --output text)

# Use SSM Session Manager to connect
aws ssm start-session --target $APP_INSTANCE_ID
# Inside the session:
# mysql -h $DB_ENDPOINT -u admin -p
```

### 5.3 Load Testing (Optional)
```bash
# Install and run simple load test
pip install locust

# Create locustfile.py
cat > locustfile.py << 'EOF'
from locust import HttpUser, task, between

class ThreeTierUser(HttpUser):
    wait_time = between(1, 3)
    
    @task
    def visit_homepage(self):
        self.client.get("/")
    
    @task(3)
    def call_api(self):
        self.client.get("/api/data")
EOF

# Run load test
locust -f locustfile.py --host http://$EXTERNAL_LB_DNS
```

### 5.4 Health Check Validation
```bash
# Check target group health
aws elbv2 describe-target-health \
    --target-group-arn $WEB_TG_ARN

aws elbv2 describe-target-health \
    --target-group-arn $APP_TG_ARN

# Check CloudWatch metrics
aws cloudwatch get-metric-statistics \
    --namespace AWS/ApplicationELB \
    --metric-name RequestCount \
    --dimensions Name=LoadBalancer,Value=External-ALB \
    --start-time $(date -d '1 hour ago' +%Y-%m-%dT%H:%M:%SZ) \
    --end-time $(date +%Y-%m-%dT%H:%M:%SZ) \
    --period 300 \
    --statistics Sum
```

---

## 6. Cleanup Procedure

### 6.1 Cleanup Script
```bash
#!/bin/bash
# cleanup-three-tier.sh

echo "Starting cleanup of three-tier architecture..."

# Delete CloudTrail trail
aws cloudtrail delete-trail --name ThreeTierWorkshopTrail

# Delete CloudWatch alarms
aws cloudwatch delete-alarms --alarm-names \
    "Web-Tier-High-CPU" \
    "External-ALB-Unhealthy-Hosts" \
    "RDS-High-Connections"

# Delete SNS topic
SNS_TOPIC_ARN=$(aws sns list-topics --query 'Topics[?contains(TopicArn,`ThreeTierAlerts`)].TopicArn' --output text)
aws sns delete-topic --topic-arn $SNS_TOPIC_ARN

# Delete Route 53 record (if created)
aws route53 change-resource-record-sets \
    --hosted-zone-id $HOSTED_ZONE_ID \
    --change-batch '{
        "Changes": [{
            "Action": "DELETE",
            "ResourceRecordSet": {
                "Name": "three-tier.yourdomain.com",
                "Type": "CNAME",
                "TTL": 300,
                "ResourceRecords": [{
                    "Value": "'"${EXTERNAL_LB_DNS}"'"
                }]
            }
        }]
    }'

# Delete Auto Scaling groups
aws autoscaling delete-auto-scaling-group \
    --auto-scaling-group-name Web-Tier-ASG \
    --force-delete

aws autoscaling delete-auto-scaling-group \
    --auto-scaling-group-name App-Tier-ASG \
    --force-delete

# Delete launch templates
aws ec2 delete-launch-template --launch-template-name WebTierLaunchTemplate
aws ec2 delete-launch-template --launch-template-name AppTierLaunchTemplate

# Delete load balancers
aws elbv2 delete-load-balancer --load-balancer-arn $EXTERNAL_LB_ARN
aws elbv2 delete-load-balancer --load-balancer-arn $INTERNAL_LB_ARN

# Wait for load balancers to be deleted
sleep 60

# Delete target groups
aws elbv2 delete-target-group --target-group-arn $WEB_TG_ARN
aws elbv2 delete-target-group --target-group-arn $APP_TG_ARN

# Delete RDS instance
aws rds delete-db-instance \
    --db-instance-identifier three-tier-db-instance \
    --skip-final-snapshot

# Wait for RDS deletion
aws rds wait db-instance-deleted \
    --db-instance-identifier three-tier-db-instance

# Delete RDS cluster
aws rds delete-db-cluster \
    --db-cluster-identifier three-tier-cluster \
    --skip-final-snapshot

# Delete DB subnet group
aws rds delete-db-subnet-group --db-subnet-group-name ThreeTierDBSubnetGroup

# Delete parameter groups
aws rds delete-db-cluster-parameter-group \
    --db-cluster-parameter-group-name ThreeTierClusterParamGroup

aws rds delete-db-parameter-group \
    --db-parameter-group-name ThreeTierDBParamGroup

# Delete NAT Gateway
NAT_GW_ID=$(aws ec2 describe-nat-gateways \
    --filter "Name=tag:Name,Values=ThreeTierNATGateway" \
    --query 'NatGateways[0].NatGatewayId' \
    --output text)

aws ec2 delete-nat-gateway --nat-gateway-id $NAT_GW_ID

# Wait for NAT Gateway deletion
aws ec2 wait nat-gateway-deleted --nat-gateway-ids $NAT_GW_ID

# Release Elastic IP
EIP_ALLOC_ID=$(aws ec2 describe-addresses \
    --filters "Name=tag:Name,Values=ThreeTierNATEIP" \
    --query 'Addresses[0].AllocationId' \
    --output text)

aws ec2 release-address --allocation-id $EIP_ALLOC_ID

# Detach and delete Internet Gateway
IGW_ID=$(aws ec2 describe-internet-gateways \
    --filters "Name=tag:Name,Values=ThreeTierIGW" \
    --query 'InternetGateways[0].InternetGatewayId' \
    --output text)

VPC_ID=$(aws ec2 describe-vpcs \
    --filters "Name=tag:Name,Values=ThreeTierVPC" \
    --query 'Vpcs[0].VpcId' \
    --output text)

aws ec2 detach-internet-gateway \
    --internet-gateway-id $IGW_ID \
    --vpc-id $VPC_ID

aws ec2 delete-internet-gateway --internet-gateway-id $IGW_ID

# Delete VPC (this will delete subnets, route tables, security groups)
aws ec2 delete-vpc --vpc-id $VPC_ID

# Delete S3 buckets
aws s3 rb s3://app-code-${TIMESTAMP} --force
aws s3 rb s3://vpc-flow-logs-${TIMESTAMP} --force

# Delete IAM roles
aws iam remove-role-from-instance-profile \
    --instance-profile-name ThreeTierEC2InstanceProfile \
    --role-name ThreeTierEC2Role

aws iam delete-instance-profile \
    --instance-profile-name ThreeTierEC2InstanceProfile

aws iam detach-role-policy \
    --role-name ThreeTierEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess

aws iam detach-role-policy \
    --role-name ThreeTierEC2Role \
    --policy-arn arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore

aws iam delete-role --role-name ThreeTierEC2Role
aws iam delete-role --role-name VPCFlowLogsRole

echo "Cleanup completed successfully!"
```

### 6.2 Manual Cleanup Checklist
If the script fails, manually check and delete:

1. **EC2 Instances**: Terminate any running instances
2. **EBS Volumes**: Delete unattached volumes
3. **Network Interfaces**: Delete any leftover ENIs
4. **VPC Endpoints**: Delete if created
5. **CloudWatch Log Groups**: Delete `/aws/rds/three-tier-cluster`
6. **IAM Policies**: Delete custom policies
7. **S3 Objects**: Empty buckets before deletion

---

## 7. Troubleshooting Guide

### 7.1 Common Issues and Solutions

#### Issue 1: EC2 Instances Failing Health Checks
**Symptoms**: Instances showing as "unhealthy" in target groups
**Solutions**:
1. Check security group rules
2. Verify application is running on the correct port
3. Check instance system logs
```bash
# Get instance console output
aws ec2 get-console-output --instance-id $INSTANCE_ID

# Check security group associations
aws ec2 describe-instances --instance-ids $INSTANCE_ID --query 'Reservations[0].Instances[0].SecurityGroups'
```

#### Issue 2: Database Connection Failures
**Symptoms**: Application cannot connect to RDS
**Solutions**:
1. Verify security group allows traffic from app tier
2. Check RDS is in "available" state
3. Verify connection string parameters
```bash
# Check RDS status
aws rds describe-db-instances --db-instance-identifier three-tier-db-instance

# Test connectivity from app tier
aws ssm start-session --target $APP_INSTANCE_ID
# Inside session:
# telnet $DB_ENDPOINT 3306
```

#### Issue 3: Load Balancer Returning 502 Errors
**Symptoms**: HTTP 502 Bad Gateway from ALB
**Solutions**:
1. Check target group health
2. Verify instances are registered with target group
3. Check application logs for errors
```bash
# Check target health
aws elbv2 describe-target-health --target-group-arn $WEB_TG_ARN

# Check ALB access logs (if enabled)
aws s3 ls s3://your-alb-logs-bucket/
```

#### Issue 4: Auto Scaling Not Working
**Symptoms**: Instances not scaling up/down based on load
**Solutions**:
1. Verify CloudWatch alarms are in "OK" state
2. Check Auto Scaling group metrics
3. Verify scaling policies are attached
```bash
# Describe Auto Scaling group
aws autoscaling describe-auto-scaling-groups --auto-scaling-group-names Web-Tier-ASG

# Check scaling activities
aws autoscaling describe-scaling-activities --auto-scaling-group-name Web-Tier-ASG
```

### 7.2 Debugging Commands
```bash
# General troubleshooting commands
# List all resources with tags
aws resourcegroupstaggingapi get-resources --tag-filters Key=Name,Values=ThreeTier*

# Check CloudTrail logs for errors
aws cloudtrail lookup-events --lookup-attributes AttributeKey=EventName,AttributeValue=DeleteTrail

# Monitor CloudWatch metrics
aws cloudwatch list-metrics --namespace AWS/EC2

# Check VPC flow logs
aws s3 cp s3://vpc-flow-logs-${TIMESTAMP}/AWSLogs/$(aws sts get-caller-identity --query Account --output text)/vpcflowlogs/us-east-1/ - --recursive | head -20
```

---

## 8. Additional Resources

### 8.1 AWS Documentation
- [VPC User Guide](https://docs.aws.amazon.com/vpc/latest/userguide/)
- [EC2 Auto Scaling Guide](https://docs.aws.amazon.com/autoscaling/ec2/userguide/)
- [RDS User Guide](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/)
- [Application Load Balancer Guide](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/)
- [CloudWatch User Guide](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/)

### 8.2 Best Practices
1. **Security**: Always use IAM roles, security groups, and encryption
2. **High Availability**: Use Multi-AZ for RDS and multiple subnets for EC2
3. **Cost Optimization**: Right-size instances, use Auto Scaling, clean up unused resources
4. **Monitoring**: Set up CloudWatch alarms and enable detailed monitoring
5. **Backup**: Regular RDS snapshots and AMI creation

### 8.3 Next Steps
1. Implement Infrastructure as Code using CloudFormation or Terraform
2. Add CI/CD pipeline using AWS CodePipeline
3. Implement AWS WAF for web application firewall
4. Add Amazon CloudFront for CDN
5. Implement AWS Backup for centralized backup management

---

## Appendix A: Sample Application Code

### Web Tier (React.js)
```javascript
// src/App.js
import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(response => response.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        setLoading(false);
      });
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1>AWS Three-Tier Architecture Demo</h1>
        {loading ? (
          <p>Loading data...</p>
        ) : (
          <div>
            <h2>Database Records:</h2>
            <ul>
              {data.map((item, index) => (
                <li key={index}>{item.name} - {item.value}</li>
              ))}
            </ul>
          </div>
        )}
      </header>
    </div>
  );
}

export default App;
```

### Application Tier (Node.js)
```javascript
// server.js
const express = require('express');
const mysql = require('mysql2/promise');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 4000;

// Database connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy' });
  } catch (error) {
    res.status(500).json({ status: 'unhealthy', error: error.message });
  }
});

// API endpoint
app.get('/api/data', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM sample_data');
    res.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Initialize database
async function initializeDatabase() {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sample_data (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        value VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Insert sample data if table is empty
    const [rows] = await pool.query('SELECT COUNT(*) as count FROM sample_data');
    if (rows[0].count === 0) {
      await pool.query(`
        INSERT INTO sample_data (name, value) VALUES
        ('AWS', 'Amazon Web Services'),
        ('EC2', 'Elastic Compute Cloud'),
        ('RDS', 'Relational Database Service'),
        ('ALB', 'Application Load Balancer'),
        ('ASG', 'Auto Scaling Group')
      `);
      console.log('Sample data inserted');
    }
  } catch (error) {
    console.error('Database initialization error:', error);
  }
}

// Start server
app.listen(PORT, async () => {
  console.log(`Application tier listening on port ${PORT}`);
  await initializeDatabase();
});

module.exports = app;
```

---

## Appendix B: Workshop Completion Checklist

- [ ] VPC with public and private subnets created
- [ ] Internet Gateway and NAT Gateway configured
- [ ] Security groups for each tier created
- [ ] RDS Aurora MySQL database deployed
- [ ] Application tier Auto Scaling group configured
- [ ] Web tier Auto Scaling group configured
- [ ] Internal and external load balancers deployed
- [ ] Route 53 DNS record configured
- [ ] CloudWatch alarms and SNS notifications set up
- [ ] CloudTrail logging enabled
- [ ] Application accessible via web browser
- [ ] All health checks passing
- [ ] Load testing completed successfully
- [ ] Cleanup script tested

---

**Workshop Completed!** 🎉

You have successfully implemented a production-ready three-tier web architecture on AWS. This architecture demonstrates industry best practices for scalability, availability, and security.

**Next Challenge**: Try implementing this architecture using AWS CloudFormation or Terraform for Infrastructure as Code!

---

*Document Version: 1.0*
*Last Updated: November 2024*
*Author: Leonard Kachi*
*AWS Services Used: VPC, EC2, RDS, ALB, ASG, S3, IAM, Route 53, CloudWatch, CloudTrail, SNS*
