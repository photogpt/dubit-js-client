# Linux virtual audio setup for 2-way translation

This setup creates virtual audio devices for microphone and speaker use. Audio sent to InputToDubitMic becomes available as DubitMic (input), and audio sent to DubitSpeaker becomes available as OutputFromDubitSpeaker (input), perfect for routing application audio to virtual inputs.

## Commands

```bash
# Cleanup existing modules to avoid conflicts
pactl unload-module module-null-sink
pactl unload-module module-echo-cancel

# Mic Setup: InputToDubitMic (output) -> DubitMic (input)
pactl load-module module-null-sink sink_name=InputToDubitMic sink_properties=device.description=InputToDubitMic
pactl load-module module-null-sink sink_name=SilenceForEchoCancel sink_properties=device.description=SilenceForEchoCancel
pactl load-module module-echo-cancel sink_name=DubitMic source_name=DubitMic source_master=InputToDubitMic.monitor sink_master=SilenceForEchoCancel aec_method=null source_properties=device.description=DubitMic sink_properties=device.description=DubitMic

# Speaker Setup: DubitSpeaker (output) -> OutputFromDubitSpeaker (input)
pactl load-module module-null-sink sink_name=DubitSpeaker sink_properties=device.description=DubitSpeaker
pactl load-module module-null-sink sink_name=SilenceForSpeakerEchoCancel sink_properties=device.description=SilenceForSpeakerEchoCancel
pactl load-module module-echo-cancel sink_name=OutputFromDubitSpeaker source_name=OutputFromDubitSpeaker source_master=DubitSpeaker.monitor sink_master=SilenceForSpeakerEchoCancel aec_method=null source_properties=device.description=OutputFromDubitSpeaker sink_properties=device.description=OutputFromDubitSpeaker
```

## What It Does

- **Mic Setup:** Creates InputToDubitMic as a sink (output device) where applications send audio, which is then routed via InputToDubitMic.monitor through an echo-cancel module (with no actual cancellation) to DubitMic, a virtual source (input device).
- **Speaker Setup:** Creates DubitSpeaker as a sink (output device) for remote application audio, routed via DubitSpeaker.monitor through an echo-cancel module to OutputFromDubitSpeaker, a virtual source (input device).
- **Silence Sinks:** SilenceForEchoCancel and SilenceForSpeakerEchoCancel are dummy sinks required by module-echo-cancel but remain silent since aec_method=null.

## Usage

- **Mic:**
  - Set an application’s audio output to InputToDubitMic (e.g., via pavucontrol or system sound settings).
  - Use DubitMic as the input device in another application (e.g., Zoom, browser WebRTC).
- **Speaker:**
  - Set a remote application’s audio output to DubitSpeaker.
  - Use OutputFromDubitSpeaker as the input device in another application (e.g., a recorder or WebRTC).

## Diagram

```
+--------------------------------------------------------------------------+
| Mic Flow:                                                                |
| User's Mic --> Dubit --> [InputToDubitMic]                               |
|          (via pavucontrol)  (sink)                                       |
|                        |                                                 |
|                        v                                                 |
| [InputToDubitMic.monitor] --> [Echo-Cancel] --> [DubitMic] --> Zoom/Meet |
|                       (uses SilenceForEchoCancel)            (source)    |
+--------------------------------------------------------------------------+
+---------------------------------------------------------------------------------------------------+
| Speaker Flow:                                                                                     |
| Zoom/Meet --> [DubitSpeaker]                                                                      |
|         (via pavucontrol) (sink)                                                                  |
|                   |                                                                               |
|                   v                                                                               |
| [DubitSpeaker.monitor] --> [Echo-Cancel] --> [OutputFromDubitSpeaker] --> Dubit --> User's Speaker|
|                       (uses SilenceForSpeakerEchoCancel)                                          |
+---------------------------------------------------------------------------------------------------+
```
