It's possible that for some reason the audio is blocked initially, below code should help
This helps overcome autoplay restrictions in modern browsers

```js
// Initialize audio on first user interaction
function initializeAudio() {
  // Create a short silent audio context to unblock audio
  const silentContext = new (window.AudioContext ||
    window.webkitAudioContext)();
  silentContext.resume().then(() => {
    console.log("Audio context initialized and resumed");
    setTimeout(() => silentContext.close(), 1000);
  });

  // Remove the listener after first interaction
  document.removeEventListener("click", initializeAudio);
  document.removeEventListener("touchstart", initializeAudio);
}

// Set up listeners for user interaction
document.addEventListener("click", initializeAudio);
document.addEventListener("touchstart", initializeAudio);
```
