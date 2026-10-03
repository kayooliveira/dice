import * as THREE from 'three';

const IVORY = 0xf6f1e7;
const INK = '#1e1b4b';
const EDGE = 0x312e81;

const FACING_TARGET = new THREE.Vector3(0, 0, 1);

function ivoryMaterial() {
    return new THREE.MeshStandardMaterial({
        color: IVORY,
        roughness: 0.38,
        metalness: 0.04,
        flatShading: true
    });
}

function edgeMaterial() {
    return new THREE.LineBasicMaterial({ color: EDGE });
}

function numberTexture(value) {
    const size = 256;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, size, size);
    ctx.fillStyle = INK;
    const label = String(value);
    const fontSize = label.length > 1 ? 148 : 188;
    ctx.font = `700 ${fontSize}px Inter, system-ui, sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, size / 2, size / 2 + fontSize * 0.04);
    const texture = new THREE.CanvasTexture(canvas);
    texture.anisotropy = 8;
    texture.colorSpace = THREE.SRGBColorSpace;
    texture.needsUpdate = true;
    return texture;
}

function labelMaterial(value) {
    return new THREE.MeshBasicMaterial({
        map: numberTexture(value),
        transparent: true,
        depthWrite: false,
        polygonOffset: true,
        polygonOffsetFactor: -4,
        polygonOffsetUnits: -4,
        side: THREE.FrontSide
    });
}

function eachTriangle(geometry, cb) {
    const pos = geometry.attributes.position;
    const index = geometry.index;
    const vertex = (i) => new THREE.Vector3(pos.getX(i), pos.getY(i), pos.getZ(i));
    const count = index ? index.count : pos.count;
    for (let i = 0; i < count; i += 3) {
        const ia = index ? index.getX(i) : i;
        const ib = index ? index.getX(i + 1) : i + 1;
        const ic = index ? index.getX(i + 2) : i + 2;
        const a = vertex(ia);
        const b = vertex(ib);
        const c = vertex(ic);
        const normal = b.clone().sub(a).cross(c.clone().sub(a));
        if (normal.lengthSq() < 1e-10) continue;
        normal.normalize();
        const centroid = a.clone().add(b).add(c).multiplyScalar(1 / 3);
        if (normal.dot(centroid) < 0) normal.negate();
        cb({ a, b, c, normal });
    }
}

function clusterTriangles(tris, minDot) {
    const groups = [];
    for (const tri of tris) {
        let group = null;
        for (const candidate of groups) {
            if (candidate.normal.dot(tri.normal) >= minDot) {
                group = candidate;
                break;
            }
        }
        if (!group) {
            group = { normal: tri.normal.clone(), tris: [] };
            groups.push(group);
        }
        group.tris.push(tri);
    }
    for (const group of groups) {
        const normal = new THREE.Vector3();
        for (const tri of group.tris) normal.add(tri.normal);
        group.normal.copy(normal.normalize());
    }
    return groups;
}

function faceCenter(group) {
    const unique = new Map();
    for (const tri of group.tris) {
        for (const point of [tri.a, tri.b, tri.c]) {
            const key = `${point.x.toFixed(4)}|${point.y.toFixed(4)}|${point.z.toFixed(4)}`;
            if (!unique.has(key)) unique.set(key, point);
        }
    }
    const center = new THREE.Vector3();
    for (const point of unique.values()) center.add(point);
    center.multiplyScalar(1 / unique.size);
    group.points = [...unique.values()];
    return center;
}

function boundaryEdges(tris) {
    const counts = new Map();
    const add = (a, b) => {
        const ka = `${a.x.toFixed(4)}|${a.y.toFixed(4)}|${a.z.toFixed(4)}`;
        const kb = `${b.x.toFixed(4)}|${b.y.toFixed(4)}|${b.z.toFixed(4)}`;
        const key = ka < kb ? `${ka}>${kb}` : `${kb}>${ka}`;
        if (!counts.has(key)) counts.set(key, { a, b, n: 0 });
        counts.get(key).n += 1;
    };
    for (const tri of tris) {
        add(tri.a, tri.b);
        add(tri.b, tri.c);
        add(tri.c, tri.a);
    }
    return [...counts.values()].filter((edge) => edge.n === 1);
}

function pointSegmentDistance(point, a, b) {
    const ab = b.clone().sub(a);
    const lengthSq = ab.lengthSq();
    if (lengthSq < 1e-12) return point.distanceTo(a);
    const t = Math.max(0, Math.min(1, point.clone().sub(a).dot(ab) / lengthSq));
    return point.distanceTo(a.clone().add(ab.multiplyScalar(t)));
}

function faceInradius(center, tris) {
    const edges = boundaryEdges(tris);
    let min = Infinity;
    for (const edge of edges) {
        min = Math.min(min, pointSegmentDistance(center, edge.a, edge.b));
    }
    return min;
}

function addLabel(parent, faces, value, center, normal, size) {
    const n = normal.clone().normalize();
    let reference = new THREE.Vector3(0, 1, 0);
    if (Math.abs(n.dot(reference)) > 0.92) reference = new THREE.Vector3(0, 0, 1);
    const x = new THREE.Vector3().crossVectors(reference, n).normalize();
    const y = new THREE.Vector3().crossVectors(n, x).normalize();

    const label = new THREE.Mesh(new THREE.PlaneGeometry(size, size), labelMaterial(value));
    label.position.copy(center).addScaledVector(n, Math.max(0.02, size * 0.04));
    label.quaternion.setFromRotationMatrix(new THREE.Matrix4().makeBasis(x, y, n));
    label.renderOrder = 2;
    parent.add(label);
    faces.push({ value, normal: n.clone(), up: y.clone() });
}

function sortGroups(groups) {
    return groups.sort((a, b) => {
        const dy = b.center.y - a.center.y;
        if (Math.abs(dy) > 0.12) return dy;
        return Math.atan2(a.center.z, a.center.x) - Math.atan2(b.center.z, b.center.x);
    });
}

function facesFromGeometry(geometry, expected) {
    const tris = [];
    eachTriangle(geometry, (tri) => tris.push(tri));
    let groups = clusterTriangles(tris, 0.999);
    if (groups.length !== expected) groups = clusterTriangles(tris, 0.98);
    if (groups.length !== expected) groups = clusterTriangles(tris, 0.9);
    if (groups.length !== expected) {
        throw new Error(`Dado com ${expected} faces gerou ${groups.length} grupos`);
    }
    for (const group of groups) {
        group.center = faceCenter(group);
        if (group.normal.dot(group.center) < 0) group.normal.negate();
        group.inradius = faceInradius(group.center, group.tris);
    }
    return groups;
}

function addBody(parent, geometry) {
    parent.add(new THREE.Mesh(geometry, ivoryMaterial()));
    parent.add(new THREE.LineSegments(new THREE.EdgesGeometry(geometry, 8), edgeMaterial()));
}

function buildPolyhedron(sides, geometry) {
    const group = new THREE.Group();
    const records = facesFromGeometry(geometry, sides);
    addBody(group, geometry);
    const faces = [];
    sortGroups(records);
    records.forEach((record, index) => {
        const size = Math.max(0.22, record.inradius * 1.2);
        addLabel(group, faces, index + 1, record.center, record.normal, size);
    });
    group.userData.faces = faces;
    return group;
}

function buildD6() {
    const size = 1.7;
    const geometry = new THREE.BoxGeometry(size, size, size);
    const group = new THREE.Group();
    const records = facesFromGeometry(geometry, 6);
    addBody(group, geometry);

    const byAxis = (record) => {
        const n = record.normal;
        if (n.z > 0.9) return 1;
        if (n.x > 0.9) return 2;
        if (n.y > 0.9) return 3;
        if (n.x < -0.9) return 4;
        if (n.y < -0.9) return 5;
        return 6;
    };

    const faces = [];
    for (const record of records) {
        const value = byAxis(record);
        const labelSize = record.inradius * 1.15;
        addLabel(group, faces, value, record.center, record.normal, labelSize);
    }
    group.userData.faces = faces;
    return group;
}

export function createDie(sides) {
    let group;
    if (sides === 6) group = buildD6();
    else if (sides === 8) group = buildPolyhedron(8, new THREE.OctahedronGeometry(1.25));
    else if (sides === 12) group = buildPolyhedron(12, new THREE.DodecahedronGeometry(1.15));
    else if (sides === 20) group = buildPolyhedron(20, new THREE.IcosahedronGeometry(1.2));
    else throw new Error(`Dado não suportado: ${sides}`);

    group.userData.sides = sides;
    let radius = 0;
    group.traverse((child) => {
        if (!child.geometry || child.type !== 'Mesh') return;
        const material = child.material;
        if (!material || material.type !== 'MeshStandardMaterial') return;
        child.geometry.computeBoundingSphere();
        radius = Math.max(radius, child.geometry.boundingSphere.radius);
    });
    group.userData.naturalRadius = radius || 1;
    return group;
}

export function quaternionForFace(face) {
    const normal = face.normal.clone().normalize();
    const align = new THREE.Quaternion().setFromUnitVectors(normal, FACING_TARGET);
    const up = face.up.clone().applyQuaternion(align);
    up.addScaledVector(FACING_TARGET, -up.dot(FACING_TARGET));
    if (up.lengthSq() < 1e-8) return align;
    up.normalize();
    const angle = Math.atan2(
        new THREE.Vector3().crossVectors(up, new THREE.Vector3(0, 1, 0)).dot(FACING_TARGET),
        up.dot(new THREE.Vector3(0, 1, 0))
    );
    const twist = new THREE.Quaternion().setFromAxisAngle(FACING_TARGET, angle);
    return twist.multiply(align);
}

export function facingValue(die, toward = FACING_TARGET) {
    let best = null;
    let bestDot = -Infinity;
    for (const face of die.userData.faces) {
        const worldNormal = face.normal.clone().applyQuaternion(die.quaternion);
        const dot = worldNormal.dot(toward);
        if (dot > bestDot) {
            bestDot = dot;
            best = face;
        }
    }
    return { value: best ? best.value : null, dot: bestDot };
}

function disposeDie(die) {
    die.traverse((child) => {
        if (child.geometry) child.geometry.dispose();
        const materials = child.material ? [].concat(child.material) : [];
        for (const material of materials) {
            if (material.map) material.map.dispose();
            material.dispose();
        }
    });
}

export class DiceView {
    constructor(canvas) {
        this.canvas = canvas;
        this.sides = 6;
        this.rolling = false;
        this.die = null;
        this.baseQuaternion = new THREE.Quaternion();
        this._frame = this._frame.bind(this);

        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(32, 1, 0.1, 100);
        this.camera.position.set(0, 0, 6);
        this.camera.lookAt(0, 0, 0);

        this.renderer = new THREE.WebGLRenderer({
            canvas,
            antialias: true,
            alpha: true
        });
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x000000, 0);
        this.renderer.outputColorSpace = THREE.SRGBColorSpace;

        this.scene.add(new THREE.HemisphereLight(0xfffaf3, 0x334155, 1.05));
        const key = new THREE.DirectionalLight(0xffffff, 1.45);
        key.position.set(3.5, 6.5, 7);
        this.scene.add(key);
        const fill = new THREE.DirectionalLight(0xe0e7ff, 0.8);
        fill.position.set(-6, 2.5, 4);
        this.scene.add(fill);
        const rim = new THREE.DirectionalLight(0xc4b5fd, 0.4);
        rim.position.set(0, -2, -6);
        this.scene.add(rim);

        this.setSides(6);
        this._frame();
    }

    setHost(element) {
        this.host = element;
        this.resize();
    }

    resize() {
        if (!this.host) return;
        const width = this.host.clientWidth;
        const height = this.host.clientHeight;
        if (width < 2 || height < 2) return;
        this.renderer.setSize(width, height, false);
        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();
        this._fit();
    }

    _fit() {
        if (!this.die) return;
        const vFov = (this.camera.fov * Math.PI) / 180;
        const distance = this.camera.position.length();
        const visibleHeight = 2 * Math.tan(vFov / 2) * distance;
        const visibleWidth = visibleHeight * this.camera.aspect;
        const limit = Math.min(visibleWidth, visibleHeight);
        const diameter = this.die.userData.naturalRadius * 2;
        const scale = (limit * 0.78) / diameter;
        this.die.scale.setScalar(scale);
    }

    setSides(sides) {
        if (this.die) {
            this.scene.remove(this.die);
            disposeDie(this.die);
        }
        this.sides = sides;
        this.die = createDie(sides);
        this.scene.add(this.die);
        const first = this.die.userData.faces.find((face) => face.value === 1) || this.die.userData.faces[0];
        this.baseQuaternion.copy(quaternionForFace(first));
        this.die.quaternion.copy(this.baseQuaternion);
        this.rolling = false;
        this._fit();
    }

    getFacing() {
        return facingValue(this.die);
    }

    roll(forcedValue = null) {
        if (this.rolling) return Promise.resolve(this.getFacing().value);
        const faces = this.die.userData.faces.length;
        const value = forcedValue == null
            ? (crypto.getRandomValues(new Uint32Array(1))[0] % faces) + 1
            : forcedValue;
        const face = this.die.userData.faces.find((item) => item.value === value);
        const end = quaternionForFace(face);
        const start = this.die.quaternion.clone();
        const axis = new THREE.Vector3(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 0.6 + 0.4).normalize();
        const turns = 2.2 + Math.random() * 1.6;
        const duration = 1400;
        const started = performance.now();

        this.rolling = true;

        return new Promise((resolve) => {
            const step = (now) => {
                const t = Math.min(1, (now - started) / duration);
                if (t < 0.68) {
                    const u = t / 0.68;
                    const eased = 1 - (1 - u) ** 2;
                    const spin = new THREE.Quaternion().setFromAxisAngle(axis, eased * turns * Math.PI * 2);
                    this.die.quaternion.copy(start).multiply(spin);
                    requestAnimationFrame(step);
                    return;
                }
                if (!this._mid) this._mid = this.die.quaternion.clone();
                const u = (t - 0.68) / 0.32;
                const eased = 1 - (1 - u) ** 3;
                this.die.quaternion.slerpQuaternions(this._mid, end, eased);
                if (t < 1) {
                    requestAnimationFrame(step);
                    return;
                }
                this.die.quaternion.copy(end);
                this.baseQuaternion.copy(end);
                this._mid = null;
                this.rolling = false;
                if (navigator.vibrate) navigator.vibrate(20);
                resolve(value);
            };
            this._mid = null;
            requestAnimationFrame(step);
        });
    }

    _frame() {
        requestAnimationFrame(this._frame);
        this.renderer.render(this.scene, this.camera);
    }
}
