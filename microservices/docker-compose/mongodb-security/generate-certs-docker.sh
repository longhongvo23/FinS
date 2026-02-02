#!/bin/sh
# Generate MongoDB TLS Certificates using OpenSSL in Docker

cd /certs

# Configuration
DAYS=3650
COUNTRY="VN"
STATE="HoChiMinh"
CITY="HoChiMinh"
ORG="StockApp"
OU="Security"

# MongoDB services
SERVICES="gateway userservice notificationservice stockservice newsservice crawlservice aitoolsservice"

echo "=========================================="
echo "MongoDB TLS Certificate Generator"
echo "=========================================="

# Step 1: Generate CA
echo ""
echo "[1/3] Generating Certificate Authority (CA)..."
openssl genrsa -out ca.key 4096
openssl req -x509 -new -nodes -key ca.key -sha256 -days $DAYS -out ca.crt \
    -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=StockApp-MongoDB-CA"
echo "   ✓ CA certificate created"

# Step 2: Generate server certificates for each MongoDB
echo ""
echo "[2/3] Generating server certificates..."

for SERVICE in $SERVICES; do
    MONGO_HOST="${SERVICE}-mongodb"
    echo "   → Generating certificate for $MONGO_HOST..."
    
    # Generate private key
    openssl genrsa -out ${MONGO_HOST}.key 2048
    
    # Create CSR
    openssl req -new -key ${MONGO_HOST}.key -out ${MONGO_HOST}.csr \
        -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/OU=$OU/CN=$MONGO_HOST"
    
    # Create extension file for SAN
    cat > ${MONGO_HOST}.ext << EOF
authorityKeyIdentifier=keyid,issuer
basicConstraints=CA:FALSE
keyUsage = digitalSignature, nonRepudiation, keyEncipherment, dataEncipherment
subjectAltName = @alt_names

[alt_names]
DNS.1 = $MONGO_HOST
DNS.2 = localhost
IP.1 = 127.0.0.1
EOF
    
    # Sign with CA
    openssl x509 -req -in ${MONGO_HOST}.csr -CA ca.crt -CAkey ca.key \
        -CAcreateserial -out ${MONGO_HOST}.crt -days $DAYS -sha256 -extfile ${MONGO_HOST}.ext
    
    # Create PEM file (key + cert combined) for MongoDB
    cat ${MONGO_HOST}.key ${MONGO_HOST}.crt > ${MONGO_HOST}.pem
    chmod 600 ${MONGO_HOST}.pem
    
    # Cleanup
    rm -f ${MONGO_HOST}.csr ${MONGO_HOST}.ext
    
    echo "   ✓ ${MONGO_HOST} certificate created"
done

# Step 3: Generate Java truststore
echo ""
echo "[3/3] Generating Java truststore..."

# Create PKCS12 truststore with CA cert
openssl pkcs12 -export -in ca.crt -nokeys -out truststore.p12 -passout pass:changeit -name mongodb-ca

# Create PEM bundle for Java
cat ca.crt > ca-bundle.pem

echo "   ✓ Java truststore created (truststore.p12)"

# Summary
echo ""
echo "=========================================="
echo "✓ All certificates generated successfully!"
echo "=========================================="
echo ""
echo "Files created:"
ls -la
