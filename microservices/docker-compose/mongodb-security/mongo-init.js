// ============================================================================
// FinS MongoDB Initialization Script
// Creates databases and users for all microservices
// Credentials match .env file
// ============================================================================

db = db.getSiblingDB('admin');

// Create users for all services - credentials match .env file
const services = [
    { db: 'gateway', user: 'gatewaylong', password: 'gateway26012003' },
    { db: 'userservice', user: 'userservicelong', password: 'userservice26012003' },
    { db: 'stockservice', user: 'stockservicelong', password: 'stockservice26012003' },
    { db: 'newsservice', user: 'newsservicelong', password: 'newsservice26012003' },
    { db: 'notificationservice', user: 'notificationservicelong', password: 'notificationservice26012003' },
    { db: 'crawlservice', user: 'crawlservicelong', password: 'crawlservice26012003' },
    { db: 'aitoolsservice', user: 'aitoolsservicelong', password: 'aitoolsservice26012003' },
    { db: 'aiservice', user: 'aitoolsservicelong', password: 'aitoolsservice26012003' }
];

print('============================================================');
print('Starting FinS MongoDB Initialization...');
print('============================================================');

services.forEach(function (service) {
    // Switch to admin db
    db = db.getSiblingDB('admin');

    // Check if user exists
    var existingUser = db.getUser(service.user);

    if (!existingUser) {
        db.createUser({
            user: service.user,
            pwd: service.password,
            roles: [
                { role: 'readWrite', db: service.db },
                { role: 'dbAdmin', db: service.db }
            ]
        });
        print('✅ Created user: ' + service.user + ' for database: ' + service.db);
    } else {
        print('⚠️ User already exists: ' + service.user);
    }

    // Ensure database exists by creating init collection
    var targetDb = db.getSiblingDB(service.db);
    targetDb.createCollection('_init');
});

print('============================================================');
print('✅ FinS MongoDB Initialization Complete!');
print('============================================================');
