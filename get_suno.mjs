import fs from 'fs';

async function getSuno() {
  try {
    const res = await fetch('https://suno.com/s/9QPC9IfewyCWI4hT', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    const html = await res.text();
    fs.writeFileSync('suno_html.txt', html);
    
    // Look for audio URLs or json data
    const mp3s = html.match(/https:\/\/[^"'\s<>]+\.mp3[^"'\s<>]*/gi);
    console.log('MP3 matches:', mp3s);

    const cdnMatches = html.match(/https:\/\/cdn[^"'\s<>]+/gi);
    console.log('CDN matches:', cdnMatches);

    // Look for song UUID / clip id
    const clipMatches = html.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi);
    console.log('Clip UUIDs:', clipMatches);

    let audioUrl = null;
    if (mp3s && mp3s.length > 0) {
      audioUrl = mp3s[0];
    } else if (clipMatches && clipMatches.length > 0) {
      // Suno audio URL format: https://audiopipe.suno.ai/?item_id={clipId} or https://cdn1.suno.ai/{clipId}.mp3
      audioUrl = `https://cdn1.suno.ai/${clipMatches[0]}.mp3`;
    }

    if (audioUrl) {
      console.log('Downloading audio from:', audioUrl);
      const audioRes = await fetch(audioUrl);
      if (audioRes.ok) {
        const buffer = Buffer.from(await audioRes.arrayBuffer());
        fs.writeFileSync('./public/assets/music_box.mp3', buffer);
        console.log('Successfully saved music to ./public/assets/music_box.mp3 ! File size:', buffer.length);
      } else {
        console.log('Trying audiopipe fallback...');
        const pipeUrl = `https://audiopipe.suno.ai/?item_id=${clipMatches[0]}`;
        const pipeRes = await fetch(pipeUrl);
        if (pipeRes.ok) {
          const buffer = Buffer.from(await pipeRes.arrayBuffer());
          fs.writeFileSync('./public/assets/music_box.mp3', buffer);
          console.log('Saved from audiopipe to ./public/assets/music_box.mp3 ! File size:', buffer.length);
        }
      }
    }
  } catch (err) {
    console.error('Error:', err);
  }
}

getSuno();
