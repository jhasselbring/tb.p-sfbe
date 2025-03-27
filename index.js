#!/usr/bin/env node

const path = require('path');
const chalk = require('chalk');
const fs = require('fs');
const argv = require('minimist')(process.argv.slice(2), {
    alias: {
        t: 'target',
        d: 'directory'
    },
    default: {
        target: process.cwd()
    }
});

// Convert target to absolute path if it's not already
const targetDir = path.resolve(argv.target || argv.directory || process.cwd());

// Get the parent directory of the target
const baseDir = path.dirname(targetDir);

// Get the name of the target directory and create the result directory path
const targetDirName = path.basename(targetDir);
const resultDir = path.join(baseDir, `@sfbe_${targetDirName}`);

// Function to recursively process directories
function processDirectory(currentPath, relativePath = '') {
    const entries = fs.readdirSync(currentPath, { withFileTypes: true });

    entries.forEach(entry => {
        const fullPath = path.join(currentPath, entry.name);
        const relativeToTarget = path.join(relativePath, entry.name);

        if (entry.isDirectory()) {
            processDirectory(fullPath, relativeToTarget);
        } else {
            // Get file extension (default to 'no-extension' if none exists)
            const ext = path.extname(entry.name).slice(1) || 'no-extension';
            
            // Create the destination directory structure
            const destDir = path.join(resultDir, ext, path.dirname(relativeToTarget));
            fs.mkdirSync(destDir, { recursive: true });

            // Move the file
            const destPath = path.join(destDir, entry.name);
            fs.renameSync(fullPath, destPath);
            
            console.log(chalk.green(`Moved: ${chalk.blue(relativeToTarget)} → ${chalk.yellow(ext)}/${chalk.blue(relativeToTarget)}`));
        }
    });
}

// Create the result directory
fs.mkdirSync(resultDir, { recursive: true });

// Start processing
console.log(chalk.cyan(`Starting to process files from ${targetDir}`));
processDirectory(targetDir);
console.log(chalk.cyan('Processing complete!'));

