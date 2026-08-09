# UGC Ad Script Engine

**OMEGA SWARM v10 · Limitless · Cloud-ready · 10/10**

Production React engine for structured UGC ad scripts via Anthropic (live streaming).

**GitHub:** complete on `main`  
**No phone / no HP required** — source of truth is this repo + cloud host.

## Live features

- Live streaming from Anthropic API
- 1–3 variants with tab switcher
- Structured: HOOK · PROBLEM · BRIDGE · PROOF · CTA · DIRECTOR NOTE · ESTIMATED RUNTIME
- Copy + Download All for creator handoff
- Platforms: TikTok · Reels · Facebook · YouTube Shorts
- 6 hook styles · 6 tones (incl. Spiritual/Taqwa) · 5 objectives
- Sharia compliance toggle
- Session history (last 10) in browser localStorage
- Dark-luxury black/gold Limitless UI

## Cloud

- Repo is Vite + React; deploy to Vercel (or any static host).
- `vercel.json` included for SPA routing.
- Project: `ugc-ad-script-engine` (Vercel team limitless-mindset)
- Paste Anthropic API key in the header (browser-only storage).

## Local (optional)

```bash
git clone https://github.com/planlifegrateful-lang/Ugc-business--os.git
cd Ugc-business--os
npm install
npm run dev
```

## Related stack (GitHub)

| Repo | Role |
|------|------|
| [Ugc-business--os](https://github.com/planlifegrateful-lang/Ugc-business--os) | This engine |
| [ai-ugc](https://github.com/planlifegrateful-lang/ai-ugc) | Zero-API content agent |
| [Planlife-agent0-openmanus](https://github.com/planlifegrateful-lang/Planlife-agent0-openmanus) | Video pipeline + Manus tasks |
| [Ugc-business-os](https://github.com/planlifegrateful-lang/Ugc-business-os) | Integration shell |

Manus cloud task: `OpenManus/TASK_PROMPT_cloud_complete.md` in Planlife-agent0-openmanus.
