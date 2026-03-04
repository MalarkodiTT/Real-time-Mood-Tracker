const video = document.getElementById('video');

// Model load panna aprom camera start aagum
Promise.all([
  faceapi.nets.tinyFaceDetector.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights'),
  faceapi.nets.faceExpressionNet.loadFromUri('https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights')
]).then(startVideo);

function startVideo() {
  navigator.mediaDevices.getUserMedia({ video: {} })
    .then(stream => video.srcObject = stream)
    .catch(err => console.error("Camera access denied!", err));
}

video.addEventListener('play', () => {
  const canvas = document.getElementById('overlay');
  const displaySize = { width: video.width, height: video.height };
  faceapi.matchDimensions(canvas, displaySize);

  setInterval(async () => {
    const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
      .withFaceExpressions();

    const resizedDetections = faceapi.resizeResults(detections, displaySize);
    canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
    
    // Draw results on screen
    faceapi.draw.drawDetections(canvas, resizedDetections);
    faceapi.draw.drawFaceExpressions(canvas, resizedDetections);

    if (detections.length > 0) {
      // Get the most dominant emotion
      const expressions = detections[0].expressions;
      const maxEmotion = Object.keys(expressions).reduce((a, b) => expressions[a] > expressions[b] ? a : b);
      saveMoodToDB(maxEmotion);
      document.getElementById('mood-display').innerText = maxEmotion.toUpperCase();
    }
  }, 100);
});
// Mood-ah backend-ku anuppura function
async function saveMoodToDB(currentMood) {
    try {
        await fetch('http://localhost:5000/save-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion: currentMood })
        });
        console.log("Mood saved to MongoDB!");
    } catch (err) {
        console.error("Error saving mood:", err);
    }
}
async function saveMoodToDB(moodName) {
    try {
        const response = await fetch('http://localhost:5000/save-mood', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ emotion: moodName })
        });
        const data = await response.json();
        console.log("Mood Saved in MongoDB Atlas:", data);
    } catch (err) {
        console.error("Database-ku anuppa mudiyala:", err);
    }
}