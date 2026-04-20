import { useEffect, useRef } from "react";
import * as T from "three";
import { buildIsoHouseModel } from "./isoHouseModel";

/** Scale intro: 0 → 1 with a slight overshoot (Penner out-back). */
function easeOutBack(x: number): number {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * (x - 1) ** 3 + c1 * (x - 1) ** 2;
}

// ─────────────────────────────────────────────────────────────────────────────

export function IsoHouse() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;

    const W = Math.max(wrap.clientWidth || 400, 340);
    const H = Math.max(wrap.clientHeight || 520, 420);
    canvas.width = W;
    canvas.height = H;

    const renderer = new T.WebGLRenderer({ canvas, antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = T.PCFSoftShadowMap;
    renderer.outputColorSpace = T.SRGBColorSpace;
    renderer.toneMapping = T.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.22;

    const scene = new T.Scene();
    const camera = new T.OrthographicCamera(-5, 5, (5 * H) / W, (-5 * H) / W, 0.1, 60);
    camera.position.set(9, 8, 9);
    camera.lookAt(0, 0.8, 0);

    // Warm, bright lighting only (no visible ray geometry).
    scene.add(new T.AmbientLight(0xffead8, 0.58));
    scene.add(new T.HemisphereLight(0xffdcc0, 0xa8c898, 0.48));

    const sun = new T.DirectionalLight(0xfff4e8, 1.45);
    sun.position.set(6, 10, 5);
    sun.castShadow = true;
    sun.shadow.mapSize.width = 1024;
    sun.shadow.mapSize.height = 1024;
    sun.shadow.bias = -0.00025;
    scene.add(sun);

    const fill = new T.DirectionalLight(0xffdcc8, 0.38);
    fill.position.set(-4.5, 4.5, -3.5);
    scene.add(fill);
    const fill2 = new T.DirectionalLight(0xffeef4, 0.28);
    fill2.position.set(0, -1.5, 7);
    scene.add(fill2);

    const { houseRoot } = buildIsoHouseModel();
    scene.add(houseRoot);
    const pivot = new T.Group();
    scene.add(pivot);
    let isDrag = false;
    let prevX = 0;
    let rotY = 0;

    const onDown = (e: MouseEvent) => {
      isDrag = true;
      prevX = e.clientX;
      canvas.style.cursor = "grabbing";
    };
    const onUp = () => {
      isDrag = false;
      canvas.style.cursor = "grab";
    };
    const onMove = (e: MouseEvent) => {
      if (!isDrag) return;
      rotY -= (e.clientX - prevX) * 0.009;
      prevX = e.clientX;
      pivot.rotation.y = rotY;
    };
    const onTStart = (e: TouchEvent) => {
      isDrag = true;
      prevX = e.touches[0].clientX;
    };
    const onTEnd = () => {
      isDrag = false;
    };
    const onTMove = (e: TouchEvent) => {
      if (!isDrag) return;
      rotY -= (e.touches[0].clientX - prevX) * 0.009;
      prevX = e.touches[0].clientX;
      pivot.rotation.y = rotY;
    };

    canvas.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchstart", onTStart, { passive: true });
    canvas.addEventListener("touchend", onTEnd);
    canvas.addEventListener("touchmove", onTMove, { passive: true });
    canvas.style.cursor = "grab";

    const introStart = performance.now();
    const introMs = 920;

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
      const introT = Math.min(1, (performance.now() - introStart) / introMs);
      const s = Math.max(0.001, easeOutBack(introT));
      houseRoot.scale.setScalar(s);

      if (!isDrag) pivot.rotation.y += 0.004;
      const ry = pivot.rotation.y;
      camera.position.set(Math.sin(ry) * 14, 9, Math.cos(ry) * 14);
      camera.lookAt(0, 0.8, 0);
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      const nW = Math.max(wrap.clientWidth || 400, 340);
      const nH = Math.max(wrap.clientHeight || 520, 420);
      renderer.setSize(nW, nH);
      camera.left = -5;
      camera.right = 5;
      camera.top = (5 * nH) / nW;
      camera.bottom = (-5 * nH) / nW;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", onResize);
      canvas.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchstart", onTStart);
      canvas.removeEventListener("touchend", onTEnd);
      canvas.removeEventListener("touchmove", onTMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full min-h-[520px] w-full overflow-visible">
      <canvas ref={canvasRef} className="mt-[-3rem] block h-full w-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 border border-[var(--siq-border)] bg-[rgba(252,250,239,0.7)] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)] backdrop-blur-sm whitespace-nowrap">
        Drag to rotate
      </div>
    </div>
  );
}

