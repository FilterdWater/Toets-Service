# Toets Service

### Deployment Guide

This guide explains how to deploy this application using a Coolify instance. It assumes you can run all the resources on the same VPS, hardware, etc.

#### Prerequisites

- A running and online-accessible Coolify instance (use the [Coolify Setup Guide](./coolify-setup-guide.md) if you don't have access to one).

#### Git providers

If you're using GitHub setup a GitHub App using Coolify ([link to the docs](https://coolify.io/docs/applications/ci-cd/github/setup-app))

If you're not using GitHub, take a look at [these docs](https://coolify.io/docs/applications/ci-cd/other-providers#private-repositories) instead

#### Create a project & resources

Go to the projects page, the link / button for which should be in the left sidebar. Create a new project => Create a new Git Based resource => Select your server (this step is available only if you have more than one server setup) => Configure the resource to use port 80. the rest of the options should be fine so click continue.

You should see some fields with long gibberish values, you don't need to update these per se but I suggest you do for your own future selfs oversight.

Scroll down to the Post-deployment field and type `php artisan migrate --force` into said field. After that navigate to the Environment Variables page, press the developer view button and just copy the variables from the **Required Environment Variables** below into the **Production Environment Variables** field.

Reminder that the env variables with a value of **...** should be filled in with new values. You need to create a database before you can do that though so maybe scroll down first.

#### Required Environment Variables

```bash
# Controls whether detailed error messages and stack traces are shown (true for development, false for production).
APP_DEBUG=false

# Defines the application environment (local, development, production, etc.).
APP_ENV=production

# Locale used by Faker for generating fake data (e.g., test seeds).
APP_FAKER_LOCALE=en_US

# Fallback language if the requested locale is not available.
APP_FALLBACK_LOCALE=en

# Encryption key used for securing sessions, cookies, and other encrypted data (run `php artisan key:generate` locally and copy the key).
APP_KEY=...

# Default application language/locale.
APP_LOCALE=en

# Driver used to manage maintenance mode (file, database, etc.).
APP_MAINTENANCE_DRIVER=file

# The name of the application, used in notifications and UI.
APP_NAME=...

# Base URL of the application, used for generating links.
APP_URL=...

# Base URL for serving assets (CSS, JS, images).
ASSET_URL=${APP_URL}

# Number of rounds for bcrypt password hashing (higher = more secure but slower).
BCRYPT_ROUNDS=12

# Default broadcasting driver (log, pusher, redis, etc.).
BROADCAST_CONNECTION=log

# Database driver (mysql, pgsql, sqlite, sqlsrv).
DB_CONNECTION=mysql

# Name of the database to connect to (Initial Database field in Coolify).
DB_DATABASE=...

# Hostname or container name of the database server.
DB_HOST=...

# Password for the database user.
DB_PASSWORD=...

# Port for the database connection (default MySQL port).
DB_PORT=3306

# Username for the database connection.
DB_USERNAME=...

# Default filesystem disk (local, s3, etc.).
FILESYSTEM_DISK=local

# Default logging channel (stack combines multiple channels).
LOG_CHANNEL=stack

# Channel for logging deprecation warnings (null disables).
LOG_DEPRECATIONS_CHANNEL=null

# Minimum log level (debug, info, warning, error).
LOG_LEVEL=debug

# Defines how logs are stacked (single file, daily, etc.).
LOG_STACK=single

# Node.js version used in the build environment (for frontend assets).
NIXPACKS_NODE_VERSION=22

# Fallback path for PHP requests in deployment.
NIXPACKS_PHP_FALLBACK_PATH=/index.php

# Root directory for PHP application files.
NIXPACKS_PHP_ROOT_DIR=/app/public

# Queue driver (sync, database, redis, etc.).
QUEUE_CONNECTION=database

# Domain for session cookies (null = default domain).
SESSION_DOMAIN=null

# Session storage driver (file, cookie, database, redis).
SESSION_DRIVER=database

# Whether session data should be encrypted.
SESSION_ENCRYPT=false

# Session lifetime in minutes.
SESSION_LIFETIME=120

# Path for session cookies.
SESSION_PATH=/

# Application name exposed to Vite frontend build.
VITE_APP_NAME=${APP_NAME}
```

#### Creating a database

This project uses MySQL and luckily creating a MySQL database using Coolify is just pressing a button in the create a resource page. After you've pressed said button I again suggest updating the gibberish values found on the general page and persistent storage page.

#### Finding Your Database Credentials

After creating a MySQL database in Coolify, you will see a field labeled **“MySQL URL (internal)”**.
This contains all the connection details you need

It will look similar to:

```txt
mysql://<username>:<password>@<container-name>:<port>/<initial_database_name>
```

Use these values to fill in the env variables:

- DB_HOST
- DB_USERNAME
- DB_PASSWORD

#### Choosing a Database User

Coolifys MySQL provides two users by default:

##### mysql

- More secure and appropriate for production

##### root

- Full administrative permissions
- Not recommended for production use

You can use either, but for production always use the **mysql** user
