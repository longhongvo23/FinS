# ============================================================================
# Terraform Variables for FinS Infrastructure
# ============================================================================

# ============================================================================
# General Configuration
# ============================================================================
variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"
  
  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod."
  }
}

variable "location" {
  description = "Azure region for resources"
  type        = string
  default     = "Southeast Asia"
}

variable "project_name" {
  description = "Project name used as prefix for all resources"
  type        = string
  default     = "fins"
}

# ============================================================================
# AKS Configuration
# ============================================================================
variable "aks_node_count" {
  description = "Number of nodes in AKS cluster"
  type        = number
  default     = 3
}

variable "aks_vm_size" {
  description = "VM size for AKS nodes"
  type        = string
  default     = "Standard_D2s_v3"
}

variable "aks_min_nodes" {
  description = "Minimum number of nodes for autoscaling"
  type        = number
  default     = 2
}

variable "aks_max_nodes" {
  description = "Maximum number of nodes for autoscaling"
  type        = number
  default     = 5
}

# ============================================================================
# MongoDB Configuration
# ============================================================================
variable "mongodb_throughput" {
  description = "MongoDB throughput (RU/s) - only for provisioned throughput"
  type        = number
  default     = 400
}

# ============================================================================
# Tags
# ============================================================================
variable "tags" {
  description = "Additional tags for all resources"
  type        = map(string)
  default     = {}
}
