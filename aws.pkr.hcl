# Define the Packer configuration and required plugins
packer {
  required_plugins {
    amazon = {
      version = ">= 1.2.8"
      source  = "github.com/hashicorp/amazon"
    }
  }
}

# Define variables to allow customization of the AMI build process
variable "aws_region" {
  type    = string
  default = "us-east-1"
}

variable "source_ami" {
  type    = string
  default = "ami-0866a3c8686eaeeba" # Ubuntu 24.04 LTS us-east-1
}

variable "ssh_username" {
  type    = string
  default = "ubuntu" # Default SSH username for Ubuntu
}

variable "instance_type" {
  type    = string
  default = "t2.small" # Default instance type
}

variable "subnet_id" {
  type    = string
  default = "subnet-04f30840eff049c6e" # Default subnet ID for your VPC
}

variable "volume_size" {
  type    = number
  default = 25 # Default volume size for the root disk (in GB)
}

variable "ami_name_prefix" {
  type    = string
  default = "csye6225_webapp" # Prefix for your AMI name
}

# Define the source block for the AMI creation
source "amazon-ebs" "ubuntu-ami" {
  region          = var.aws_region                                             # AWS region for the AMI
  ami_name        = "${var.ami_name_prefix}_${replace(timestamp(), ":", "-")}" # AMI name with a timestamp
  ami_description = "AMI for CSYE 6225 A4"                                     # AMI description
  source_ami      = var.source_ami                                             # Base AMI (Ubuntu 24.04 LTS)
  instance_type   = var.instance_type                                          # AWS EC2 instance type
  ssh_username    = var.ssh_username                                           # SSH username for the instance
  subnet_id       = var.subnet_id                                              # Subnet ID where the instance will be launched
  ami_users = [
    "911167899482", #dev
    "557690626086"  #demo
  ]                 # Private image

  # Block device mapping (root volume) configuration
  launch_block_device_mappings {
    delete_on_termination = true            # Automatically delete the volume when the instance terminates
    device_name           = "/dev/sda1"     # Root volume device name
    volume_size           = var.volume_size # Size of the root volume (in GB)
    volume_type           = "gp2"           # Volume type (gp2 is General Purpose SSD)
  }

  # AWS polling settings to control retries during AMI creation
  aws_polling {
    delay_seconds = 120 # Time to wait between retries
    max_attempts  = 20  # Number of attempts to create the AMI
  }
}

build {
  name    = "AWS-packer" # Name of the build
  sources = ["source.amazon-ebs.ubuntu-ami"]

  provisioner "file" {
    source      = "./webapp.zip"
    destination = "/tmp/webapp.zip"
  }

  provisioner "file" {
    source      = "./webapp.service"
    destination = "/tmp/webapp.service"
  }

  # Use the shell provisioner with environment variables
  provisioner "shell" {

    scripts = [
      "scripts/create_user.sh",
      "scripts/setup_node_systemd.sh",
      "scripts/start_app_systemd.sh"
    ]
    environment_vars = [
      "DEBIAN_FRONTEND=noninteractive",
      "CHECKPOINT_DISABLE=1"
    ]

  }

  post-processor "manifest" {
    output     = "packer-output.json"
    strip_path = true
    custom_data = {
      "my_custom_data" = "example"
    }
  }

}
