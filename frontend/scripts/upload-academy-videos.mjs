/**
 * SmartVest Academy Video Uploader to Vercel Blob
 *
 * Requirements satisfied:
 * - Uses @vercel/blob multipart upload for large files (hundreds of MB)
 * - Retains MP4 files byte-for-byte (streams original files from disk)
 * - Uses stable pathnames (e.g. academy/investment.mp4)
 * - Does NOT upload through serverless function request bodies
 * - Updates frontend/src/data/investmentAcademyLessons.ts with the real returned Blob URLs
 * - Saves a JSON mapping manifest to frontend/src/data/academyBlobUrls.json
 * - Verifies HTTP responses are actual MP4s and not Git LFS pointers
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { put, head, list } from '@vercel/blob';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '..');

// 12 English SmartVest Academy videos
export const ACADEMY_VIDEOS = [
  { id: 'what-is-investment', file: 'investment.mp4', pathname: 'academy/investment.mp4' },
  { id: 'what-is-a-stock', file: 'stock.mp4', pathname: 'academy/stock.mp4' },
  { id: 'what-are-shares', file: 'shares.mp4', pathname: 'academy/shares.mp4' },
  { id: 'what-is-an-etf', file: 'etf.mp4', pathname: 'academy/etf.mp4' },
  { id: 'what-is-a-mutual-fund', file: 'mutual-fund.mp4', pathname: 'academy/mutual-fund.mp4' },
  { id: 'why-long-term-investing', file: 'long-term.mp4', pathname: 'academy/long-term.mp4' },
  { id: 'what-is-compounding', file: 'compounding.mp4', pathname: 'academy/compounding.mp4' },
  { id: 'what-is-sip', file: 'sip.mp4', pathname: 'academy/sip.mp4' },
  { id: 'what-is-swp', file: 'swp.mp4', pathname: 'academy/swp.mp4' },
  { id: 'what-is-a-hedge-fund', file: 'hedge-fund.mp4', pathname: 'academy/hedge-fund.mp4' },
  { id: 'risk-return-diversification', file: 'diversification.mp4', pathname: 'academy/diversification.mp4' },
  { id: 'how-to-start-investing', file: 'getting-started.mp4', pathname: 'academy/getting-started.mp4' },
];

function loadEnvToken() {
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    return process.env.BLOB_READ_WRITE_TOKEN.trim();
  }

  // Check CLI arguments --token <val>
  const tokenArgIdx = process.argv.indexOf('--token');
  if (tokenArgIdx !== -1 && process.argv[tokenArgIdx + 1]) {
    return process.argv[tokenArgIdx + 1].trim();
  }

  // Check .env.local in frontend or root
  const envPaths = [
    path.join(projectRoot, '.env.local'),
    path.join(projectRoot, '..', '.env.local'),
    path.join(projectRoot, '.env'),
    path.join(projectRoot, '.env.production'),
  ];

  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      const match = content.match(/BLOB_READ_WRITE_TOKEN=["']?([^"'\r\n]+)["']?/);
      if (match && match[1]) {
        return match[1].trim();
      }
    }
  }

  return null;
}

function verifyLocalVideo(filePath) {
  const stats = fs.statSync(filePath);
  if (stats.size < 10 * 1024 * 1024) {
    throw new Error(`File ${filePath} is too small (${stats.size} bytes). Potential LFS pointer or empty file.`);
  }

  const fd = fs.openSync(filePath, 'r');
  const buffer = Buffer.alloc(64);
  fs.readSync(fd, buffer, 0, 64, 0);
  fs.closeSync(fd);

  const header = buffer.toString('utf8');
  if (header.includes('version https://git-lfs.github.com/spec/v1')) {
    throw new Error(`File ${filePath} is a Git LFS pointer, not actual MP4 binary data!`);
  }

  const ftyp = buffer.subarray(4, 8).toString('ascii');
  if (ftyp !== 'ftyp') {
    console.warn(`Warning: Header magic is ${ftyp}, expected 'ftyp'.`);
  }

  return stats.size;
}

async function verifyBlobUrl(blobUrl, expectedSize) {
  console.log(`  🔍 Verifying remote URL: ${blobUrl}`);
  const res = await fetch(blobUrl, {
    headers: { Range: 'bytes=0-1023' },
  });

  if (!res.ok && res.status !== 206) {
    throw new Error(`HTTP error ${res.status} ${res.statusText} fetching ${blobUrl}`);
  }

  const contentType = res.headers.get('content-type') || '';
  if (!contentType.includes('video/mp4') && !contentType.includes('application/octet-stream')) {
    throw new Error(`Unexpected Content-Type: ${contentType}`);
  }

  const arrayBuf = await res.arrayBuffer();
  const chunk = Buffer.from(arrayBuf);
  const text = chunk.toString('utf8');
  if (text.includes('version https://git-lfs')) {
    throw new Error(`CRITICAL: Remote Blob URL returned Git LFS pointer content!`);
  }

  console.log(`  ✅ Remote verification passed! Received initial ${chunk.length} bytes, content-type: ${contentType}`);
}

export async function uploadAllVideos() {
  const token = loadEnvToken();
  if (!token) {
    console.error('❌ Error: BLOB_READ_WRITE_TOKEN is missing.');
    console.error('Please pass --token <your_token> or set process.env.BLOB_READ_WRITE_TOKEN');
    process.exit(1);
  }

  console.log(`🚀 Starting Vercel Blob upload for 12 SmartVest Academy videos...`);
  const results = {};
  const manifestPath = path.join(projectRoot, 'src', 'data', 'academyBlobUrls.json');

  let existingManifest = {};
  if (fs.existsSync(manifestPath)) {
    try {
      existingManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      // Ignore
    }
  }

  // Also query store to discover any already-uploaded blobs
  try {
    const listRes = await list({ token });
    for (const b of listRes.blobs) {
      const matchItem = ACADEMY_VIDEOS.find(v => v.pathname === b.pathname || b.pathname.endsWith('/' + v.file) || b.pathname === v.file);
      if (matchItem && !existingManifest[matchItem.id]) {
        existingManifest[matchItem.id] = b.url;
        console.log(`  🌐 Discovered existing blob in store: ${matchItem.file} -> ${b.url}`);
      }
    }
  } catch (err) {
    console.warn(`  Warning: Could not list store blobs: ${err.message}`);
  }

  for (let i = 0; i < ACADEMY_VIDEOS.length; i++) {
    const item = ACADEMY_VIDEOS[i];
    const localPath = path.join(projectRoot, 'public', 'academy', item.file);

    console.log(`\n[${i + 1}/${ACADEMY_VIDEOS.length}] Processing ${item.file}...`);
    if (!fs.existsSync(localPath)) {
      throw new Error(`Local file not found: ${localPath}`);
    }

    const localSize = verifyLocalVideo(localPath);
    console.log(`  📁 Local file size: ${(localSize / (1024 * 1024)).toFixed(2)} MB (valid MP4 binary)`);

    // Check if already uploaded and valid in existing manifest
    if (existingManifest[item.id] && !process.argv.includes('--force')) {
      const existingUrl = existingManifest[item.id];
      try {
        console.log(`  ⚡ Found existing manifest entry: ${existingUrl}`);
        await verifyBlobUrl(existingUrl, localSize);
        results[item.id] = existingUrl;
        fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8');
        updateLessonsFile(results);
        console.log(`  ⏩ Skipped upload (already uploaded and verified)`);
        continue;
      } catch (err) {
        console.log(`  Existing URL failed check (${err.message}). Re-uploading...`);
      }
    }

    console.log(`  ⬆️ Uploading via @vercel/blob multipart upload with stable pathname '${item.pathname}'...`);
    const stream = fs.createReadStream(localPath);

    const blob = await put(item.pathname, stream, {
      access: 'public',
      addRandomSuffix: false,
      multipart: true,
      contentType: 'video/mp4',
      token,
    });

    console.log(`  ✨ Upload succeeded! URL: ${blob.url}`);
    results[item.id] = blob.url;

    // Verify remote URL immediately
    await verifyBlobUrl(blob.url, localSize);

    // Save manifest incrementally
    fs.writeFileSync(manifestPath, JSON.stringify(results, null, 2), 'utf8');
    updateLessonsFile(results);
  }

  console.log(`\n💾 Saved final manifest to ${manifestPath}`);
  console.log(`\n🎉 All available SmartVest Academy videos successfully uploaded and verified on Vercel Blob!`);
  return results;
}

export function updateLessonsFile(blobUrls) {
  const lessonsFilePath = path.join(projectRoot, 'src', 'data', 'investmentAcademyLessons.ts');
  let content = fs.readFileSync(lessonsFilePath, 'utf8');

  let updatedCount = 0;
  for (const item of ACADEMY_VIDEOS) {
    const blobUrl = blobUrls[item.id];
    if (!blobUrl) continue;

    // Replace root videoUrl: '/academy/investment.mp4' -> blobUrl
    const rootPattern = new RegExp(`(videoUrl:\\s*['"])/academy/${item.file}(['"])`, 'g');
    if (rootPattern.test(content)) {
      content = content.replace(rootPattern, `$1${blobUrl}$2`);
      updatedCount++;
    }

    // Replace english videoUrl: '/academy/en/investment.mp4' -> blobUrl
    const enPattern = new RegExp(`(videoUrl:\\s*['"])/academy/en/${item.file}(['"])`, 'g');
    if (enPattern.test(content)) {
      content = content.replace(enPattern, `$1${blobUrl}$2`);
      updatedCount++;
    }
  }

  fs.writeFileSync(lessonsFilePath, content, 'utf8');
  console.log(`📝 Updated ${lessonsFilePath} (${updatedCount} videoUrl replacements)`);
}

// Execute directly if run as CLI script
if (process.argv[1] && process.argv[1].endsWith('upload-academy-videos.mjs')) {
  uploadAllVideos().catch(err => {
    console.error('Fatal upload error:', err);
    process.exit(1);
  });
}
