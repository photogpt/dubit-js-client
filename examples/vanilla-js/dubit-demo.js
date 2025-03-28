const token = import.meta.env.VITE_DUBIT_API_KEY

document.getElementById('startCall').addEventListener('click', startCall)
document.getElementById('addTranslator-1').addEventListener('click', async (event) => {
  try {
    let el = event.target
    el.disabled = true
    el.innerText = 'Setting up translator ...'
    el.classList.add(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
    )
    await addTranslator('1')

    el.innerText = 'Ready'
    el.classList.remove(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
    )
    el.classList.add('cursor-not-allowed')
  } catch (err) {
    el.disabled = false
    el.innerText = 'Start Translation'
    el.classList.remove(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
      'cursor-not-allowed',
    )
  }
})
document.getElementById('addTranslator-2').addEventListener('click', async (event) => {
  try {
    let el = event.target
    el.disabled = true
    el.innerText = 'Setting up translator ...'
    el.classList.add(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
    )
    await addTranslator('2')

    el.innerText = 'Ready'
    el.classList.remove(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
    )
    el.classList.add('cursor-not-allowed')
  } catch (err) {
    el.disabled = false
    el.innerText = 'Start Translation'
    el.classList.remove(
      'bg-zinc-700',
      'text-gray',
      'hover:bg-zinc-700',
      'hover:text-gray',
      'cursor-progress',
      'cursor-not-allowed',
    )
  }
})

let dubitInstance = null

// Start the call and initialize UI
async function startCall() {
  document.getElementById('startCall').disabled = true
  const logDiv = document.getElementById('log')
  logDiv.innerHTML = '<p>Starting call...</p>'
  const loggerCallback = (log) => {
    if (!['error', 'warn', 'info'].includes(log.level)) return
    logDiv.innerHTML += `
      <div class="mb-2 pb-2 border-b border-gray-200">
        <div class="flex gap-2 items-center">
          <span class="font-medium text-gray-800">${log.eventCode}</span>
          <span class="text-sm text-gray-500">${log.timestamp}</span>:
          <span class="text-gray-700 flex-grow">${log.userMessage}</span>
          ${
            log.internalData
              ? `
            <div class="ml-auto">
              <details>
                <summary class="text-sm text-blue-500 cursor-pointer inline-block">Data</summary>
                <div class="p-2 bg-gray-100 border border-gray-300 rounded-md text-xs whitespace-pre-wrap mt-1">
                  <pre>${JSON.stringify(log.internalData, null, 2)}</pre>
                </div>
              </details>
            </div>
          `
              : ''
          }
          ${
            log.error
              ? `
            <div class="ml-auto">
              <details>
                <summary class="text-sm text-red-500 cursor-pointer inline-block">Error</summary>
                <div class="p-2 bg-red-100 border border-gray-300 rounded-md text-xs whitespace-pre-wrap mt-1">
                  <pre>${log.error}</pre>
                </div>
              </details>
            </div>
          `
              : ''
          }
        </div>
      </div>
    `
  }

  try {
    dubitInstance = await Dubit.createNewInstance({ token: token, loggerCallback: loggerCallback })

    window._dubit = dubitInstance
    document.getElementById('controls-1').style.display = 'flex'
    document.getElementById('controls-2').style.display = 'flex'

    await populateAudioDevices()
    populateLanguages()
  } catch (err) {
    console.error('Error starting call:', err)
  }
}

function addNetworkTest(translator) {
  let parentEl = document.querySelector('#network-stats>div')
  let childEl = document.createElement('div')
  childEl.classList.add('flex', 'gap-1')
  parentEl.appendChild(childEl)
  setInterval(async () => {
    const statsInfo = await translator?.getNetworkStats()
    childEl.innerHTML = `
      <ul>
        <li>
          Network Status:
          ${statsInfo.threshold}
        </li>
        <li>
          Network Quality:
          ${statsInfo.quality}
        </li>
        <li>
          Audio send:
          ${statsInfo?.stats ? Math.floor(statsInfo.stats?.latest.audioSendBitsPerSecond / 1000).toString() + ' kb/s' : '⚠️'}
        </li>
        <li>
          Audio recv:
          ${statsInfo?.stats ? Math.floor(statsInfo.stats?.latest.audioRecvBitsPerSecond / 1000).toString() + ' kb/s' : '⚠️'}
        </li>
        <li>
          Worst send packet loss:
          ${statsInfo?.stats ? Math.floor(statsInfo.stats?.worstAudioSendPacketLoss * 100) : 100}%
        </li>
        <li>Worst recv packet loss:
          ${statsInfo?.stats ? Math.floor(statsInfo.stats?.worstAudioRecvPacketLoss * 100) : 100}%
        </li>
      </ul>`
  }, 5000)
}

// Add a translator with specific language pairs and devices
async function addTranslator(translatorId) {
  if (!dubitInstance) {
    console.error('Call not started yet.')
    return
  }

  // Get UI elements
  const audioInputSelect = document.getElementById(`audioInput-${translatorId}`)
  const audioOutputSelect = document.getElementById(`audioOutput-${translatorId}`)
  const sourceLangSelect = document.getElementById(`sourceLang-${translatorId}`)
  const targetLangSelect = document.getElementById(`targetLang-${translatorId}`)
  const interimCaptionsDiv = document.getElementById(`interimCaptions-${translatorId}`)

  // Get selected values
  const deviceId = audioInputSelect.value
  const outputDeviceId = audioOutputSelect.value
  const fromLang = sourceLangSelect.value
  const toLang = targetLangSelect.value

  try {
    // exact avoids browser's fallback logic, we explicitly need certain device
    // if the device we want is not available then we should fail
    const stream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: { exact: deviceId } },
    })
    const audioTrack = stream.getAudioTracks()[0]

    const translator = await dubitInstance.addTranslator({
      fromLang,
      toLang,
      voiceType: 'female',
      inputAudioTrack: audioTrack,
      metadata: { demo: true },
      version: '2',
      keywords: false,
      translationBeep: false,
      onNetworkConnection: (event) => console.log('Network Connection', event),
    })
    addNetworkTest(translator)

    const logDiv = document.getElementById('log')
    translator.onTranslatedTrackReady((track) => {
      track.enabled = true
      const elementId = `audio-${translatorId}-${translator.getInstanceId()}`

      // NOTE: it's important to use dubit's provided function for audio routing
      // to avoid WebRTC track mixing issue by using the WebAudio API
      Dubit.routeTrackToDevice(track, outputDeviceId, elementId)

      logDiv.innerHTML += `<p>Audio routing established for translator ${translatorId} to device ${outputDeviceId}</p>`
    })

    translator.onCaptions((caption) => {
      if (caption.type !== 'user-interim-transcript') {
        if (caption.transcript)
          logDiv.innerHTML += `<p>Caption (Translator ${translatorId}): ${caption.transcript}</p>`
      } else {
        interimCaptionsDiv.innerHTML = `<p>Live caption (Translator ${translatorId}): ${caption.transcript}</p>`
      }
    })
  } catch (err) {
    console.error(`Error adding translator ${translatorId}:`, err)

    document.getElementById(`addTranslator-${translatorId}`).disabled = false
    document
      .getElementById(`addTranslator-${translatorId}`)
      .classList.remove(
        'bg-zinc-700',
        'text-gray',
        'hover:bg-zinc-700',
        'hover:text-gray',
        'cursor-not-allowed',
      )
  }
}

async function populateAudioDevices() {
  try {
    await navigator.mediaDevices.getUserMedia({ audio: true })
    const devices = await navigator.mediaDevices.enumerateDevices()

    const audioInputSelect1 = document.getElementById('audioInput-1')
    const audioInputSelect2 = document.getElementById('audioInput-2')
    const audioOutputSelect1 = document.getElementById('audioOutput-1')
    const audioOutputSelect2 = document.getElementById('audioOutput-2')

    audioInputSelect1.innerHTML = ''
    audioInputSelect2.innerHTML = ''
    audioOutputSelect1.innerHTML = ''
    audioOutputSelect2.innerHTML = ''

    devices.forEach((device) => {
      if (device.kind === 'audioinput') {
        const option1 = new Option(
          device.label || `Mic ${audioInputSelect1.length + 1}`,
          device.deviceId,
        )
        const option2 = new Option(
          device.label || `Mic ${audioInputSelect2.length + 1}`,
          device.deviceId,
        )
        audioInputSelect1.appendChild(option1)
        audioInputSelect2.appendChild(option2)
      }
      if (device.kind === 'audiooutput') {
        const option1 = new Option(
          device.label || `Speaker ${audioOutputSelect1.length + 1}`,
          device.deviceId,
        )
        const option2 = new Option(
          device.label || `Speaker ${audioOutputSelect2.length + 1}`,
          device.deviceId,
        )
        audioOutputSelect1.appendChild(option1)
        audioOutputSelect2.appendChild(option2)
      }
    })
  } catch (err) {
    console.error('Error enumerating audio devices:', err)
  }
}

function populateLanguages() {
  const sourceLangSelect1 = document.getElementById('sourceLang-1')
  const sourceLangSelect2 = document.getElementById('sourceLang-2')
  const targetLangSelect1 = document.getElementById('targetLang-1')
  const targetLangSelect2 = document.getElementById('targetLang-2')

  try {
    const fromLanguages = Dubit.getSupportedLanguages()

    sourceLangSelect1.innerHTML = ''
    sourceLangSelect2.innerHTML = ''
    targetLangSelect1.innerHTML = ''
    targetLangSelect2.innerHTML = ''

    fromLanguages.forEach((lang) => {
      sourceLangSelect1.appendChild(new Option(lang.label, lang.langCode))
      sourceLangSelect2.appendChild(new Option(lang.label, lang.langCode))
      targetLangSelect1.appendChild(new Option(lang.label, lang.langCode))
      targetLangSelect2.appendChild(new Option(lang.label, lang.langCode))
    })

    // Set default language values
    sourceLangSelect1.value = 'hi'
    targetLangSelect1.value = 'en-US'
    sourceLangSelect2.value = 'en-US'
    targetLangSelect2.value = 'hi'
  } catch (err) {
    console.error('Error fetching supported languages:', err)
  }
}
