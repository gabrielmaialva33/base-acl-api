CREATE DATABASE base_acl_db;
CREATE DATABASE base_acl_db_development;
CREATE DATABASE base_acl_db_testing;

GRANT ALL PRIVILEGES ON DATABASE base_acl_db TO postgres;
GRANT ALL PRIVILEGES ON DATABASE base_acl_db_development TO postgres;
GRANT ALL PRIVILEGES ON DATABASE base_acl_db_testing TO postgres;
