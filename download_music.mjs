import fs from 'fs';

async function downloadMusic() {
  const url = 'https://cdn1.suno.ai/2033dda9-e683-41a5-9590-6dc4fe0b0553.mp4';
  console.log('Downloading from:', url);
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error('Failed to download: ' + res.status);
  }
  const buffer = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('public/assets/music_box.mp4', buffer);
  console.log('Saved public/assets/music_box.mp4! Size:', buffer.length);
}

downloadMusic();
