#!/usr/bin/env node

/**
 * Google Drive OAuth Token Updater
 * 
 * This script helps you update the Google Drive OAuth refresh token
 * for your Cloudflare Worker.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function main() {
  console.log('\n🔐 Google Drive OAuth Token Updater\n');
  console.log('═'.repeat(50));
  
  // Read credentials
  let credentials;
  try {
    credentials = JSON.parse(readFileSync('./credentials.json', 'utf8'));
    console.log('\n✅ Found credentials.json');
  } catch (error) {
    console.error('\n❌ Error reading credentials.json:', error.message);
    process.exit(1);
  }

  const clientId = credentials.installed.client_id;
  const clientSecret = credentials.installed.client_secret;

  console.log('\n📋 Your OAuth Credentials:');
  console.log(`   Client ID: ${clientId}`);
  console.log(`   Client Secret: ${clientSecret.substring(0, 20)}...`);

  console.log('\n📝 Steps to get refresh token:');
  console.log('   1. Visit: https://developers.google.com/oauthplayground/');
  console.log('   2. Click ⚙️ (Settings) → Check "Use your own OAuth credentials"');
  console.log(`   3. Enter Client ID: ${clientId}`);
  console.log(`   4. Enter Client Secret: ${clientSecret}`);
  console.log('   5. Select "Drive API v3" → https://www.googleapis.com/auth/drive');
  console.log('   6. Click "Authorize APIs"');
  console.log('   7. Click "Exchange authorization code for tokens"');
  console.log('   8. Copy the "refresh_token" value\n');

  const refreshToken = await question('🔑 Paste your refresh token here: ');
  
  if (!refreshToken || refreshToken.trim().length < 20) {
    console.error('\n❌ Invalid refresh token. Please try again.');
    rl.close();
    process.exit(1);
  }

  console.log('\n🚀 Updating Cloudflare Worker secrets...\n');

  try {
    // Update GOOGLE_CLIENT_ID
    console.log('   Setting GOOGLE_CLIENT_ID...');
    execSync(`echo "${clientId}" | npx wrangler secret put GOOGLE_CLIENT_ID`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Update GOOGLE_CLIENT_SECRET
    console.log('   Setting GOOGLE_CLIENT_SECRET...');
    execSync(`echo "${clientSecret}" | npx wrangler secret put GOOGLE_CLIENT_SECRET`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    // Update GOOGLE_REFRESH_TOKEN
    console.log('   Setting GOOGLE_REFRESH_TOKEN...');
    execSync(`echo "${refreshToken.trim()}" | npx wrangler secret put GOOGLE_REFRESH_TOKEN`, {
      stdio: 'inherit',
      cwd: process.cwd()
    });

    console.log('\n✅ All secrets updated successfully!\n');

    const shouldDeploy = await question('📦 Deploy worker now? (y/n): ');
    
    if (shouldDeploy.toLowerCase() === 'y') {
      console.log('\n🚀 Deploying worker...\n');
      execSync('npm run deploy', { stdio: 'inherit', cwd: process.cwd() });
      console.log('\n✅ Worker deployed successfully!\n');
      
      console.log('🧪 Testing upload...\n');
      try {
        execSync(`curl -X POST https://cdn-bengalart.darkwayrider.workers.dev/api/files \
          -H "Authorization: Bearer f7060fdf29b38104def6e7e9f9c628144fa5f9f49715d4b0fe8128aba1e84e25" \
          -F "file=@README.md" | jq '.'`, {
          stdio: 'inherit',
          cwd: process.cwd(),
          shell: '/bin/bash'
        });
      } catch (error) {
        console.log('\n⚠️  Test upload failed. Check the error above.');
      }
    }

    console.log('\n✨ Done!\n');
    
  } catch (error) {
    console.error('\n❌ Error updating secrets:', error.message);
    process.exit(1);
  }

  rl.close();
}

main().catch(error => {
  console.error('\n❌ Fatal error:', error);
  process.exit(1);
});
