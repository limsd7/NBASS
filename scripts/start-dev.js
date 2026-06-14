const net = require('net');
const { spawn } = require('child_process');
const path = require('path');

// Function to find an available port based on a starting port
function findAvailablePort(startPort) {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.listen(startPort, () => {
            const { port } = server.address();
            server.close(() => resolve(port));
        });
        server.on('error', (err) => {
            if (err.code === 'EADDRINUSE') {
                resolve(findAvailablePort(startPort + 1));
            } else {
                reject(err);
            }
        });
    });
}

// Main execution function
async function startDev() {
    try {
        const port = await findAvailablePort(3000); // Start checking from port 3000
        console.log(`Starting application on port: ${port}`);

        // Set environment variable for the port
        process.env.PORT = port;

        // Command to run Vite in development mode on the specific port
        // "cross-env BROWSER=none npm run dev" logic adapted
        // Note: We pass the port to Vite via env var which vite.config.ts should read, or command line arg
        const viteProcess = spawn('npm', ['run', 'dev', '--', '--port', port, '--strictPort', 'false'], {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env, BROWSER: 'none', PORT: port }
        });

        // Wait for the server to be ready before starting Electron
        // We use wait-on logic programmatically or just simplified delay/retry logic
        // But since we are replacing the "concurrently" script, we can use the same approach of firing both
        // However, wait-on is handy. Let's keep the structure similar to the original package.json command but dynamically set the port.

        // Original: concurrently -k "cross-env BROWSER=none npm run dev" "wait-on tcp:3000 && cross-env ELECTRON_START_URL=http://localhost:3000 electron ."

        // We can run 'concurrently' itself since it's a devDependency.
        const concurrently = path.resolve(__dirname, '../node_modules/.bin/concurrently');

        // Construct the command strings
        // 1. Vite Server
        const viteCmd = `cross-env BROWSER=none npm run dev -- --port ${port}`;

        // 2. Electron App
        // Needs to wait for the specific port
        const electronCmd = `wait-on tcp:${port} && cross-env ELECTRON_START_URL=http://localhost:${port} electron .`;

        // 0. Use concurrently from node_modules or npx. Since it's in scripts, we can just call it if in PATH, or use npx.
        // Simpler to just use spawn with shell checks if concurrently is globally available or in node_modules/.bin
        // Let's assume npm scripts context puts node_modules/.bin in path.

        const args = [
            '-k',
            `"${viteCmd}"`,
            `"${electronCmd}"`
        ];

        console.log(`Executing: concurrently ${args.join(' ')}`);

        const child = spawn('concurrently', args, {
            stdio: 'inherit',
            shell: true,
            env: { ...process.env }
        });

        child.on('close', (code) => {
            process.exit(code);
        });

    } catch (err) {
        console.error('Failed to start development server:', err);
        process.exit(1);
    }
}

startDev();
