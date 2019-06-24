# Configure the Microsoft Azure Provider
provider "azurerm" {
subscription_id = "4c532d7a-ab03-4249-b257-67f510c22431"
   
 client_id       = "63c246df-a1c6-4141-9367-7a251cdb1094"
   
 client_secret   = "Z6Knb0c_uRkRhd-Sw]sN45ij@HFEFX51"
  
 tenant_id       = "93f33571-550f-43cf-b09f-cd331338d086"

}

resource "azurerm_resource_group" "test" {
  name     = "acctestrg1"
  location = "West US 2"
}

resource "azurerm_virtual_network" "test" {
  name                = "acctvnn1"
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
    domain_name_label            = "terraformmyvm"
}
# Create Network Security Group and rule
resource "azurerm_network_security_group" "test" {
    name                = "myNetworkSecurityGroup"
    location            = "${azurerm_resource_group.test.location}"
    resource_group_name = "${azurerm_resource_group.test.name}"

    security_rule {
        name                       = "SSH"
        priority                   = 1001
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "22"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
        security_rule {
        name                       = "http"
        priority                   = 1002
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "8080"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
	security_rule {
        name                       = "httpp"
        priority                   = 1003
        direction                  = "Inbound"
        access                     = "Allow"
        protocol                   = "Tcp"
        source_port_range          = "*"
        destination_port_range     = "8081"
        source_address_prefix      = "*"
        destination_address_prefix = "*"
    }
	
}



resource "azurerm_network_interface" "test" {
  name                = "acctni"
  location            = "${azurerm_resource_group.test.location}"
  resource_group_name = "${azurerm_resource_group.test.name}"
  network_security_group_id = "${azurerm_network_security_group.test.id}" 

  ip_configuration {
    name                          = "testconfiguration1"
    subnet_id                     = "${azurerm_subnet.test.id}"
    private_ip_address_allocation = "dynamic"
    public_ip_address_id          = "${azurerm_public_ip.test.id}"
  }
 depends_on = ["azurerm_network_security_group.test"] 
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
  name                  = "acctvmm"
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
        key_data = "ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAABAQCnxUsNC4tSb1U4V8VajM23S9H/EaE887tVkLm9fsv4oeaRNP6xV/lXflIXZd1oe8N2KO/fBMXzBBaT7ROEayDw1qIQI9N4OXSOOTQLhnkmz84vJc86z2soO9etAOHtrmG3tKCRXl+5hsahkPXH25+4bCl85OW2WB/gdvBfbYdrtD6+JnkGIORHxBL5191hw+B4vCPxYcdhgh70kRmSjhdC/Fi1D+bkl4uA9G0gryD6AHV6Bbr/Ja7uYKlrzm0PoD9nPs/6eWSxY31woIq43zw5lgJLUlxycgdRB96d7B6biGHuGrkKWdiVfk8KlpRzTshSkY6TaLrb7U4GYFYcsStv jenkins@jenkins"
      }]
  }
	
  tags {
    environment = "staging"
  }
}
resource "azurerm_virtual_machine_extension" "test" {
  name                 = "jenkins"
  location             = "${azurerm_resource_group.test.location}"
  resource_group_name  = "${azurerm_resource_group.test.name}"
  virtual_machine_name = "${azurerm_virtual_machine.test.name}"
  publisher            = "Microsoft.OSTCExtensions"
  type                 = "CustomScriptForLinux"
  type_handler_version = "1.2"

  settings = <<SETTINGS
    {
        "fileUris": ["https://raw.github.com/95pawan/docker/master/docker_install.sh"],
          "commandToExecute": "sh docker_install.sh"
	
		  
    }
SETTINGS
tags {
    environment = "Production"
  }
}

