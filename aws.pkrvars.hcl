aws_region      = "us-east-1"                    # The AWS region you want to use
source_ami      = "ami-0866a3c8686eaeeba"        # The Ubuntu 24.04 LTS AMI ID
ssh_username    = "ubuntu"                       # The default SSH username for Ubuntu
subnet_id       = "subnet-04f30840eff049c6e"     # Your default VPC's subnet ID
instance_type   = "t2.medium"                     # The EC2 instance type
volume_size     = 25                             # The size of the root volume (in GB)
ami_name_prefix = "csye6225_webapp"              # Prefix for the name of the custom AMI
