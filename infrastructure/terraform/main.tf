# ============================================================================
# Terraform Configuration for FinS Infrastructure on Azure
# Infrastructure as Code (IaC) for DevSecOps
# ============================================================================

terraform {
  required_version = ">= 1.5.0"
  
  required_providers {
    azurerm = {
      source  = "hashicorp/azurerm"
      version = "~> 3.80"
    }
    random = {
      source  = "hashicorp/random"
      version = "~> 3.5"
    }
  }

  # Remote state storage (uncomment for production)
  # backend "azurerm" {
  #   resource_group_name  = "fins-terraform-state"
  #   storage_account_name = "finstfstate"
  #   container_name       = "tfstate"
  #   key                  = "prod.terraform.tfstate"
  # }
}

provider "azurerm" {
  features {
    key_vault {
      purge_soft_delete_on_destroy = true
    }
  }
}

# ============================================================================
# Variables
# ============================================================================
variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "location" {
  description = "Azure region"
  type        = string
  default     = "Southeast Asia"
}

variable "project_name" {
  description = "Project name prefix"
  type        = string
  default     = "fins"
}

# ============================================================================
# Resource Group
# ============================================================================
resource "azurerm_resource_group" "main" {
  name     = "rg-${var.project_name}-${var.environment}"
  location = var.location

  tags = {
    Environment = var.environment
    Project     = var.project_name
    ManagedBy   = "Terraform"
  }
}

# ============================================================================
# Virtual Network & Subnets
# ============================================================================
resource "azurerm_virtual_network" "main" {
  name                = "vnet-${var.project_name}-${var.environment}"
  address_space       = ["10.0.0.0/16"]
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
}

resource "azurerm_subnet" "aks" {
  name                 = "snet-aks"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.1.0/24"]
}

resource "azurerm_subnet" "mongodb" {
  name                 = "snet-mongodb"
  resource_group_name  = azurerm_resource_group.main.name
  virtual_network_name = azurerm_virtual_network.main.name
  address_prefixes     = ["10.0.2.0/24"]
  service_endpoints    = ["Microsoft.Storage"]
}

# ============================================================================
# Azure Container Registry
# ============================================================================
resource "azurerm_container_registry" "main" {
  name                = "${var.project_name}${var.environment}acr"
  resource_group_name = azurerm_resource_group.main.name
  location            = azurerm_resource_group.main.location
  sku                 = "Standard"
  admin_enabled       = false

  # Security: Enable content trust for image signing
  trust_policy {
    enabled = true
  }

  # Security: Retention policy
  retention_policy {
    days    = 30
    enabled = true
  }
}

# ============================================================================
# Azure Kubernetes Service (AKS)
# ============================================================================
resource "azurerm_kubernetes_cluster" "main" {
  name                = "aks-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  dns_prefix          = "${var.project_name}-${var.environment}"

  default_node_pool {
    name                = "default"
    node_count          = 3
    vm_size             = "Standard_D2s_v3"
    vnet_subnet_id      = azurerm_subnet.aks.id
    enable_auto_scaling = true
    min_count           = 2
    max_count           = 5
    
    # Security: Enable encryption at host
    enable_host_encryption = true
  }

  identity {
    type = "SystemAssigned"
  }

  # Security: Enable Azure Policy
  azure_policy_enabled = true

  # Security: Enable Defender
  microsoft_defender {
    log_analytics_workspace_id = azurerm_log_analytics_workspace.main.id
  }

  # Network configuration
  network_profile {
    network_plugin    = "azure"
    network_policy    = "calico"  # Security: Enable network policies
    load_balancer_sku = "standard"
  }

  # Security: Enable RBAC
  role_based_access_control_enabled = true
  
  azure_active_directory_role_based_access_control {
    managed            = true
    azure_rbac_enabled = true
  }

  # Security: Enable secrets encryption
  key_management_service {
    key_vault_key_id = azurerm_key_vault_key.aks.id
  }

  tags = {
    Environment = var.environment
    Project     = var.project_name
  }
}

# ============================================================================
# Azure Key Vault (for secrets management)
# ============================================================================
resource "random_string" "kv_suffix" {
  length  = 4
  special = false
  upper   = false
}

resource "azurerm_key_vault" "main" {
  name                = "kv-${var.project_name}-${random_string.kv_suffix.result}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  tenant_id           = data.azurerm_client_config.current.tenant_id
  sku_name            = "standard"

  # Security: Enable purge protection
  purge_protection_enabled   = true
  soft_delete_retention_days = 30

  # Security: Enable RBAC authorization
  enable_rbac_authorization = true

  network_acls {
    default_action = "Deny"
    bypass         = "AzureServices"
  }
}

resource "azurerm_key_vault_key" "aks" {
  name         = "aks-encryption-key"
  key_vault_id = azurerm_key_vault.main.id
  key_type     = "RSA"
  key_size     = 2048

  key_opts = [
    "decrypt",
    "encrypt",
    "wrapKey",
    "unwrapKey",
  ]
}

# ============================================================================
# Log Analytics Workspace (for monitoring)
# ============================================================================
resource "azurerm_log_analytics_workspace" "main" {
  name                = "log-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  sku                 = "PerGB2018"
  retention_in_days   = 30
}

# ============================================================================
# Azure Cosmos DB for MongoDB (Production Database)
# ============================================================================
resource "azurerm_cosmosdb_account" "mongodb" {
  name                = "cosmos-${var.project_name}-${var.environment}"
  location            = azurerm_resource_group.main.location
  resource_group_name = azurerm_resource_group.main.name
  offer_type          = "Standard"
  kind                = "MongoDB"

  # Security: Enable automatic failover
  enable_automatic_failover = true

  # Security: Disable public network access
  public_network_access_enabled = false

  # Security: Enable encryption
  key_vault_key_id = azurerm_key_vault_key.cosmos.id

  capabilities {
    name = "EnableMongo"
  }

  capabilities {
    name = "EnableServerless"
  }

  consistency_policy {
    consistency_level = "Session"
  }

  geo_location {
    location          = var.location
    failover_priority = 0
  }

  # Security: Virtual network integration
  virtual_network_rule {
    id = azurerm_subnet.mongodb.id
  }
}

resource "azurerm_key_vault_key" "cosmos" {
  name         = "cosmos-encryption-key"
  key_vault_id = azurerm_key_vault.main.id
  key_type     = "RSA"
  key_size     = 2048

  key_opts = [
    "decrypt",
    "encrypt",
    "wrapKey",
    "unwrapKey",
  ]
}

# ============================================================================
# Data Sources
# ============================================================================
data "azurerm_client_config" "current" {}

# ============================================================================
# Outputs
# ============================================================================
output "resource_group_name" {
  value = azurerm_resource_group.main.name
}

output "aks_cluster_name" {
  value = azurerm_kubernetes_cluster.main.name
}

output "acr_login_server" {
  value = azurerm_container_registry.main.login_server
}

output "key_vault_uri" {
  value = azurerm_key_vault.main.vault_uri
}

output "cosmosdb_connection_string" {
  value     = azurerm_cosmosdb_account.mongodb.connection_strings[0]
  sensitive = true
}
