# AI tools catalog (reference)

This document tracks the data used on the **AI tools** page in the app. The **canonical** list is:

- `client/src/data/aiTools.json` (v2+ adds project, video, music/audio, and electronics/Arduino/maker tools)

**Card logos** on `/ai-tools` are pulled from a public favicon service using each row’s public link hostname, or the optional `logoHost` when you need a clearer mark than the product URL’s subdomain (see `meta.notes` in the JSON).

When you add or change a tool, edit the JSON first, then keep this file roughly aligned (full rows are not duplicated here; use the file or filter the built page).

| Area | Category id (JSON) | Examples in catalog |
| --- | --- | --- |
| Chat & code & search & design (original set) | `chat`, `code`, `search`, `image` | ChatGPT, Copilot, Perplexity, Google AI Studio, Figma AI, … |
| **Project & planning** | `project` | Motion, Reclaim, Linear, ClickUp, Asana, monday, Notion workspace |
| **Video & motion** | `video` | Runway, Pika, Descript, CapCut, InVideo, Synthesia |
| **Music & audio** | `audio` | Suno, Udio, Adobe speech enhancement, LANDR |
| **Electronics, Arduino, PCB** | `hardware` | Arduino official, Tinkercad, Wokwi, SnapEDA, Flux, Fritzing, KiCad, EasyEDA |
| Other productivity | `other` | Otter.ai, … |

Notes:

- **Direct URL** in JSON means the public product or app page you can open to use the tool, where a stable path exists.
- Access, pricing, and feature flags change on third party sites. Confirm on the provider before you rely on a product.

**Internal app hub:** `/ai-tools`.
