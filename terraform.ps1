Echo "signing in to the azure portal . . . . . . ." 
az login -u nisarga.g@dxc.com -p Myfrd@4059
az account set --subscription cbe76251-44c1-44b7-bf4c-ddfb8b65d2e3

echo "initializing the terraform  . . . . . . . ."
terraform init

echo "creating the virtual machine with Terraform option to install jenkins on the newly provisioned VMs"
terraform apply -auto-approve

echo "virtual machine created successfully . . . . . . . . ."
az vm show --resource-group acctestrg --name acctvm -d --query [publicIps] --o tsv

echo "you can access jenkins in the port 8080"

cmd /k
