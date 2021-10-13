import * as THREE from 'three';

// reference: https://threejsfundamentals.org/threejs/lessons/ja/threejs-multiple-scenes.html

type SceneInfo = {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  element: HTMLElement | undefined;
  mesh: THREE.Mesh | undefined;
};

type DomIds = 'box' | 'pyramid';

export default function ScissorTest() {
  const canvas = document.querySelector('#c');
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true });
  render(0, renderer, [setupScene('box'), setupScene('pyramid')]);
}

function setupScene(domId: DomIds): SceneInfo {
  const sceneInfo: SceneInfo = {
    ...makeScene(),
    element: document.querySelector(`#${domId}`),
  };

  switch (domId) {
    case 'box': {
      const geometry = new THREE.BoxGeometry(1, 1, 1);
      const material = new THREE.MeshPhongMaterial({ color: 'red' });
      const mesh = new THREE.Mesh(geometry, material);
      sceneInfo.scene.add(mesh);
      sceneInfo.mesh = mesh;
      return sceneInfo;
    }
    case 'pyramid': {
      const radius = 0.8;
      const widthSegments = 4;
      const heightSegments = 2;
      const geometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
      const material = new THREE.MeshPhongMaterial({
        color: 'blue',
        flatShading: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      sceneInfo.scene.add(mesh);
      sceneInfo.mesh = mesh;
      return sceneInfo;
    }
  }
}

function makeScene(): SceneInfo {
  const scene = new THREE.Scene();
  const fov = 45;
  const aspect = 2; // the canvas default
  const near = 0.1;
  const far = 5;
  const camera = new THREE.PerspectiveCamera(fov, aspect, near, far);
  camera.position.z = 2;
  camera.position.set(0, 1, 2);
  camera.lookAt(0, 0, 0);

  const color = 0xffffff;
  const intensity = 1;
  const light = new THREE.DirectionalLight(color, intensity);
  light.position.set(-1, 2, 4);
  scene.add(light);

  return { scene, camera, element: undefined, mesh: undefined };
}

function render(time: number = 0, renderer: THREE.WebGLRenderer, sceneInfos: SceneInfo[]) {
  time *= 0.001;

  resizeRendererToDisplaySize(renderer);

  renderer.setScissorTest(false);
  renderer.clear(true, true);
  renderer.setScissorTest(true);

  sceneInfos.forEach((sceneInfo) => {
    sceneInfo.mesh.rotation.y = time * 0.5;
    renderSceneInfo(sceneInfo, renderer);
  });

  requestAnimationFrame((timeStamp) => render(timeStamp, renderer, sceneInfos));
}

function resizeRendererToDisplaySize(renderer: THREE.WebGLRenderer): boolean {
  const canvas = renderer.domElement;
  const width = canvas.clientWidth;
  const height = canvas.clientHeight;
  const isNeedResize = canvas.width !== width || canvas.height !== height;
  if (isNeedResize) {
    renderer.setSize(width, height, false);
  }
  return isNeedResize;
}

function renderSceneInfo(sceneInfo: SceneInfo, renderer: THREE.WebGLRenderer) {
  const { scene, camera, element } = sceneInfo;
  // get the viewport relative position of this element
  const { left, right, top, bottom, width, height } = element.getBoundingClientRect();

  const isOffscreen =
    bottom < 0 ||
    top > renderer.domElement.clientHeight ||
    right < 0 ||
    left > renderer.domElement.clientWidth;

  if (isOffscreen) {
    return;
  }

  camera.aspect = width / height;
  camera.updateProjectionMatrix();

  const positiveYUpBottom = renderer.domElement.clientHeight - bottom;
  console.log(
    'id:',
    element.id,
    'left:',
    left,
    'positiveYUpBottom:',
    positiveYUpBottom,
    'width:',
    width,
    'height:',
    height
  );
  renderer.setScissor(left, positiveYUpBottom, width, height);
  renderer.setViewport(left, positiveYUpBottom, width, height);
  renderer.render(scene, camera);
}
