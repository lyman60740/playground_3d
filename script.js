const scene = new THREE.Scene();

// Group to rotate everything in the scene
const sceneRotation = new THREE.Group();

// Le centre de votre structure
const centerX = 1.5;
const centerY = 3;
const centerZ = 3.5;

// Créez un groupe "pivot"
const pivot = new THREE.Group();
pivot.position.set(centerX, centerY, centerZ);

// Ajoutez sceneRotation comme enfant du pivot et déplacez sa position inversement
sceneRotation.position.set(-centerX, -centerY, -centerZ);
pivot.add(sceneRotation);

// Ajoutez le pivot à la scène au lieu de sceneRotation
scene.add(pivot);

const camera = new THREE.PerspectiveCamera(
  20,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 35;
camera.position.y = 1;
camera.position.x = 1;
camera.position.x += -20;
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

const animationProps = {
  cubeSpacing: 1,
  cubeRotationY: 0,
  cubeRotationX: 0,
  continuousRotationY: 0,
  continuousRotationX: 0,
};

const cubesAndLines = [];
const originCubePosition = { x: 1, y: 2, z: 3 }; // Exemple de position pour le cube d'origine

// Créez un point lumineux
const pointLight = new THREE.PointLight(0xffffff, 5, 50); // couleur blanche, intensité, distance
pointLight.position.set(
  originCubePosition.x - 0,
  originCubePosition.y + 0.7,
  originCubePosition.z + 0.5
); // au centre du monolithe
scene.add(pointLight);

function modulateRotation(angle) {
  // moduler l'angle pour qu'il soit toujours entre 0 et 2 * Math.PI
  return angle % (2 * Math.PI);
}
let initialState = true;

function createOrMoveCubes() {
  let index = 0;
  for (let i = 0; i < 3; i++) {
    // largeur de profondeur
    for (let j = 0; j < 6; j++) {
      // hauteur
      for (let l = 0; l < 6; l++) {
        // largeur
        if (l > 1 && j > 6) continue; // cube du milieu

        let cube, line;
        if (cubesAndLines[index]) {
          [cube, line] = cubesAndLines[index];
        } else {
          const geometry = new THREE.BoxGeometry(1, 1, 1);
          const cubeMaterial = new THREE.MeshPhongMaterial({ color: 0x171614 });
          const edges = new THREE.EdgesGeometry(geometry);
          const edgesMaterial = new THREE.LineBasicMaterial({
            color: 0xf2f0ed,
          });

          cube = new THREE.Mesh(geometry, cubeMaterial);
          line = new THREE.LineSegments(edges, edgesMaterial);

          cubesAndLines.push([cube, line]);
          sceneRotation.add(cube);
          sceneRotation.add(line);

          // Initialisation à une position aléatoire
          cube.position.set(
            (Math.random() - 0.5) * window.innerWidth,
            (Math.random() - 0.5) * window.innerHeight,
            (Math.random() - 0.5) * 100
          );
        }

        if (!initialState) {
          // Déplacez les cubes progressivement vers leur position cible
          let targetX =
            originCubePosition.x +
            (i - originCubePosition.x) * animationProps.cubeSpacing;
          let targetY =
            originCubePosition.y +
            (j - originCubePosition.y) * animationProps.cubeSpacing;
          let targetZ =
            originCubePosition.z +
            (l - originCubePosition.z) * animationProps.cubeSpacing;

          cube.position.x += (targetX - cube.position.x) * 0.02; // 0.02 est la vitesse d'interpolation, ajustez-la si nécessaire
          cube.position.y += (targetY - cube.position.y) * 0.02;
          cube.position.z += (targetZ - cube.position.z) * 0.02;
        }

        cube.rotation.y = modulateRotation(
          animationProps.cubeRotationY + animationProps.continuousRotationY
        );
        cube.rotation.x = modulateRotation(
          animationProps.cubeRotationX + animationProps.continuousRotationX
        );

        line.rotation.y = cube.rotation.y;
        line.rotation.x = cube.rotation.x;
        line.position.copy(cube.position);

        index++;
      }
    }
  }
  if (initialState) initialState = false;
}

window.addEventListener("load", () => {
  setTimeout(() => {
    initialState = false; // Cela garantit que createOrMoveCubes n'éparpille plus les cubes
    gsap.to(animationProps, {
      cubeSpacing: 1,
      cubeRotationY: 0,
      cubeRotationX: 0,
      duration: 2, // Temps pour que les cubes se regroupent
      ease: "power1.inOut",
      onUpdate: createOrMoveCubes,
      onComplete: handleUserInteractions, // Activez les interactions utilisateur après l'animation
    });
    console.log("loaded");
  }, 10000); // 2 secondes après le chargement de la page
});

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
    repeat: -1,
    ease: "power1.inOut",
    onUpdate: createOrMoveCubes,
  });
}

function stopBreathingAnimation() {
  if (currentBreathingAnimation) {
    currentBreathingAnimation.pause();
  }
}

function handleUserInteractions() {
  let isMouseDown = false;
  let lastMouseX = 0;
  let lastMouseY = 0;
  const rotationSpeed = 0.002;

  renderer.domElement.addEventListener("mousedown", (event) => {
    isMouseDown = true;
    lastMouseX = event.clientX;
    lastMouseY = event.clientY;
  });

  window.addEventListener("mouseup", () => {
    isMouseDown = false;
  });

  renderer.domElement.addEventListener("mousemove", (event) => {
    if (isMouseDown) {
      const deltaX = event.clientX - lastMouseX;
      const deltaY = event.clientY - lastMouseY;

      pivot.rotation.y += deltaX * rotationSpeed;
      pivot.rotation.x += deltaY * rotationSpeed;

      lastMouseX = event.clientX;
      lastMouseY = event.clientY;
    }

    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    raycaster.setFromCamera(mouse, camera);
    const intersects = raycaster.intersectObjects(sceneRotation.children, true);

    let rotationAnimation;
    let rotationAnimation2;

    if (intersects.length > 0 && !cubesAreApart) {
      cubesAreApart = true;
      stopBreathingAnimation();

      if (interactionAnimation) interactionAnimation.kill();

      rotationAnimation = gsap.to(animationProps, {
        continuousRotationY: "+=" + Math.PI * 2,
        continuousRotationX: "+=" + Math.PI * 2,
        duration: 20,
        repeat: -1,
        ease: "linear",
        onUpdate: () => {
          if (!cubesAreApart) {
            rotationAnimation.pause(); // Stop the rotation if cubes are not apart
          }
          createOrMoveCubes();
        },
      });

      interactionAnimation = gsap.to(animationProps, {
        cubeSpacing: 2.5,
        cubeRotationY: Math.PI / 2,
        cubeRotationX: Math.PI / 2,
        duration: 20,
        repeat: -1,
        yoyo: true,
        onUpdate: createOrMoveCubes,
        ease: "elastic.out(1.2, 0.8)",
        onComplete: () => {
          currentBreathingAnimation = startBreathingAnimation();
          rotationAnimation2 = gsap.to(animationProps, {
            continuousRotationY: "+=" + Math.PI * 2,
            continuousRotationX: "+=" + Math.PI * 2,
            duration: 20,
            repeat: -1,
            ease: "linear",
            onUpdate: () => {
              if (!cubesAreApart) {
                rotationAnimation2.pause(); // Stop the rotation if cubes are not apart
              }
              createOrMoveCubes();
            },
          });
        },
      });
    } else if (!intersects.length && cubesAreApart) {
      cubesAreApart = false;
      stopBreathingAnimation();

      // Calculez la rotation cible pour aligner les cubes correctement
      let targetRotationY = modulateRotation(
        animationProps.continuousRotationY
      );
      let targetRotationX = modulateRotation(
        animationProps.continuousRotationX
      );

      // Trouver l'angle le plus proche pour aligner le cube
      targetRotationY =
        Math.round(targetRotationY / (Math.PI / 2)) * (Math.PI / 2);
      targetRotationX =
        Math.round(targetRotationX / (Math.PI / 2)) * (Math.PI / 2);

      gsap.to(animationProps, {
        continuousRotationY: targetRotationY,
        continuousRotationX: targetRotationX,
        duration: 1,
        ease: "power1.inOut",
        onUpdate: createOrMoveCubes,
      });

      // Kill any existing animations
      if (interactionAnimation) interactionAnimation.kill();
      if (rotationAnimation) rotationAnimation.kill();
      if (rotationAnimation2) rotationAnimation2.kill();

      interactionAnimation = gsap.to(animationProps, {
        cubeSpacing: 1,
        cubeRotationY: 0,
        cubeRotationX: 0,
        duration: 1,
        onUpdate: createOrMoveCubes,
        ease: "power1.inOut",
        onComplete: () => {
          currentBreathingAnimation = startBreathingAnimation();
        },
      });
    }
  });
}

// Appeler la fonction pour initialiser les interactions utilisateur
// handleUserInteractions();

document.addEventListener("load", (event) => {});

currentBreathingAnimation = startBreathingAnimation();
animate();
