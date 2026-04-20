import * as T from "three";

export const ISO_HOUSE_COLORS = {
  wall: 0xf0e5c8, // main building walls
  wallBase: 0xe8d4a8, // base slab under the walls
  roofLower: 0xb5523a, // darker underside / shadow layer of roof
  roofUpper: 0xdd7359, // main visible roof colour
  roofEdge: 0xe89060, // thin band between wall and roof
  lawn: 0x70a771, // circular grass platform
  path: 0xf2ead0, // front path strip
  door: 0x6a8c70, // front door + railings
  doorStep: 0x80a888, // step in front of door
  doorKnob: 0xe0b850, // door handle
  chimney: 0xc8b89c, // chimney shaft
  chimneyCap: 0xb4a48c, // chimney cap slab
  winFrame: 0xd8d0b8, // window frame + dividers
  winGlass: 0xb8d4d8, // window glass (also set opacity below)
  treeTrunk: 0xc4b894, // tree trunk
  treeLo: 0x8fc88f, // lower/larger tree tier
  treeHi: 0x70a771, // upper/smaller tree tier
  bush: 0x9bcb9b, // round shrubs by the path
  panelBase: 0x3a5a8c, // solar panel body (blue)
  panelFrame: 0xc8c8c8, // solar panel aluminium frame
  panelCell: 0x2a4a7c, // individual cell lines on panel
} as const;

export type IsoHouseModelOptions = {
  /**
   * Roof face slope multiplier.
   * Increase to tilt panels more upright; decrease to lay them flatter.
   * 1.0 = exactly matches the roof face angle (default).
   */
  panelSlopeMultiplier?: number;
  /** Window glass opacity (0 = invisible, 1 = solid). */
  windowGlassOpacity?: number;
};

export function buildIsoHouseModel({
  panelSlopeMultiplier = -0.8,
  windowGlassOpacity = 0.8,
}: IsoHouseModelOptions = {}) {
  const houseRoot = new T.Group();
  houseRoot.scale.setScalar(0.001);

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
    houseRoot.add(m);
    return m;
  };

  const groundMat = new T.MeshLambertMaterial({ color: 0xd8ecd8, transparent: true, opacity: 0 });
  const ground = new T.Mesh(new T.PlaneGeometry(14, 14), groundMat);
  ground.rotation.x = -Math.PI / 2;
  ground.position.y = -0.01;
  ground.receiveShadow = true;
  houseRoot.add(ground);

  mk(new T.CylinderGeometry(3.8, 4.0, 0.18, 32, 1), ISO_HOUSE_COLORS.lawn, 0, -0.09, 0, false, true);
  mk(new T.BoxGeometry(0.9, 0.04, 2.5), ISO_HOUSE_COLORS.path, 0, 0.03, 2.2, false, false);
  mk(new T.BoxGeometry(4.2, 0.18, 3.5), ISO_HOUSE_COLORS.wallBase, 0, 0.09, 0);
  mk(new T.BoxGeometry(4.0, 2.1, 3.3), ISO_HOUSE_COLORS.wall, 0, 1.14, 0);
  mk(new T.BoxGeometry(4.2, 0.12, 3.5), ISO_HOUSE_COLORS.roofEdge, 0, 2.25, 0);

  const rg = new T.CylinderGeometry(0, 2.7, 1.45, 4, 1);
  rg.rotateY(Math.PI / 4);
  const roofM = new T.Mesh(rg, new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.roofUpper }));
  roofM.position.set(0, 3.02, 0);
  roofM.castShadow = true;
  houseRoot.add(roofM);

  const roofU = new T.Mesh(
    new T.CylinderGeometry(0, 2.75, 1.47, 4, 1),
    new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.roofLower }),
  );
  roofU.position.set(0, 3.01, 0);
  roofU.rotation.y = Math.PI / 4;
  houseRoot.add(roofU);

  mk(new T.BoxGeometry(0.38, 1.1, 0.38), ISO_HOUSE_COLORS.chimney, -0.9, 3.18, -0.7);
  mk(new T.BoxGeometry(0.44, 0.1, 0.44), ISO_HOUSE_COLORS.chimneyCap, -0.9, 3.75, -0.7);

  mk(new T.BoxGeometry(0.7, 1.18, 0.1), ISO_HOUSE_COLORS.door, 0, 0.59, 1.71);
  mk(new T.SphereGeometry(0.065, 8, 8), ISO_HOUSE_COLORS.doorKnob, 0.25, 0.52, 1.78);
  mk(new T.BoxGeometry(1.1, 0.07, 0.55), ISO_HOUSE_COLORS.doorStep, 0, 1.25, 1.88);
  mk(new T.BoxGeometry(0.04, 0.32, 0.04), ISO_HOUSE_COLORS.door, -0.48, 1.09, 1.72);
  mk(new T.BoxGeometry(0.04, 0.32, 0.04), ISO_HOUSE_COLORS.door, 0.48, 1.09, 1.72);

  const addWin = (x: number, y: number, z: number, ry = 0) => {
    const off = ry === 0 ? 0.01 : 0;
    const fr = new T.Mesh(
      new T.BoxGeometry(0.8, 0.65, 0.09),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.winFrame }),
    );
    fr.position.set(x, y, z);
    fr.rotation.y = ry;
    houseRoot.add(fr);

    const gl = new T.Mesh(
      new T.BoxGeometry(0.62, 0.5, 0.07),
      new T.MeshLambertMaterial({
        color: ISO_HOUSE_COLORS.winGlass,
        transparent: true,
        opacity: windowGlassOpacity,
      }),
    );
    gl.position.set(x, y, z + off);
    gl.rotation.y = ry;
    houseRoot.add(gl);

    const hb = new T.Mesh(
      new T.BoxGeometry(0.64, 0.04, 0.08),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.winFrame }),
    );
    hb.position.set(x, y, z + off + 0.01);
    hb.rotation.y = ry;
    houseRoot.add(hb);

    const vb = new T.Mesh(
      new T.BoxGeometry(0.04, 0.52, 0.08),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.winFrame }),
    );
    vb.position.set(x, y, z + off + 0.01);
    vb.rotation.y = ry;
    houseRoot.add(vb);
  };

  addWin(-1.05, 1.38, 1.71);
  addWin(1.05, 1.38, 1.71);
  addWin(-1.05, 1.38, -1.71);
  addWin(1.05, 1.38, -1.71);
  addWin(-2.07, 1.38, -0.45, Math.PI / 2);
  addWin(-2.07, 1.38, 0.45, Math.PI / 2);
  addWin(2.07, 1.38, -0.45, Math.PI / 2);
  addWin(2.07, 1.38, 0.45, Math.PI / 2);

  // Solar panels sit on the roof face surface.
  const apothem = 2.7 * Math.cos(Math.PI / 4);
  const slopeAngle = Math.atan2(1.45, apothem) * panelSlopeMultiplier;

  const panelDefs: [number, number, number, number][] = [
    [-0.55, 2.74, 1.38, 0],
    [0.55, 2.74, 1.38, 0],
    [-0.55, 2.74, -1.38, Math.PI],
    [0.55, 2.74, -1.38, Math.PI],
  ];

  panelDefs.forEach(([px, py, pz, faceYaw]) => {
    const g = new T.Group();

    const base = new T.Mesh(
      new T.BoxGeometry(1.4, 0.06, 0.95),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.panelBase }),
    );
    base.castShadow = true;
    g.add(base);

    const frame = new T.Mesh(
      new T.BoxGeometry(1.44, 0.05, 0.99),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.panelFrame }),
    );
    frame.position.y = -0.005;
    g.add(frame);

    for (let ci = 0; ci < 4; ci++) {
      for (let cj = 0; cj < 3; cj++) {
        const cell = new T.Mesh(
          new T.BoxGeometry(0.3, 0.065, 0.27),
          new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.panelCell }),
        );
        cell.position.set(-0.49 + ci * 0.33, 0.005, -0.31 + cj * 0.31);
        g.add(cell);
      }
    }

    g.rotation.order = "YXZ";
    g.rotation.y = faceYaw;
    g.rotation.x = -slopeAngle;
    g.position.set(px, py, pz);
    houseRoot.add(g);
  });

  const addTree = (x: number, z: number, h = 1.3, r = 0.55) => {
    mk(new T.BoxGeometry(0.13, h * 0.5, 0.13), ISO_HOUSE_COLORS.treeTrunk, x, h * 0.25, z);
    const t1 = new T.Mesh(
      new T.CylinderGeometry(0, r, h * 0.72, 7, 1),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.treeLo }),
    );
    t1.position.set(x, h * 0.9, z);
    t1.castShadow = true;
    houseRoot.add(t1);

    const t2 = new T.Mesh(
      new T.CylinderGeometry(0, r * 0.75, h * 0.58, 7, 1),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.treeHi }),
    );
    t2.position.set(x, h * 1.15, z);
    t2.castShadow = true;
    houseRoot.add(t2);
  };
  addTree(-2.8, -0.3, 1.5, 0.62);
  addTree(-3.1, 1.0, 1.0, 0.45);
  addTree(2.9, -0.5, 1.4, 0.58);
  addTree(3.2, 0.8, 0.95, 0.42);
  addTree(-1.7, -2.8, 0.88, 0.38);
  addTree(1.7, -2.8, 0.82, 0.36);

  [
    [-1.5, 1.95],
    [1.5, 1.95],
  ].forEach(([sx, sz]) => {
    const s = new T.Mesh(
      new T.SphereGeometry(0.24, 8, 6),
      new T.MeshLambertMaterial({ color: ISO_HOUSE_COLORS.bush }),
    );
    s.position.set(sx, 0.2, sz);
    s.castShadow = true;
    houseRoot.add(s);
  });

  return { houseRoot };
}

