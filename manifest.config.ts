import { defineManifest } from '@crxjs/vite-plugin'

export const manifest = defineManifest({
  manifest_version: 3,
  name: 'RA Timecard Autofiller',
  description: 'Help RAs fill in the timecard on MyWaseda',
  version: '0.1.1',
  icons: {
    16: 'icons/icon-16.png',
    38: 'icons/icon-32.png',
    48: 'icons/icon-48.png',
    128: 'icons/icon-128.png',
  },
  action: {
    default_icon: { 48: 'icons/icon-48.png' },
    default_title: "RA Timecard Autofiller",
  },
  background: {
    service_worker: "src/background.ts"
  },
  content_scripts: [
    {
      matches: ["https://www.wpte.waseda.jp/*"],
      js: ["src/content.ts", "src/bootstrap.esm.min.js"],
      css: ["src/bootstrap.min.css"],
      run_at: "document_end"
    }
  ],
  web_accessible_resources: [
    {
      resources: ["src/bootstrap.min.css"],
      matches: ["https://www.wpte.waseda.jp/*"]
    }
  ],
  permissions: ["activeTab"]
})