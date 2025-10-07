const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const archiver = require('archiver');

// Get current timestamp
const now = new Date();
const timestamp = now.toISOString()
  .replace(/T/, '_')
  .replace(/:/g, '-')
  .replace(/\..+/, '');

const zipFileName = `lines-game-${timestamp}.zip`;
const distPath = path.join(__dirname, '..', 'dist');
const zipPath = path.join(__dirname, '..', zipFileName);

console.log('🚀 Starting build process...');

try {
  // Run the build
  execSync('yarn build', { stdio: 'inherit' });
  
  console.log('\n📦 Creating zip archive...');
  
  // Check if dist folder exists
  if (!fs.existsSync(distPath)) {
    console.error('❌ Error: dist folder not found!');
    process.exit(1);
  }
  
  // Create a file to stream archive data to
  const output = fs.createWriteStream(zipPath);
  const archive = archiver('zip', {
    zlib: { level: 9 } // Maximum compression
  });
  
  // Listen for all archive data to be written
  output.on('close', () => {
    const sizeInMB = (archive.pointer() / 1024 / 1024).toFixed(2);
    console.log(`\n✅ Created: ${zipFileName}`);
    console.log(`📊 Size: ${sizeInMB} MB (${archive.pointer()} bytes)`);
    console.log(`📍 Location: ${zipPath}`);
  });
  
  // Handle warnings
  archive.on('warning', (err) => {
    if (err.code === 'ENOENT') {
      console.warn('⚠️  Warning:', err);
    } else {
      throw err;
    }
  });
  
  // Handle errors
  archive.on('error', (err) => {
    throw err;
  });
  
  // Pipe archive data to the file
  archive.pipe(output);
  
  // Append files from the dist directory
  archive.directory(distPath, false);
  
  // Finalize the archive
  archive.finalize();
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
