# Configure the Microsoft Azure Provider
provider "azurerm" {
subscription_id = "4c532d7a-ab03-4249-b257-67f510c22431"
   
 client_id       = "63c246df-a1c6-4141-9367-7a251cdb1094"
   
 client_secret   = "Z6Knb0c_uRkRhd-Sw]sN45ij@HFEFX51"
  
 tenant_id       = "93f33571-550f-43cf-b09f-cd331338d086"

}

resource "azurerm_resource_group" "test" {
  name     = "acctestrg"
  location = "West US 2"
}

resource "azurerm_virtual_network" "test" {
  name                = "acctvnn"
  address_space       = ["10.0.0.0/16"]
  location            = "${azurerm_resource_group.test.location}"
  resource_group_name = "${azurerm_resource_group.test.name}"
}

resource "azurerm_subnet" "test" {
  name                 = "acctsub"
  resource_group_name  = "${azurerm_resource_group.test.name}"
  virtual_network_name = "${azurerm_virtual_network.test.name}"
  address_prefix       = "10.0.2.0/24"
}

resource "azurerm_public_ip" "test" {
    name                         = "myPublicIP"
    location                     = "${azurerm_resource_group.test.location}"
    resource_group_name          = "${azurerm_resource_group.test.name}"
    public_ip_address_allocation = "dynamic"
}


resource "azurerm_network_interface" "test" {
  name                = "acctni"
  location            = "${azurerm_resource_group.test.location}"
  resource_group_name = "${azurerm_resource_group.test.name}"

  ip_configuration {
    name                          = "testconfiguration1"
    subnet_id                     = "${azurerm_subnet.test.id}"
    private_ip_address_allocation = "dynamic"
	public_ip_address_id          = "${azurerm_public_ip.test.id}"
  }
}

resource "azurerm_managed_disk" "test" {
  name                 = "datadisk_existing"
  location             = "${azurerm_resource_group.test.location}"
  resource_group_name  = "${azurerm_resource_group.test.name}"
  storage_account_type = "Standard_LRS"
  create_option        = "Empty"
  disk_size_gb         = "1023"
}

resource "azurerm_virtual_machine" "test" {
  name                  = "acctvm"
  location              = "${azurerm_resource_group.test.location}"
  resource_group_name   = "${azurerm_resource_group.test.name}"
  network_interface_ids = ["${azurerm_network_interface.test.id}"]
  vm_size               = "Standard_DS1_v2"

  # Uncomment this line to delete the OS disk automatically when deleting the VM
  # delete_os_disk_on_termination = true

  # Uncomment this line to delete the data disks automatically when deleting the VM
  # delete_data_disks_on_termination = true

  storage_image_reference {
    publisher = "Canonical"
    offer     = "UbuntuServer"
    sku       = "16.04-LTS"
    version   = "latest"
  }

  storage_os_disk {
    name              = "myosdisk1"
    caching           = "ReadWrite"
    create_option     = "FromImage"
    managed_disk_type = "Standard_LRS"
  }

  # Optional data disks
  storage_data_disk {
    name              = "datadisk_new"
    managed_disk_type = "Standard_LRS"
    create_option     = "Empty"
    lun               = 0
    disk_size_gb      = "1023"
  }

  storage_data_disk {
    name            = "${azurerm_managed_disk.test.name}"
    managed_disk_id = "${azurerm_managed_disk.test.id}"
    create_option   = "Attach"
    lun             = 1
    disk_size_gb    = "${azurerm_managed_disk.test.disk_size_gb}"
  }

  os_profile {
    computer_name  = "hostname"
    admin_username = "testadmin"
    #admin_password = "Password1234!"
  }

  os_profile_linux_config {
    disable_password_authentication = true
	  ssh_keys = [{
        path     = "/home/jenkins/.ssh/authorized_keys"
        key_data = "sh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQDRj5v+Vpg4iFLNUEUcGIBQxLtpDEUiHP8YyYS0bASYOaMou9+FR96DxN+aMciH89er8Mp8pygGjjT9JOeFKuQkVeRjVMQg97P9Uw91xOu7dJ7efGFwEgkPqn+TYvXENNpFoppHHC5fy2lDMW/wT+uyu7quUMFn3rte0CnrXqp6a85tlVEeMeSySNq9sHeGM2sD9mP+RM/s+hm30AJ8G7qPAMEPYbKScrOTlsvhtvd2d83SYyDopm3tTV9/stJlIiJXkg8OTGeg0vpgOEqBeG7e5vaMzroOEzWiEl/+CsU6YlDPJ83bm6ERzUtbJUvFwRdO1PXZFbxqO2dc9+HCu6eT jenkins@jenkins"
      }]
  }
	connection {
        host = "sometestdn.westus.cloudapp.azure.com"
        user = "testadmin"
        type = "ssh"
        private_key = "${file("~/.ssh/id_rsa_unencrypted")}"
        timeout = "1m"
        agent = true
    }

  tags {
    environment = "staging"
  }
}


