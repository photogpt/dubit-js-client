# Speck for dubit js adapter

Users should be able to `import dubit from '@taic/dubit'`

## From user perspective

- Create dubit instance
Instantiate and auth

```js
// Architect note: Create a room using the api call and return appropriate info
const dubitInstance = await dubit.create({SESSION_KEY or API_KEY})
// return
{
    instanceId: room_id,
    ownerToken: string,
}
```

- Add a translator bot
- Need to make sure that for every translator, subscriptions are handled properly and they only subscribe to their respective local participant, which means we need multipleCallInstances

```js
// Architect note: create a call instance and add a local participant
// And call api endpoint for adding a translation bot
// Subscribe the bot only to the local participant
let translatorA = dubitInstance.addTranslator({
    fromLang: langCodeA,
    toLang: langCodeB,
    voiceType: enum(male or female),
    inputAudioTrack: MediaStreamTrack,
    metadata: JSON,
})
// return
{
    translatorId: string,
}

translatorA.onTranslatedTrackReady((translatedTrack: MediaStreamTrack) => {
    // Users can do anything with the track
})
type CaptionEvent = {
    participant_id: string;
    timestamp: string;
    transcript: string;
    type: string;
}
translatorA.onCaptions((caption: CaptionEvent) => {
    // Users can do anything with captions
})
```

## Utility functions

```js
dubit.getSupportedLanguages() // returns array of supported languages
dubit.getCompleteTranscript({instanceId}) // leave the impl empty, it will call an api endpoint
```
