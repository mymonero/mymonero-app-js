#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function transpileDirectory(dir, output) {
  try {
    if (!fs.existsSync(dir)) {
      console.log(`Directory ${dir} does not exist, skipping...`);
      return;
    }

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js'));
    if (files.length === 0) {
      console.log(`No .js files found in ${dir}, skipping...`);
      return;
    }

    const inputFiles = files.map(f => path.join(dir, f)).join(' ');
    const cmd = `npx rollup ${inputFiles} -d "${output}" -f cjs`;
    
    console.log(`Transpiling ${dir}...`);
    execSync(cmd, { stdio: 'inherit', shell: true });
  } catch (error) {
    console.warn(`Warning: Failed to transpile ${dir}: ${error.message}`);
  }
}

console.log('Transpiling lit modules to CommonJS...');

transpileDirectory('node_modules/lit', 'node_modules/lit');
transpileDirectory('node_modules/lit/node_modules/lit-html', 'node_modules/lit/node_modules/lit-html');
transpileDirectory('node_modules/lit/directives', 'node_modules/lit/directives');
transpileDirectory('node_modules/lit-html/directives', 'node_modules/lit-html/directives');
transpileDirectory('node_modules/@lit/reactive-element', 'node_modules/@lit/reactive-element');
transpileDirectory('node_modules/lit-element', 'node_modules/lit-element');
transpileDirectory('node_modules/lit-element/node_modules/lit-html', 'node_modules/lit-element/node_modules/lit-html');

console.log('Transpilation complete!');
