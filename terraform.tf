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
    admin_username = "jenkins"
    #admin_password = "Password1234!"
  }

  os_profile_linux_config {
    disable_password_authentication = true
	  ssh_keys = [{
        path     = "/home/jenkins/.ssh/authorized_keys"
        key_data = "ssh-rsa MIIEpAIBAAKCAQEAp8VLDQuLUm9VOFfFWozNt0vR/xGhPPO7VZC5vX7L+KHmkTT+
sVf5V35SF2XdaHvDdijv3wTF8wQWk+0ThGsg8NaiECPTeDl0jjk0C4Z5Js/OLyXP
Os9rKDvXrQDh7a5ht7SgkV5fuYbGoZD1x9ufuGwpfOTltlgf4HbwX22Ha7Q+viZ5
BiDkR8QS+dfdYcPgeLwj8WHHYYIe9JEZko4XQvxYtQ/m5JeLgPRtIK8g+gB1egW6
/yWu7mCpa85tD6A/Zz7P+nlksWN9cKCKuN88OZYCS1JccnIHUQfenewem4hh7hq5
ClnYlX5PCpaUc07IUpGOk2i62+1OBmBWHLErbwIDAQABAoIBAGoK+nU0ZsukM2l5
kPS7KwxAkGt46UFtjWt4Hu73xlVRgDsoFBRkVuZGofzIFjqEf/efyH5etf/1BZBa
uYtpa1jPUYCCJJhJOLLs1UizpsAxeVGzxFiX4lN7/8cKV8O0BW/oa9V2oWrTFZnp
1nCNEVewhki7Jbcr3Ho0s5qd0IryTO2rXYGQeCQ112FMfToqExInScpdnc+xtdbR
ypHY7f/VufUXx2rdlo89fqy2CMm9KE0gEuPoxzZCmvgBDeP7jeRZtbrUQStUjeMl
/JrLhMkG576Zrpa9X5M+Z0e1lNATAe5nKrwBsM5yLJoPjcfT8TrPH21yJcMxkEaR
LCUvbAECgYEA0y1tfOxImP5Zs4vETiFm//b0bDunAWfvok8rURUsJZuejrHYDKb1
qWrDDZ2IMRqW2BNSLwYghyVjExp20kpsUw+WbK9RxoAcL6zkz7RPUET8ufpB9h1+
douFiYqhyhJLl5K9+bz1Wz0NmfFjnyo48vJbrWVK1oZ7rfIGoq9L9iECgYEAy2FO
0U4Q5Gw7093JaKWrZ5mlIn1r0RDpK5xaNKRR09Y2X9j8WS+oy8Jqoy6UqODb6Eng
JDke/kLymppXEuDUsLfrdwqflX5elRu2ZH47rbtfuskYbSbl+t2l9oIncnY0Rj6h
gt36HVUPV2IyN6/o4tTJpEqVnZoFbeWrjoF+z48CgYBjq8lFcPBC5anIyGr6xWEr
5o8ulmkYjMnZvawgNPIFPhH0H5RtRFAmijFNt9CT/Iy9p0De2PF5V/gPCCqUznOa
MH07BvR9z/F9vwivz9aveCAgVzHSy9DoeqmoZTo/easb+zKXMMxNJ9/HjNsMQI1o
fWMvz+MmpYqyas0e88XSgQKBgQCd0uhgAi2XpOoUclK+k3lczt1X025ccbwP7KgP
m8goFF5jqLXC2/ooDLnF4frYxo3AR7vZQD5t3zP2h3i0nKZQcJkX6rWGQ+dP3I6A
k3jqS7Jw92auJXZoY6JLlhrYdyP/stCRBoL2SjC6hegkUKzvgWLszDgocgJuksC7
uH/YvwKBgQCFg6pee8oetgNdcBCDI2vels+ZbT0mpZwu20H8lMmbaLOE8BN407wo
IyZGuK86MyHPGmE37/nRv4qpkbpSCJxRPWfFUsjFcwqdXFYslWyugJiWPmNtS0zw
wgq5djdz6k9X1F0ts9L2Olbjxru0rL8iDyhhi9ksOhdx3X5W7EYoZQ== pavanpg8383@gmail.com"
      }]
  }
	
  tags {
    environment = "staging"
  }
}


