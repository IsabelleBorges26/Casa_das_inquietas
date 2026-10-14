const fs = require('fs');

async function getSuno() {
  try {
    const res = await fetch('https://suno.com/s/9QPC9IfewyCWI4hT', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();
    fs.writeFileSync('suno_html.txt', html);
    
    // Look for mp3 or audio urls
    const mp3s = html.match(/https:\/\/[^"'\s]+\.mp3/gi);
    console.log('MP3 matches:', mp3s);

    // Look for cdn / audio url in json
    const jsonMatches = html.match(/"audio_url":"([^"]+)"/g) || html.match(/https:\/\/cdn[^\s"']+/g);
    console.log('JSON matches:', jsonMatches);

    // Look for suno song ID
    const songId = '9QPC9IfewyCWI4hT';
    console.log('Song ID:', songId);

    // Suno CDN pattern: https://cdn1.suno.ai/{id}.mp3 or https://audiopipe.suno.ai/?item_id={id}
    if (mp3s && mp3s.length > 0) {
      console.log('Downloading MP3 from:', mp3s[0]);
      const audioRes = await fetch(mp3s[0]);
      const buffer = Buffer.from(await audioRes.arrayBuffer());
      fs.writeFileSync('./public/assets/music_box.mp3', buffer);
      console.log('Saved to ./public/assets/music_box.mp3 !');
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

getSuno();
