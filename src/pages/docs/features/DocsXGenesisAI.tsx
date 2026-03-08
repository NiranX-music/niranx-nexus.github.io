import { DocPage, DocCallout } from "@/components/docs/DocPage";

export default function DocsXGenesisAI() {
  return (
    <DocPage breadcrumb="Features › XGenesis AI" title="XGenesis AI" description="Unlimited access to 50+ frontier AI models for chat, vision, image generation, video, and audio.">
      <h2>Overview</h2>
      <p>XGenesis AI is NiranX's premium AI interface providing access to cutting-edge models across multiple modalities. It features real-time streaming, image upload for vision models, and a full models directory.</p>

      <h2>Chat Models</h2>
      <p>17+ text models available including:</p>
      <ul>
        <li>DeepSeek V3 and R1 — Advanced reasoning</li>
        <li>Qwen3 — Multilingual excellence</li>
        <li>Kimi — Long context specialist</li>
        <li>Gemma, Phi, and more</li>
      </ul>

      <h2>Image Generation</h2>
      <p>10 image generation models with configurable sizes:</p>
      <ul>
        <li>Flux Pro, Flux Schnell — Fast high-quality generation</li>
        <li>SDXL — Stable Diffusion XL</li>
        <li>Gemini image models</li>
      </ul>

      <h2>Video & Audio</h2>
      <p>The models directory includes Seedance and Veo for video generation, and MIDIjourney for audio/music generation.</p>

      <DocCallout type="tip" title="Vision Models">
        Models marked with a camera icon support image uploads. Upload an image and ask questions about it for visual analysis.
      </DocCallout>
    </DocPage>
  );
}
