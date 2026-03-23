# Toets Service

### Local Development Guide

#### Prerequisites

- Docker Tooling _(recommended / required)_
    - Check the [Docker docs](https://docs.docker.com/get-started/) for your [OS](https://en.wikipedia.org/wiki/Operating_system)'s best Docker setup
- [Unix-like OS](https://en.wikipedia.org/wiki/Unix-like) _(recommended / required)_
    - if you're on Windows, consider using [WSL](https://learn.microsoft.com/en-us/windows/wsl/install)
- [Source Code Editor](https://en.wikipedia.org/wiki/Source-code_editor) or [IDE](https://en.wikipedia.org/wiki/Integrated_development_environment) _(recommended)_
    - [VSCode (free)](https://code.visualstudio.com/) or [PHPStorm (paid)](https://www.jetbrains.com/phpstorm/) are both good choices

---

#### Quickstart

Start your Docker setup

Open a [terminal emulator](https://en.wikipedia.org/wiki/Terminal_emulator) and make sure you're in the root of the project:

```bash
# "print working directory" — confirm you're in the right directory before running anything
pwd
```

```bash
# Copy the example environment config to create your local .env file
cp .env.example .env

# Install PHP (Composer) dependencies without needing PHP installed locally
docker run --rm -u $(id -u):$(id -g) -v $(pwd):/app -w /app composer:2.9.5 install

# Start all Docker containers in the background (-d = "detached" mode)
./vendor/bin/sail up -d

# Generate a unique encryption key for your local app (stored in .env as APP_KEY)
./vendor/bin/sail artisan key:generate

# Install Node.js dependencies (needed for the frontend/Vite)
./vendor/bin/sail npm install
```

```bash
# MySQL takes a few seconds to initialise. You can check if it's ready by running:
curl http://localhost:3306
# If you see: curl: (1) Received HTTP/0.9 when not allowed  =>  MySQL is up and ready!
# If you see something else, wait a few more seconds and try again.
```

```bash
# Run database migrations (creates/updates your local DB tables)
./vendor/bin/sail artisan migrate

# Run seeders (creates fake data for local testing / development)
./vendor/bin/sail artisan db:seed

# Start the Vite dev server for hot-reloading frontend assets
./vendor/bin/sail npm run dev
```

---

#### Cleanup commands

- Stop Vite:
  Press `Ctrl + C` in the terminal running Vite
- Stop Sail:
    ```bash
    # Stops all running containers, but keeps them (and your data) intact
    ./vendor/bin/sail stop
    ```
- Remove containers & networks:
    ```bash
    # Removes containers and networks (your database volume is kept by default)
    ./vendor/bin/sail down
    ```
    To also remove volumes use `down -v` (In layman's terms: it removes local database data) [Docker docs for volumes](https://docs.docker.com/engine/storage/volumes/)

---

### Tips

#### Test users

After running the seeders you should have some test users you can log in as using these credentials:

**Admin**

- Email: `beheerder@roca12.nl`
- Password: `B3he3rd3r@r0ca!2`

**Teacher**

- Email: `docent@roca12.nl`
- Password: `D0c3nt@r0ca!2`

**Student**

- Email: `student@st.roc.a12.nl`
- Password: `Stud3nt@r0ca!`

#### Laravel Sail

Some services are accessible in your browser via `localhost:{port}`. To see which ports are being used, check the `compose.yaml` file in the codebase's root. Keep in mind that not all services (such as MySQL) are intended to be accessed through a browser.

#### Merging code

Before creating a pull request on your Git platform of choice, make sure your code passes formatting and linting checks. Run the following commands:

```bash
./vendor/bin/sail npm run format && npm run lint
./vendor/bin/sail pint
./vendor/bin/sail artisan test
```

Or run `npm run pre-commit`

#### Best Practices

This Starterkit uses the Laravel React Starterkit, which follows consistent conventions.

Take the [confirm-password.tsx](./resources/js/pages/auth/confirm-password.tsx) file as an example. The **file name uses kebab-case**, while the **function name uses PascalCase**. This convention is applied to all `.tsx` files in the project.

Before creating a new file, check if a similar one exists and use it as a reference to follow established best practices.

#### Creating tests for code

This Starterkit uses [Pest](https://pestphp.com/) for testing.

**Test structure:**

- Feature tests: `tests/Feature/`
- Unit tests: `tests/Unit/`

**Create a new test:**

```bash
# Create a feature test
./vendor/bin/sail artisan make:test --pest Feature/MyTest

# Create a unit test
./vendor/bin/sail artisan make:test --pest Unit/MyTest
```

**Run tests:**

```bash
# Run all tests
./vendor/bin/sail artisan test

# Run a specific test file
./vendor/bin/sail artisan test tests/Feature/DashboardTest.php

# Run tests matching a name
./vendor/bin/sail artisan test --filter=dashboard
```

**Test conventions:**

- File names: `PascalCaseTest.php`
- Test names: `snake_case` (e.g., `test('users_can_login')`)
- Use `assertSuccessful()` instead of `assertStatus(200)`

## debug tools

### laradumps

nice debugging application for php and js. More documentation can be found here [laradumps](https://laradumps.dev/)
if laradumps doesnt work open te port 9191 in your firewall
- linux firewall: `sudo ufw allow 9191`

on arch linux dont use the snap package of laradumps but the appimage instead
