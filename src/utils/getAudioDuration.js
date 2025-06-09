const { parseBuffer } = require('music-metadata');

async function getAudioDuration(buffer) {
  try {
    const metadata = await parseBuffer(buffer, 'audio/mpeg');
    return metadata.format.duration; // duration in seconds (float)
  } catch (error) {
    console.error("Error getting audio duration:", error);
    return 0; // or throw error
  }
}

module.exports = getAudioDuration;