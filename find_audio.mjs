import fs from 'fs';

async function checkEmbed() {
  const embedRes = await fetch('https://suno.com/embed/2033dda9-e683-41a5-9590-6dc4fe0b0553', {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  console.log('Embed status:', embedRes.status);
  const html = await embedRes.text();
  fs.writeFileSync('embed.html', html);
  
  const allUrls = [...html.matchAll(/https:\/\/[^"'\s<>\\]+/g)].map(m => m[0]);
  console.log('Urls with mp3/mp4/audio:', allUrls.filter(u => u.includes('mp3') || u.includes('mp4') || u.includes('audio') || u.includes('cdn')));
}

checkEmbed();
