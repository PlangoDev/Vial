import * as THREE from '../node_modules/three/build/three.module.js';
import { OBJExporter } from '../node_modules/three/examples/jsm/exporters/OBJExporter.js';
import { OrbitControls } from '../node_modules/three/examples/jsm/controls/OrbitControls.js';

const input = document.getElementById('imageInput');
const viewer = document.getElementById('viewer');
const downloadBtn = document.getElementById('downloadBtn');
let scene, camera, renderer, mesh, texture, heightCanvas, controls;

function initRenderer() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, viewer.clientWidth / viewer.clientHeight, 0.1, 1000);
  camera.position.z = 100;

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(viewer.clientWidth, viewer.clientHeight);
  viewer.innerHTML = '';
  viewer.appendChild(renderer.domElement);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.enableDamping = true;

  const light = new THREE.DirectionalLight(0xffffff, 1);
  light.position.set(0, 0, 1).normalize();
  scene.add(light);
}

function createMeshFromImage(img) {
  heightCanvas = document.createElement('canvas');
  heightCanvas.width = img.width;
  heightCanvas.height = img.height;
  const ctx = heightCanvas.getContext('2d');
  ctx.drawImage(img, 0, 0);
  const data = ctx.getImageData(0, 0, img.width, img.height).data;

  const geometry = new THREE.PlaneGeometry(img.width, img.height, img.width - 1, img.height - 1);
  const vertices = geometry.attributes.position.array;

  for (let i = 0; i < vertices.length; i += 3) {
    const x = Math.floor((i / 3) % img.width);
    const y = Math.floor((i / 3) / img.width);
    const idx = (y * img.width + x) * 4;
    const brightness = data[idx] * 0.2126 + data[idx + 1] * 0.7152 + data[idx + 2] * 0.0722;
    vertices[i + 2] = brightness / 10; // moderate scale
  }

  geometry.computeVertexNormals();
  texture = new THREE.CanvasTexture(heightCanvas);
  const material = new THREE.MeshStandardMaterial({ map: texture, side: THREE.DoubleSide });

  if (mesh) scene.remove(mesh);
  mesh = new THREE.Mesh(geometry, material);
  scene.add(mesh);
}

function animate() {
  requestAnimationFrame(animate);
  if (mesh) mesh.rotation.z += 0.005;
  controls.update();
  renderer.render(scene, camera);
}

input.addEventListener('change', (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = (ev) => {
    const img = new Image();
    img.onload = () => {
      initRenderer();
      createMeshFromImage(img);
      animate();
    };
    img.src = ev.target.result;
  };
  reader.readAsDataURL(file);
});

function exportObj() {
  if (!mesh) return;
  const exporter = new OBJExporter();
  const result = exporter.parse(mesh);
  const blob = new Blob([result], { type: 'text/plain' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'model.obj';
  link.click();
  URL.revokeObjectURL(url);

  if (heightCanvas) {
    const texUrl = heightCanvas.toDataURL('image/png');
    const texLink = document.createElement('a');
    texLink.href = texUrl;
    texLink.download = 'texture.png';
    texLink.click();
  }
}

downloadBtn.addEventListener('click', exportObj);
