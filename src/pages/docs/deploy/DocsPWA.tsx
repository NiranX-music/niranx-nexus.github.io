import { DocPage } from "@/components/docs/DocPage";
export default function DocsPWA() {
  return (
    <DocPage breadcrumb="Deploy › PWA" title="PWA & Extensions" description="Install NiranX as a Progressive Web App and sync data with the browser extension.">
      <h2>Progressive Web App</h2>
      <p>NiranX is a full PWA with offline support, push notifications, and installability. Download it from the PWA page or use your browser's install prompt.</p>
      <h2>TWA (Trusted Web Activity)</h2>
      <p>For Android users, NiranX can be installed as a TWA for a native app-like experience through the Google Play Store.</p>
      <h2>Browser Extension</h2>
      <p>The NiranX browser extension syncs bookmarks, browsing data, and provides quick access to AI tools from any website.</p>
    </DocPage>
  );
}
