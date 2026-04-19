import { useEffect, useRef } from "react";
import * as T from "three";

// ─── CUSTOMISE HERE ──────────────────────────────────────────────────────────

const COLORS = {
  wall:       0xF0E5C8, // main building walls
  wallBase:   0xe8d4a8, // base slab under the walls
  roofLower:  0xb5523a, // darker underside / shadow layer of roof
  roofUpper:  0xDD7359, // main visible roof colour
  roofEdge:   0xe89060, // thin band between wall and roof
  lawn:       0x70a771, // circular grass platform
  path:       0xf2ead0, // front path strip
  door:       0x6a8c70, // front door + railings
  doorStep:   0x80a888, // step in front of door
  doorKnob:   0xe0b850, // door handle
  chimney:    0xc8b89c, // chimney shaft
  chimneyCap: 0xb4a48c, // chimney cap slab
  winFrame:   0xd8d0b8, // window frame + dividers
  winGlass:   0xb8d4d8, // window glass (also set opacity below)
  treeTrunk:  0xc4b894, // tree trunk
  treeLo:     0x8fc88f, // lower/larger tree tier
  treeHi:     0x70a771, // upper/smaller tree tier
  bush:       0x9bcb9b, // round shrubs by the path
  panelBase:  0x3a5a8c, // solar panel body (blue)
  panelFrame: 0xc8c8c8, // solar panel aluminium frame
  panelCell:  0x2a4a7c, // individual cell lines on panel
};

// Roof slope: auto-calculated from the pyramid geometry.
// Increase to tilt panels more upright; decrease to lay them flatter.
// 1.0 = exactly matches the roof face angle (default). Try 0.8–1.2 to fine-tune.
const PANEL_SLOPE_MULTIPLIER = -0.8;

// Window glass opacity (0 = invisible, 1 = solid)
const WIN_GLASS_OPACITY = 0.8;

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

    const mk = (
      geo: T.BufferGeometry,
      color: number,
      x: number,
      y: number,
      z: number,
      cast = true,
      recv = true,
    ) => {
      const m = new T.Mesh(geo, new T.MeshLambertMaterial({ color }));
      m.position.set(x, y, z);
      m.castShadow = cast;
      m.receiveShadow = recv;
      scene.add(m);
      return m;
    };

    const groundMat = new T.MeshLambertMaterial({ color: 0xd8ecd8, transparent: true, opacity: 0 });
    const ground = new T.Mesh(new T.PlaneGeometry(14, 14), groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = -0.01;
    ground.receiveShadow = true;
    scene.add(ground);

    mk(new T.CylinderGeometry(3.8, 4.0, 0.18, 32, 1), COLORS.lawn,     0,    -0.09, 0,   false, true);
    mk(new T.BoxGeometry(0.9, 0.04, 2.5),              COLORS.path,     0,     0.03, 2.2, false, false);
    mk(new T.BoxGeometry(4.2, 0.18, 3.5),              COLORS.wallBase, 0,     0.09, 0);
    mk(new T.BoxGeometry(4.0, 2.1,  3.3),              COLORS.wall,     0,     1.14, 0);
    mk(new T.BoxGeometry(4.2, 0.12, 3.5),              COLORS.roofEdge, 0,     2.25, 0);

    const rg = new T.CylinderGeometry(0, 2.7, 1.45, 4, 1);
    rg.rotateY(Math.PI / 4);
    const roofM = new T.Mesh(rg, new T.MeshLambertMaterial({ color: COLORS.roofUpper }));
    roofM.position.set(0, 3.02, 0);
    roofM.castShadow = true;
    scene.add(roofM);

    const roofU = new T.Mesh(
      new T.CylinderGeometry(0, 2.75, 1.47, 4, 1),
      new T.MeshLambertMaterial({ color: COLORS.roofLower }),
    );
    roofU.position.set(0, 3.01, 0);
    roofU.rotation.y = Math.PI / 4;
    scene.add(roofU);

    mk(new T.BoxGeometry(0.38, 1.1,  0.38), COLORS.chimney,    -0.9, 3.18, -0.7);
    mk(new T.BoxGeometry(0.44, 0.1,  0.44), COLORS.chimneyCap, -0.9, 3.75, -0.7);

    mk(new T.BoxGeometry(0.7,  1.18, 0.1),  COLORS.door,     0,     0.59, 1.71);
    mk(new T.SphereGeometry(0.065, 8, 8),   COLORS.doorKnob, 0.25,  0.52, 1.78);
    mk(new T.BoxGeometry(1.1,  0.07, 0.55), COLORS.doorStep, 0,     1.25, 1.88);
    mk(new T.BoxGeometry(0.04, 0.32, 0.04), COLORS.door,    -0.48,  1.09, 1.72);
    mk(new T.BoxGeometry(0.04, 0.32, 0.04), COLORS.door,     0.48,  1.09, 1.72);

    const addWin = (x: number, y: number, z: number, ry = 0) => {
      const off = ry === 0 ? 0.01 : 0;
      const fr = new T.Mesh(new T.BoxGeometry(0.8,  0.65, 0.09), new T.MeshLambertMaterial({ color: COLORS.winFrame }));
      fr.position.set(x, y, z); fr.rotation.y = ry; scene.add(fr);
      const gl = new T.Mesh(new T.BoxGeometry(0.62, 0.5,  0.07), new T.MeshLambertMaterial({ color: COLORS.winGlass, transparent: true, opacity: WIN_GLASS_OPACITY }));
      gl.position.set(x, y, z + off); gl.rotation.y = ry; scene.add(gl);
      const hb = new T.Mesh(new T.BoxGeometry(0.64, 0.04, 0.08), new T.MeshLambertMaterial({ color: COLORS.winFrame }));
      hb.position.set(x, y, z + off + 0.01); hb.rotation.y = ry; scene.add(hb);
      const vb = new T.Mesh(new T.BoxGeometry(0.04, 0.52, 0.08), new T.MeshLambertMaterial({ color: COLORS.winFrame }));
      vb.position.set(x, y, z + off + 0.01); vb.rotation.y = ry; scene.add(vb);
    };
    addWin(-1.05, 1.38,  1.71);
    addWin( 1.05, 1.38,  1.71);
    addWin(-1.05, 1.38, -1.71);
    addWin( 1.05, 1.38, -1.71);
    addWin(-2.07, 1.38, -0.45, Math.PI / 2);
    addWin(-2.07, 1.38,  0.45, Math.PI / 2);
    addWin( 2.07, 1.38, -0.45, Math.PI / 2);
    addWin( 2.07, 1.38,  0.45, Math.PI / 2);

    // Solar panels sit on the roof face surface.
    // slopeAngle matches the pyramid face exactly; panels are nudged down
    // along the face so they rest on the roof rather than floating above it.
    const apothem = 2.7 * Math.cos(Math.PI / 4);
    const slopeAngle = Math.atan2(1.45, apothem) * PANEL_SLOPE_MULTIPLIER;

    // [posX, posY, posZ, faceYaw]
    // Dropped Y from 3.28 → 2.98 and pushed Z outward to sit on the slope.
    const panelDefs: [number, number, number, number][] = [
      [-0.55, 2.74,  1.38, 0],
      [ 0.55, 2.74,  1.38, 0],
      [-0.55, 2.74, -1.38, Math.PI],
      [ 0.55, 2.74, -1.38, Math.PI],
    ];

    panelDefs.forEach(([px, py, pz, faceYaw]) => {
      const g = new T.Group();

      const base = new T.Mesh(
        new T.BoxGeometry(1.4, 0.06, 0.95),
        new T.MeshLambertMaterial({ color: COLORS.panelBase }),
      );
      base.castShadow = true;
      g.add(base);

      const frame = new T.Mesh(
        new T.BoxGeometry(1.44, 0.05, 0.99),
        new T.MeshLambertMaterial({ color: COLORS.panelFrame }),
      );
      frame.position.y = -0.005;
      g.add(frame);

      for (let ci = 0; ci < 4; ci++)
        for (let cj = 0; cj < 3; cj++) {
          const cell = new T.Mesh(
            new T.BoxGeometry(0.3, 0.065, 0.27),
            new T.MeshLambertMaterial({ color: COLORS.panelCell }),
          );
          cell.position.set(-0.49 + ci * 0.33, 0.005, -0.31 + cj * 0.31);
          g.add(cell);
        }

      g.rotation.order = "YXZ";
      g.rotation.y = faceYaw;
      g.rotation.x = -slopeAngle;
      g.position.set(px, py, pz);
      scene.add(g);
    });

    const addTree = (x: number, z: number, h = 1.3, r = 0.55) => {
      mk(new T.BoxGeometry(0.13, h * 0.5, 0.13), COLORS.treeTrunk, x, h * 0.25, z);
      const t1 = new T.Mesh(new T.CylinderGeometry(0, r, h * 0.72, 7, 1), new T.MeshLambertMaterial({ color: COLORS.treeLo }));
      t1.position.set(x, h * 0.9, z); t1.castShadow = true; scene.add(t1);
      const t2 = new T.Mesh(new T.CylinderGeometry(0, r * 0.75, h * 0.58, 7, 1), new T.MeshLambertMaterial({ color: COLORS.treeHi }));
      t2.position.set(x, h * 1.15, z); t2.castShadow = true; scene.add(t2);
    };
    addTree(-2.8, -0.3, 1.5, 0.62);
    addTree(-3.1,  1.0, 1.0, 0.45);
    addTree( 2.9, -0.5, 1.4, 0.58);
    addTree( 3.2,  0.8, 0.95, 0.42);
    addTree(-1.7, -2.8, 0.88, 0.38);
    addTree( 1.7, -2.8, 0.82, 0.36);

    [[-1.5, 1.95], [0, 2.0], [1.5, 1.95]].forEach(([sx, sz]) => {
      const s = new T.Mesh(new T.SphereGeometry(0.24, 8, 6), new T.MeshLambertMaterial({ color: COLORS.bush }));
      s.position.set(sx, 0.2, sz); s.castShadow = true; scene.add(s);
    });

    const pivot = new T.Group();
    scene.add(pivot);
    let isDrag = false;
    let prevX = 0;
    let rotY = 0;

    const onDown   = (e: MouseEvent)  => { isDrag = true;  prevX = e.clientX; canvas.style.cursor = "grabbing"; };
    const onUp     = ()               => { isDrag = false; canvas.style.cursor = "grab"; };
    const onMove   = (e: MouseEvent)  => { if (!isDrag) return; rotY -= (e.clientX - prevX) * 0.009; prevX = e.clientX; pivot.rotation.y = rotY; };
    const onTStart = (e: TouchEvent)  => { isDrag = true;  prevX = e.touches[0].clientX; };
    const onTEnd   = ()               => { isDrag = false; };
    const onTMove  = (e: TouchEvent)  => { if (!isDrag) return; rotY -= (e.touches[0].clientX - prevX) * 0.009; prevX = e.touches[0].clientX; pivot.rotation.y = rotY; };

    canvas.addEventListener("mousedown",  onDown);
    window.addEventListener("mouseup",    onUp);
    window.addEventListener("mousemove",  onMove);
    canvas.addEventListener("touchstart", onTStart, { passive: true });
    canvas.addEventListener("touchend",   onTEnd);
    canvas.addEventListener("touchmove",  onTMove,  { passive: true });
    canvas.style.cursor = "grab";

    let raf = 0;
    const animate = () => {
      raf = requestAnimationFrame(animate);
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
      camera.left = -5; camera.right = 5;
      camera.top = (5 * nH) / nW; camera.bottom = (-5 * nH) / nW;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize",     onResize);
      canvas.removeEventListener("mousedown",  onDown);
      window.removeEventListener("mouseup",    onUp);
      window.removeEventListener("mousemove",  onMove);
      canvas.removeEventListener("touchstart", onTStart);
      canvas.removeEventListener("touchend",   onTEnd);
      canvas.removeEventListener("touchmove",  onTMove);
      renderer.dispose();
    };
  }, []);

  return (
    <div ref={wrapRef} className="relative h-full min-h-[520px] w-full overflow-visible">
      <canvas ref={canvasRef} className="block h-full w-full" />
      <div className="absolute bottom-6 left-1/2 -translate-x-1/2 border border-[var(--siq-border)] bg-[rgba(252,250,239,0.7)] px-3.5 py-1.5 text-[9px] uppercase tracking-[0.1em] text-[color:var(--siq-fg-muted)] backdrop-blur-sm whitespace-nowrap">
        Drag to rotate
      </div>
    </div>
  );
}