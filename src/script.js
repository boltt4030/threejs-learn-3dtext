import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import GUI from 'lil-gui'
import { FontLoader } from 'three/addons/loaders/FontLoader.js';
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
// import typeFaceFont from 'three/examples/fonts/helvetiker_regular.typeface.json'


/**
 * Base
 */
// Debug
const gui = new GUI()

// Canvas
const canvas = document.querySelector('canvas.webgl')

// Scene
const scene = new THREE.Scene()

/**
 * Textures
 */
const textureLoader = new THREE.TextureLoader()
const matcapTexture = textureLoader.load('/textures/matcaps/4.png')
matcapTexture.colorSpace = THREE.SRGBColorSpace

/**
 * Fonts
 */
const fontLoader = new FontLoader()

// Array to store donuts for animation
const donuts = []
let textMesh = null // Store reference to text mesh

fontLoader.load(
    'fonts/helvetiker_regular.typeface.json',
    (font) =>
    {
        const textGeometry = new TextGeometry(
            'Hello Three.js',
            {
                font: font,
                size: 0.5,
                depth: 0.2, // new version
                curveSegments: 5,
                bevelEnabled: true,
                bevelThickness: 0.03,
                bevelSize: 0.02,
                bevelOffset: 0,
                bevelSegments: 4
            }
        )
        textGeometry.center() // 1 center the text

        const material = new THREE.MeshMatcapMaterial()
        material.matcap = matcapTexture

        textMesh = new THREE.Mesh(textGeometry, material)
        scene.add(textMesh)

        const donutGeometry = new THREE.TorusGeometry( 0.3, 0.2, 20, 45 )

        for (let i = 0; i < 100; i++){
            const donut = new THREE.Mesh(donutGeometry, material)

            donut.position.x = (Math.random() - 0.5) * 10
            donut.position.y = (Math.random() - 0.5) * 10
            donut.position.z = (Math.random() - 0.5) * 10

            donut.rotation.x = Math.random() * Math.PI
            donut.rotation.y = Math.random() * Math.PI
            const scale = Math.random() * 0.5 + 0.5
            donut.scale.set(scale, scale, scale)

            scene.add(donut)
        }
    }
)

/**
 * Sizes
 */
const sizes = {
    width: window.innerWidth,
    height: window.innerHeight
}

window.addEventListener('resize', () =>
{
    // Update sizes
    sizes.width = window.innerWidth
    sizes.height = window.innerHeight

    // Update camera
    camera.aspect = sizes.width / sizes.height
    camera.updateProjectionMatrix()

    // Update renderer
    renderer.setSize(sizes.width, sizes.height)
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
})

/**
 * Camera
 */
// Base camera
const camera = new THREE.PerspectiveCamera(75, sizes.width / sizes.height, 0.1, 100)
camera.position.set(1, 1, 2)
scene.add(camera)

// Controls
const controls = new OrbitControls(camera, canvas)
controls.enableDamping = true
controls.autoRotate = false

/**
 * Renderer
 */
const renderer = new THREE.WebGLRenderer({
    canvas: canvas
})
renderer.setSize(sizes.width, sizes.height)
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))

/**
 * Animate
 */
const clock = new THREE.Clock()

// Camera animation parameters
const cameraAnimation = {
    currentRadius: 3,
    targetRadius: 3,
    radiusChangeTime: 0,
    radiusSpeed: 0.5 // How fast it moves between radii
}

const tick = () => {
    const elapsedTime = clock.getElapsedTime()

    // Animate camera with random close-ups
    if (textMesh) {
        const orbitSpeed = 0.5
        
        // Update radius (zoom level)
        if (elapsedTime > cameraAnimation.radiusChangeTime) {
            // Pick new random radius between 1 (close) and 4 (far)
            cameraAnimation.targetRadius = Math.random() * 3 + 1
            // Set next change time (between 2-5 seconds)
            cameraAnimation.radiusChangeTime = elapsedTime + Math.random() * 3 + 2
        }
        
        // Smoothly interpolate to target radius
        cameraAnimation.currentRadius = THREE.MathUtils.lerp(
            cameraAnimation.currentRadius,
            cameraAnimation.targetRadius,
            cameraAnimation.radiusSpeed * 0.05
        )

        // Update camera position
        camera.position.x = Math.sin(elapsedTime * orbitSpeed) * cameraAnimation.currentRadius
        camera.position.z = Math.cos(elapsedTime * orbitSpeed) * cameraAnimation.currentRadius
        camera.position.y = Math.sin(elapsedTime * orbitSpeed * 0.5) + 1
        
        // Keep looking at text
        camera.lookAt(textMesh.position)
    }

    // Animate donuts
    donuts.forEach((donut) => {
        donut.position.lerp(donut.userData.targetPosition, donut.userData.moveSpeed)

        if (elapsedTime > donut.userData.timeToNextMove) {
            donut.userData.targetPosition.set(
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10,
                (Math.random() - 0.5) * 10
            )
            donut.userData.timeToNextMove = elapsedTime + Math.random() * 2 + 1
            donut.userData.moveSpeed = Math.random() * 0.02 + 0.01
        }
    })

    controls.update()
    renderer.render(scene, camera)
    window.requestAnimationFrame(tick)
}

tick()