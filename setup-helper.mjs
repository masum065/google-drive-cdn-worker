#!/usr/bin/env node

/**
 * Interactive Setup Helper for Google Drive CDN Worker
 * এই script আপনাকে step-by-step setup করতে সাহায্য করবে
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { join } from 'path';

const execAsync = promisify(exec);

const colors = {
	reset: '\x1b[0m',
	bright: '\x1b[1m',
	green: '\x1b[32m',
	yellow: '\x1b[33m',
	blue: '\x1b[34m',
	red: '\x1b[31m',
	cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
	console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
	console.log('\n' + '='.repeat(60));
	log(message, 'bright');
	console.log('='.repeat(60) + '\n');
}

async function checkCommand(command, name) {
	try {
		await execAsync(`${command} --version`);
		log(`✓ ${name} installed`, 'green');
		return true;
	} catch {
		log(`✗ ${name} not found`, 'red');
		return false;
	}
}

async function runStep(title, command, description) {
	header(title);
	if (description) {
		log(description, 'cyan');
		console.log();
	}

	log(`Running: ${command}`, 'yellow');
	console.log();

	try {
		const { stdout, stderr } = await execAsync(command);
		if (stdout) console.log(stdout);
		if (stderr) console.error(stderr);
		log('✓ Success!', 'green');
		return true;
	} catch (error) {
		log(`✗ Error: ${error.message}`, 'red');
		return false;
	}
}

async function main() {
	console.clear();
	header('🚀 Google Drive CDN Worker - Setup Helper');

	log('এই script আপনার CDN Worker setup করতে সাহায্য করবে।', 'cyan');
	log('প্রতিটি step সাবধানে follow করুন।\n', 'cyan');

	// Step 1: Check prerequisites
	header('Step 1: Prerequisites চেক করা হচ্ছে...');

	const hasNode = await checkCommand('node', 'Node.js');
	const hasNpm = await checkCommand('npm', 'npm');

	if (!hasNode || !hasNpm) {
		log('\n❌ Node.js এবং npm install করুন প্রথমে!', 'red');
		log('Download: https://nodejs.org/', 'yellow');
		process.exit(1);
	}

	// Step 2: Install dependencies
	if (!existsSync('node_modules')) {
		const installDeps = await runStep(
			'Step 2: Dependencies Install করা হচ্ছে...',
			'npm install',
			'প্রয়োজনীয় packages install করা হচ্ছে...'
		);

		if (!installDeps) {
			log('\n❌ Dependencies install failed!', 'red');
			process.exit(1);
		}
	} else {
		header('Step 2: Dependencies');
		log('✓ Dependencies already installed', 'green');
	}

	// Step 3: Check for service accounts
	header('Step 3: Configuration চেক করা হচ্ছে...');

	const hasServiceAccounts = existsSync('src/service-accounts.json');
	const hasOAuthTokens = existsSync('temp/oauth-tokens.json');

	if (!hasServiceAccounts && !hasOAuthTokens) {
		log('⚠️  Google credentials পাওয়া যায়নি।', 'yellow');
		log('\nপরবর্তী step:', 'cyan');
		log('1. Google Cloud Console এ যান', 'yellow');
		log('2. Drive API enable করুন', 'yellow');
		log('3. OAuth credentials তৈরি করুন (Desktop App)', 'yellow');
		log('4. তারপর run করুন: npm run bootstrap:google\n', 'yellow');
	} else {
		log('✓ Google credentials পাওয়া গেছে', 'green');
	}

	// Step 4: Check wrangler.toml
	const wranglerConfig = readFileSync('wrangler.toml', 'utf-8');

	if (wranglerConfig.includes('123456789')) {
		log('\n⚠️  API_TOKENS এখনো default value আছে!', 'yellow');
		log('wrangler.toml edit করে নিজের token দিন।', 'cyan');
	}

	// Step 5: Check Cloudflare login
	header('Step 4: Cloudflare Setup চেক করা হচ্ছে...');

	try {
		await execAsync('npx wrangler whoami');
		log('✓ Cloudflare এ logged in আছেন', 'green');
	} catch {
		log('⚠️  Cloudflare এ login করা নেই', 'yellow');
		log('\nLogin করতে run করুন:', 'cyan');
		log('npx wrangler login\n', 'yellow');
	}

	// Summary
	header('📋 Setup Summary');

	log('✅ সম্পন্ন Steps:', 'green');
	log('  • Node.js এবং npm installed', 'green');
	log('  • Dependencies installed', 'green');

	log('\n📝 পরবর্তী করণীয়:', 'yellow');

	if (!hasServiceAccounts && !hasOAuthTokens) {
		log('  1. Google Cloud setup করুন', 'cyan');
		log('  2. npm run bootstrap:google চালান', 'cyan');
	}

	log('  3. Cloudflare এ login করুন: npx wrangler login', 'cyan');
	log('  4. KV namespaces তৈরি করুন', 'cyan');
	log('  5. wrangler.toml configure করুন', 'cyan');
	log('  6. Deploy করুন: npm run deploy', 'cyan');

	log('\n📖 বিস্তারিত guide:', 'blue');
	log('  • QUICK_START.md - দ্রুত শুরু করার জন্য', 'blue');
	log('  • SETUP_GUIDE.md - সম্পূর্ণ documentation', 'blue');

	log('\n🎉 Setup helper সম্পন্ন!', 'green');
}

main().catch((error) => {
	log(`\n❌ Error: ${error.message}`, 'red');
	process.exit(1);
});
