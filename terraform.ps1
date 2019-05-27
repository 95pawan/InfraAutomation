Echo "signing in to the azure portal . . . . . . ." 
az login -u xxxxxx -p xxxxxx

echo "initializing the terraform  . . . . . . . ."
terraform init

echo "creating the virtual machine with Terraform option to install jenkins on the newly provisioned VMs"
terraform apply -auto-approve

echo "virtual machine created successfully . . . . . . . . ."
az vm show --resource-group acctestrg --name acctvm -d --query [publicIps] --o tsv

echo "you can access jenkins in the port 8080"

cmd /k
