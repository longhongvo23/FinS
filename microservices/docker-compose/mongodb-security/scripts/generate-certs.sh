#!/bin/bash
# =============================================================================
# MongoDB TLS Certificate Generator
# Generates CA and server certificates for MongoDB TLS encryption
# =============================================================================

set -e

CERTS_DIR="$(dirname "$0")/../certs"
mkdir -p "$CERTS_DIR"
cd "$CERTS_DIR"

# Configuration
DAYS_VALID=3650  # 10 years
COUNTRY="VN"
STATE="HoChiMinh"
CITY="HoChiMinh"
ORGANIZATION="StockApp"
OU="Security"

echo "=========================================="
echo "MongoDB TLS Certificate Generator"
echo "=========================================="

# List of MongoDB services
SERVICES=("gateway" "userservice" "notificationservice" "stockservice" "newsservice" "crawlservice" "aitoolsservice")

# =============================================================================
# Step 1: Generate Certificate Authority (CA)
# =============================================================================
echo ""
echo "[1/3] Generating Certificate Authority (CA)..."

if [ ! -f ca.key ]; then
    # Generate CA private key
    openssl genrsa -out ca.key 4096
    
    # Generate CA certificate
    openssl req -x509 -new -nodes \
        -key ca.key \
        -sha256 \
        -days $DAYS_VALID \
        -out ca.crt \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$OU/CN=StockApp-MongoDB-CA"
    
    echo "   ✓ CA certificate created: ca.crt"
else
    echo "   ✓ CA already exists, skipping..."
fi

# =============================================================================
# Step 2: Generate Server Certificates for each MongoDB instance
# =============================================================================
echo ""
echo "[2/3] Generating server certificates..."

for SERVICE in "${SERVICES[@]}"; do
    MONGO_HOST="${SERVICE}-mongodb"
    CERT_PREFIX="${SERVICE}-mongodb"
    
    echo "   → Generating certificate for $MONGO_HOST..."
    
    # Generate private key
    openssl genrsa -out ${CERT_PREFIX}.key 2048
    
    # Create certificate signing request (CSR)
    openssl req -new \
        -key ${CERT_PREFIX}.key \
        -out ${CERT_PREFIX}.csr \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$OU/CN=$MONGO_HOST"
    
    # Create extension file for SAN (Subject Alternative Names)
    cat > ${CERT_PREFIX}.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $MONGO_HOST
DNS.2 = localhost
DNS.3 = 127.0.0.1
IP.1 = 127.0.0.1
EOF
    
    # Sign the certificate with CA
    openssl x509 -req \
        -in ${CERT_PREFIX}.csr \
        -CA ca.crt \
        -CAkey ca.key \
        -CAcreateserial \
        -out ${CERT_PREFIX}.crt \
        -days $DAYS_VALID \
        -sha256 \
        -extfile ${CERT_PREFIX}.ext
    
    # Create PEM file (combined key + cert) required by MongoDB
    cat ${CERT_PREFIX}.key ${CERT_PREFIX}.crt > ${CERT_PREFIX}.pem
    
    # Cleanup CSR and ext files
    rm -f ${CERT_PREFIX}.csr ${CERT_PREFIX}.ext
    
    echo "   ✓ Certificate created: ${CERT_PREFIX}.pem"
done

# =============================================================================
# Step 3: Generate Client Certificates for Java services
# =============================================================================
echo ""
echo "[3/3] Generating client certificates..."

for SERVICE in "${SERVICES[@]}"; do
    CLIENT_PREFIX="${SERVICE}-client"
    
    echo "   → Generating client certificate for $SERVICE..."
    
    # Generate private key
    openssl genrsa -out ${CLIENT_PREFIX}.key 2048
    
    # Create certificate signing request
    openssl req -new \
        -key ${CLIENT_PREFIX}.key \
        -out ${CLIENT_PREFIX}.csr \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORGANIZATION/OU=$OU/CN=${SERVICE}"
    
    # Sign with CA
    openssl x509 -req \
        -in ${CLIENT_PREFIX}.csr \
        -CA ca.crt \
        -CAkey ca.key \
        -CAcreateserial \
        -out ${CLIENT_PREFIX}.crt \
        -days $DAYS_VALID \
        -sha256
    
    # Create PEM file
    cat ${CLIENT_PREFIX}.key ${CLIENT_PREFIX}.crt > ${CLIENT_PREFIX}.pem
    
    # Cleanup
    rm -f ${CLIENT_PREFIX}.csr
    
    echo "   ✓ Client certificate created: ${CLIENT_PREFIX}.pem"
done

# =============================================================================
# Set proper permissions
# =============================================================================
echo ""
echo "Setting file permissions..."
chmod 600 *.key
chmod 644 *.crt *.pem ca.crt

# =============================================================================
# Create Java truststore and keystores
# =============================================================================
echo ""
echo "Creating Java truststore..."

# Remove existing truststore
rm -f truststore.jks

# Import CA certificate into truststore
keytool -import -trustcacerts \
    -alias mongodb-ca \
    -file ca.crt \
    -keystore truststore.jks \
    -storepass changeit \
    -noprompt

echo "   ✓ Java truststore created: truststore.jks"

# =============================================================================
# Summary
# =============================================================================
echo ""
echo "=========================================="
echo "Certificate Generation Complete!"
echo "=========================================="
echo ""
echo "Generated files:"
echo "  - ca.crt (Certificate Authority)"
echo "  - ca.key (CA Private Key - KEEP SECRET!)"
echo "  - *-mongodb.pem (MongoDB server certificates)"
echo "  - *-client.pem (Client certificates)"
echo "  - truststore.jks (Java truststore)"
echo ""
echo "Next steps:"
echo "  1. Update docker-compose.yml to mount certificates"
echo "  2. Configure MongoDB to use TLS"
echo "  3. Update Spring Boot connection strings"
echo ""
