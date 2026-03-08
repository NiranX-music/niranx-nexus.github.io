import { DocPage } from "@/components/docs/DocPage";

export default function DocsVirtualLabs() {
  return (
    <DocPage breadcrumb="Features › Virtual Labs" title="Virtual Labs" description="Interactive science simulations for Chemistry, Physics, Biology, and Mathematics.">
      <h2>Chemistry Lab</h2>
      <p>Interactive periodic table, chemical reaction simulator, molecular visualization, and element property explorer. Mix compounds and observe reactions in real-time.</p>

      <h2>Physics Lab</h2>
      <p>Physics simulations including projectile motion, wave interference, circuit building, and mechanics demonstrations with adjustable parameters.</p>

      <h2>Biology Lab</h2>
      <p>Explore cell structures, DNA sequences, ecosystem simulations, and anatomy models with interactive 3D views.</p>

      <h2>Math Lab</h2>
      <p>Scientific and graphing calculator, trigonometry tools, function plotting, and step-by-step equation solver.</p>

      <h2>Collaborative Experiments</h2>
      <p>Save experiments, share them with classmates, and collaborate on lab reports. Public experiments are accessible to all users.</p>
    </DocPage>
  );
}
