import { optimizeImage as wasmOptimize } from 'wasm-image-optimization';

// Configuration constants
const SIZE_THRESHOLD = 5 * 1024 * 1024; // 5MB
const MAX_WIDTH = 1920;
const AVIF_QUALITY = 70;
const OPTIMIZATION_TIMEOUT = 10000; // 10 seconds

/**
 * Check if a file should be optimized
 * @param {File} file - The file to check
 * @returns {boolean} - True if file should be optimized
 */
export function shouldOptimizeImage(file) {
	if (!file || !file.type) {
		return false;
	}

	// Only optimize image files
	if (!file.type.startsWith('image/')) {
		return false;
	}

	// Skip if file is too large (to prevent timeouts)
	if (file.size >= SIZE_THRESHOLD) {
		console.log(`[Image Optimizer] Skipped: ${file.name} (${formatBytes(file.size)}) - exceeds ${formatBytes(SIZE_THRESHOLD)} threshold`);
		return false;
	}

	// Skip if already AVIF
	if (file.type === 'image/avif') {
		console.log(`[Image Optimizer] Skipped: ${file.name} - already AVIF format`);
		return false;
	}

	return true;
}

/**
 * Optimize an image file
 * @param {ArrayBuffer} fileBuffer - The file buffer
 * @param {string} fileName - Original file name
 * @returns {Promise<{success: boolean, buffer?: ArrayBuffer, fileName?: string, mimeType?: string, stats?: object}>}
 */
export async function optimizeImage(fileBuffer, fileName) {
	const originalSize = fileBuffer.byteLength;
	const startTime = Date.now();

	try {
		console.log(`[Image Optimizer] Processing: ${fileName} (${formatBytes(originalSize)})`);

		// Create timeout promise
		const timeoutPromise = new Promise((_, reject) => {
			setTimeout(() => reject(new Error('Optimization timeout')), OPTIMIZATION_TIMEOUT);
		});

		// Optimize image with timeout protection
		const optimizationPromise = wasmOptimize({
			image: new Uint8Array(fileBuffer),
			width: MAX_WIDTH,
			quality: AVIF_QUALITY,
			format: 'avif',
		});

		const optimizedBuffer = await Promise.race([optimizationPromise, timeoutPromise]);

		// Calculate statistics
		const optimizedSize = optimizedBuffer.byteLength;
		const savings = ((originalSize - optimizedSize) / originalSize) * 100;
		const processingTime = Date.now() - startTime;

		// Update filename to .avif
		const newFileName = fileName.replace(/\.[^/.]+$/, '') + '.avif';

		console.log(
			`[Image Optimizer] ✓ Success: ${fileName} → ${newFileName}\n` +
				`  Original: ${formatBytes(originalSize)}\n` +
				`  Optimized: ${formatBytes(optimizedSize)}\n` +
				`  Savings: ${savings.toFixed(1)}%\n` +
				`  Time: ${processingTime}ms`,
		);

		return {
			success: true,
			buffer: optimizedBuffer.buffer,
			fileName: newFileName,
			mimeType: 'image/avif',
			stats: {
				originalSize,
				optimizedSize,
				savings: savings.toFixed(1),
				processingTime,
			},
		};
	} catch (error) {
		const processingTime = Date.now() - startTime;
		console.error(
			`[Image Optimizer] ✗ Failed: ${fileName}\n` + `  Error: ${error.message}\n` + `  Time: ${processingTime}ms\n` + `  Falling back to original`,
		);

		return {
			success: false,
			error: error.message,
		};
	}
}

/**
 * Format bytes to human-readable string
 * @param {number} bytes - Number of bytes
 * @returns {string} - Formatted string (e.g., "1.5 MB")
 */
function formatBytes(bytes) {
	if (bytes === 0) return '0 B';
	const k = 1024;
	const sizes = ['B', 'KB', 'MB', 'GB'];
	const i = Math.floor(Math.log(bytes) / Math.log(k));
	return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}
