#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { cp, mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';

const BASE_HREF = '/';
const DIST_DIR = join(process.cwd(), 'dist', 'setaei', 'browser');
const DOCS_DIR = join(process.cwd(), 'docs');
const CNAME_DOMAIN = 'tall.setaei.com';

async function runNgBuild() {
  await new Promise((resolve, reject) => {
    const child = spawn('npx', ['ng', 'build', `--base-href=${BASE_HREF}`], {
      stdio: 'inherit',
      shell: process.platform === 'win32',
    });

    child.on('close', (code) => {
      if (code !== 0) {
        reject(new Error(`ng build failed with exit code ${code}`));
      } else {
        resolve();
      }
    });

    child.on('error', reject);
  });
}

async function copyDistToDocs() {
  await rm(DOCS_DIR, { recursive: true, force: true });
  await mkdir(DOCS_DIR, { recursive: true });
  await cp(DIST_DIR, DOCS_DIR, { recursive: true });
}

async function createNotFoundPage() {
  await cp(join(DIST_DIR, 'index.html'), join(DOCS_DIR, '404.html'));
}

async function createCname() {
  await writeFile(join(DOCS_DIR, 'CNAME'), `${CNAME_DOMAIN}\n`, 'utf8');
}

async function main() {
  await runNgBuild();
  await copyDistToDocs();
  await createNotFoundPage();
  await createCname();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
