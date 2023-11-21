import { defineManifest } from '@crxjs/vite-plugin'

export const manifest = defineManifest({
  manifest_version: 3,
  name: 'RA Timecard Autofiller',
  description: 'Help RAs fill in the timecard on My Waseda',
  version: '1.0',
  icons: {
    16: 'icons/icon-16.png',
    38: 'icons/icon-38.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  action: {
    default_icon: "icons/icon-128.png",
    default_title: "RA Timecard Autofiller",
    default_popup: "src/popup.html"
  },
  content_scripts: [
    {
      matches: ["https://www.wpte.waseda.jp/*"],
      js: ["src/content.ts"],
      run_at: "document_end"
    }
  ],
})