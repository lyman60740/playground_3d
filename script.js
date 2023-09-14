
// Création de la scène
const scene = new THREE.Scene();

// Création de la caméra
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.z = 20;
camera.position.y = 4;
camera.position.x = 4;
camera.lookAt(new THREE.Vector3(1, 4, 4));



// Création du renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const cubeSpacing = 2; // Espace entre les cubes

// Partie verticale
for (let i = 0; i < 3; i++) { // Largeur
    for (let j = 0; j < 8; j++) { // Hauteur
        for (let l = 0; l < 9; l++) { // Profondeur
            if (l > 0 && j == 0) continue; // Cette condition permet d'éviter les cubes du bas, puisque la partie horizontale les remplira

            // Géométrie et matériaux
            const geometry = new THREE.BoxGeometry(1, 1, 1);
            const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
            const edges = new THREE.EdgesGeometry(geometry);
            const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

            // Création des cubes et de leurs bordures
            const cube = new THREE.Mesh(geometry, cubeMaterial);
            const line = new THREE.LineSegments(edges, edgesMaterial);

            // Positionnement des cubes
            cube.position.x = i * cubeSpacing;
            cube.position.y = j * cubeSpacing;
            cube.position.z = l * cubeSpacing;

            line.position.x = i * cubeSpacing;
            line.position.y = j * cubeSpacing;
            line.position.z = l * cubeSpacing;

            // Ajout à la scène
            scene.add(cube);
            scene.add(line);
        }
    }
}

// Partie horizontale
for (let i = 0; i < 3; i++) { // Largeur
    for (let k = 1; k <= 8; k++) { // Profondeur

        // Géométrie et matériaux
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const cubeMaterial = new THREE.MeshBasicMaterial({ color: 0x000000 });
        const edges = new THREE.EdgesGeometry(geometry);
        const edgesMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });

        // Création des cubes et de leurs bordures
        const cube = new THREE.Mesh(geometry, cubeMaterial);
        const line = new THREE.LineSegments(edges, edgesMaterial);

        // Positionnement des cubes
        cube.position.x = i * cubeSpacing;
        cube.position.z = k * cubeSpacing;

        line.position.x = i * cubeSpacing;
        line.position.z = k * cubeSpacing;

        // Ajout à la scène
        scene.add(cube);
        scene.add(line);
    }
}






// Animation
function animate() {
    requestAnimationFrame(animate);

    scene.rotation.y += 0.01;

    renderer.render(scene, camera);
}

// Ajustement de la taille du rendu lors du redimensionnement de la fenêtre
window.addEventListener('resize', function() {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;

    camera.aspect = newWidth / newHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(newWidth, newHeight);
});

animate();
