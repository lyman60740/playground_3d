const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 35;
camera.position.y = 1;
camera.position.x = 1;
camera.position.x += -20; // Décale la caméra de 5 unités sur l'axe X
camera.position.y += 20;

const moveAmountX = 10;
camera.position.x -= moveAmountX;
const moveAmountY = -5;
camera.position.y -= moveAmountY;
camera.lookAt(new THREE.Vector3(1 - moveAmountX, 1 - moveAmountY, 4));

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0xf2f0ed);
document.body.appendChild(renderer.domElement);

const animationProps = { cubeSpacing: 1, cubeRotation: 0 };
const cubesAndLines = [];

function createOrMoveCubes() {
  let index = 0;

  for (let i = 0; i < 3; i++) {
    for (let j = 0; j < 6; j++) {
      for (let l = 0; l < 7; l++) {
        if (l > 0 && j == 0) continue;

        let cube, line;

        if (cubesAndLines[index]) {
          [cube, line] = cubesAndLines[index];
        } else {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x171614 });
          const edges = new THREE.EdgesGeometry(geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0xf2f0ed,
          });

          cube = new THREE.Mesh(geometry, cubeMaterial);
          line = new THREE.LineSegments(edges, edgesMaterial);

          cubesAndLines.push([cube, line]);
          scene.add(cube);
          scene.add(line);
        }

        cube.position.x = i * animationProps.cubeSpacing;
        cube.position.y = j * animationProps.cubeSpacing;
        cube.position.z = l * animationProps.cubeSpacing;
        cube.rotation.y = animationProps.cubeRotation;

        line.position.copy(cube.position);
        line.rotation.y = animationProps.cubeRotation;

        index++;
      }
    }
  }

  for (let i = 0; i < 3; i++) {
    for (let k = 1; k <= 6; k++) {
      let cube, line;

      if (cubesAndLines[index]) {
        [cube, line] = cubesAndLines[index];
      } else {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x171614 });
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xf2f0ed });

        cube = new THREE.Mesh(geometry, cubeMaterial);
        line = new THREE.LineSegments(edges, edgesMaterial);

        cubesAndLines.push([cube, line]);
        scene.add(cube);
        scene.add(line);
      }

      cube.position.x = i * animationProps.cubeSpacing;
      cube.position.z = k * animationProps.cubeSpacing;
      cube.rotation.y = animationProps.cubeRotation;
      line.position.copy(cube.position);
      line.rotation.y = animationProps.cubeRotation;
      index++;
    }
  }
}

createOrMoveCubes();

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}

window.addEventListener("resize", function () {
  const newWidth = window.innerWidth;
  const newHeight = window.innerHeight;

  camera.aspect = newWidth / newHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(newWidth, newHeight);
});

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

let cubesAreApart = false;
let currentBreathingAnimation = null;
let interactionAnimation = null;

function startBreathingAnimation() {
  return gsap.to(animationProps, {
    cubeSpacing: 1.1,
    duration: 2.5,
    yoyo: true,
    repeat: -1, // pour une répétition infinie
    ease: "power1.inOut",
    onUpdate: createOrMoveCubes,
  });
}

function stopBreathingAnimation() {
  if (currentBreathingAnimation) {
    currentBreathingAnimation.pause();
  }
}

function onMouseMove(event) {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(scene.children, true);

  if (intersects.length > 0 && !cubesAreApart) {
    cubesAreApart = true;
    stopBreathingAnimation();
    if (interactionAnimation) interactionAnimation.kill();
    interactionAnimation = gsap.to(animationProps, {
      cubeSpacing: 1.5,
      cubeRotation: 0,
      duration: 6,
      onUpdate: createOrMoveCubes,
      ease: "elastic.out(1.2, 0.8)",
      onComplete: () => {
        currentBreathingAnimation = startBreathingAnimation();
      },
    });
  } else if (!intersects.length && cubesAreApart) {
    cubesAreApart = false;
    stopBreathingAnimation();
    if (interactionAnimation) interactionAnimation.kill();
    interactionAnimation = gsap.to(animationProps, {
      cubeSpacing: 1,
      cubeRotation: 0,
      duration: 1,
      onUpdate: createOrMoveCubes,
      ease: "power1.inOut",
      onComplete: () => {
        currentBreathingAnimation = startBreathingAnimation();
      },
    });
  }
}

renderer.domElement.addEventListener("mousemove", onMouseMove);

currentBreathingAnimation = startBreathingAnimation();

animate();
