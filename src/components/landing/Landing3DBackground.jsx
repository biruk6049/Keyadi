import { useEffect, useRef } from 'react'
import * as THREE from 'three'
import { useSettings } from '../../context/SettingsContext'

/**
 * Landing3DBackground
 * Renders a futuristic geospatial 3D universe using Three.js:
 * - Holographic pulsing Earth/geospatial node sphere
 * - 3D bezier connection arcs (simulating real-time multimodal routes)
 * - Deep space particle starfield with depth fog
 * - Holographic coordinate ground grid
 * - Dynamic scroll-reactive camera motion & mouse parallax lerp
 */
export default function Landing3DBackground({ isDark }) {
  const containerRef = useRef(null)
  const settings = useSettings()
  const dark = isDark !== undefined ? isDark : (settings?.isDark ?? true)
  const sceneRef = useRef(null)
  const matsRef = useRef({})

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    // Scene setup
    const scene = new THREE.Scene()
    scene.fog = new THREE.FogExp2(dark ? 0x0a0908 : 0xfaf9f6, dark ? 0.028 : 0.022)
    sceneRef.current = scene

    // Camera setup
    const camera = new THREE.PerspectiveCamera(
      55,
      window.innerWidth / window.innerHeight,
      0.1,
      1000
    )
    camera.position.set(0, 0, 24)

    // Renderer setup
    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance',
    })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setSize(window.innerWidth, window.innerHeight)
    renderer.toneMapping = THREE.ACESFilmicToneMapping
    renderer.toneMappingExposure = 1.2
    container.appendChild(renderer.domElement)

    // Root 3D group that rotates & tilts with mouse and scroll
    const worldGroup = new THREE.Group()
    scene.add(worldGroup)

    // ── 1. Holographic Geospatial Globe / Sphere ──
    const globeRadius = 6.2
    const globeGroup = new THREE.Group()
    globeGroup.position.set(4.5, 0.5, -2) // Positioned slightly to the right for heroic layout balance
    worldGroup.add(globeGroup)

    // Globe point cloud
    const dotCount = 1800
    const dotPositions = new Float32Array(dotCount * 3)
    const dotColors = new Float32Array(dotCount * 3)
    const amberColor = new THREE.Color('#e8a33d')
    const tealColor = new THREE.Color('#38bdf8')
    const dimColor = new THREE.Color('#3b2d18')

    for (let i = 0; i < dotCount; i++) {
      // Golden spiral distribution on sphere surface
      const phi = Math.acos(1 - 2 * (i + 0.5) / dotCount)
      const theta = Math.PI * (1 + 5 ** 0.5) * i

      const x = globeRadius * Math.sin(phi) * Math.cos(theta)
      const y = globeRadius * Math.sin(phi) * Math.sin(theta)
      const z = globeRadius * Math.cos(phi)

      dotPositions[i * 3] = x
      dotPositions[i * 3 + 1] = y
      dotPositions[i * 3 + 2] = z

      // Distribute colors: amber clusters, cyan accents, subtle dark amber
      const mixed = Math.random()
      let c = dimColor
      if (mixed > 0.75) c = amberColor
      else if (mixed > 0.6) c = tealColor

      dotColors[i * 3] = c.r
      dotColors[i * 3 + 1] = c.g
      dotColors[i * 3 + 2] = c.b
    }

    const dotGeometry = new THREE.BufferGeometry()
    dotGeometry.setAttribute('position', new THREE.BufferAttribute(dotPositions, 3))
    dotGeometry.setAttribute('color', new THREE.BufferAttribute(dotColors, 3))

    const dotMaterial = new THREE.PointsMaterial({
      size: 0.12,
      vertexColors: true,
      transparent: true,
      opacity: 0.85,
      blending: THREE.AdditiveBlending,
    })
    const globePoints = new THREE.Points(dotGeometry, dotMaterial)
    globeGroup.add(globePoints)

    // Globe inner atmospheric glowing core
    const coreGeo = new THREE.SphereGeometry(globeRadius * 0.94, 32, 32)
    const coreMat = new THREE.MeshBasicMaterial({
      color: 0x16120b,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    })
    const coreMesh = new THREE.Mesh(coreGeo, coreMat)
    globeGroup.add(coreMesh)

    matsRef.current = {
      dotMaterial,
      coreMat,
      gridHelper: null,
      starMat: null,
    }

    // Glowing equator / latitude rings
    const ringGeo = new THREE.RingGeometry(globeRadius * 1.12, globeRadius * 1.15, 64)
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xe8a33d,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.35,
    })
    const ringMesh1 = new THREE.Mesh(ringGeo, ringMat)
    ringMesh1.rotation.x = Math.PI / 2.3
    globeGroup.add(ringMesh1)

    const ringMesh2 = ringMesh1.clone()
    ringMesh2.rotation.x = Math.PI / 1.7
    ringMesh2.rotation.y = Math.PI / 4
    ringMat.opacity = 0.2
    globeGroup.add(ringMesh2)

    // ── 2. Glowing 3D Arcs (Curved routes arcing above the globe) ──
    const arcCount = 7
    const arcLines = []
    for (let a = 0; a < arcCount; a++) {
      // Pick two random points on upper hemisphere
      const phi1 = Math.random() * Math.PI * 0.6 + 0.3
      const theta1 = Math.random() * Math.PI * 2
      const phi2 = phi1 + (Math.random() - 0.5) * 1.2
      const theta2 = theta1 + (Math.random() * 1.4 + 0.6)

      const p1 = new THREE.Vector3(
        globeRadius * Math.sin(phi1) * Math.cos(theta1),
        globeRadius * Math.sin(phi1) * Math.sin(theta1),
        globeRadius * Math.cos(phi1)
      )
      const p2 = new THREE.Vector3(
        globeRadius * Math.sin(phi2) * Math.cos(theta2),
        globeRadius * Math.sin(phi2) * Math.sin(theta2),
        globeRadius * Math.cos(phi2)
      )

      // Control point arcing higher out
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5)
      const arcHeight = globeRadius * (1.25 + Math.random() * 0.35)
      mid.normalize().multiplyScalar(arcHeight)

      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2)
      const curvePoints = curve.getPoints(40)
      const curveGeo = new THREE.BufferGeometry().setFromPoints(curvePoints)
      const curveMat = new THREE.LineBasicMaterial({
        color: a % 2 === 0 ? 0xe8a33d : 0x38bdf8,
        transparent: true,
        opacity: 0.65,
        blending: THREE.AdditiveBlending,
      })
      const line = new THREE.Line(curveGeo, curveMat)
      globeGroup.add(line)
      arcLines.push({ line, speed: 0.005 + Math.random() * 0.01 })
    }

    // ── 3. Pulsing Geolocation Beacon Nodes ──
    const beaconCount = 12
    const beacons = []
    const beaconMat = new THREE.MeshBasicMaterial({
      color: 0xffd166,
      transparent: true,
      opacity: 0.9,
    })
    for (let b = 0; b < beaconCount; b++) {
      const idx = Math.floor(Math.random() * dotCount)
      const bGeo = new THREE.SphereGeometry(0.12, 12, 12)
      const bMesh = new THREE.Mesh(bGeo, beaconMat)
      bMesh.position.set(
        dotPositions[idx * 3] * 1.02,
        dotPositions[idx * 3 + 1] * 1.02,
        dotPositions[idx * 3 + 2] * 1.02
      )
      globeGroup.add(bMesh)
      beacons.push({ mesh: bMesh, baseScale: 1, pulseSpeed: 2 + Math.random() * 3 })
    }

    // ── 4. Deep Coordinate Field / Ambient Floating Particles ──
    const starCount = 1200
    const starGeo = new THREE.BufferGeometry()
    const starPositions = new Float32Array(starCount * 3)
    for (let s = 0; s < starCount; s++) {
      starPositions[s * 3] = (Math.random() - 0.5) * 80
      starPositions[s * 3 + 1] = (Math.random() - 0.5) * 70
      starPositions[s * 3 + 2] = (Math.random() - 0.5) * 50 - 5
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPositions, 3))
    const starMat = new THREE.PointsMaterial({
      size: 0.08,
      color: 0xebd5a7,
      transparent: true,
      opacity: 0.45,
    })
    const starField = new THREE.Points(starGeo, starMat)
    worldGroup.add(starField)

    const gridHelper = new THREE.GridHelper(90, 45, 0xe8a33d, 0x1f1a14)
    gridHelper.position.set(0, -9, 0)
    gridHelper.material.transparent = true
    gridHelper.material.opacity = dark ? 0.28 : 0.16
    worldGroup.add(gridHelper)

    matsRef.current.gridHelper = gridHelper
    matsRef.current.starMat = starMat

    // ── Interactive State & Scroll Reactivity ──
    let targetMouseX = 0
    let targetMouseY = 0
    let mouseX = 0
    let mouseY = 0
    let scrollProgress = 0
    let targetScroll = 0

    const handleMouseMove = (e) => {
      const nx = (e.clientX / window.innerWidth) * 2 - 1
      const ny = -(e.clientY / window.innerHeight) * 2 + 1
      targetMouseX = nx * 0.35
      targetMouseY = ny * 0.25
    }

    const handleScroll = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      )
      targetScroll = window.scrollY / maxScroll
    }

    const handleResize = () => {
      camera.aspect = window.innerWidth / window.innerHeight
      camera.updateProjectionMatrix()
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    }

    window.addEventListener('mousemove', handleMouseMove, { passive: true })
    window.addEventListener('scroll', handleScroll, { passive: true })
    window.addEventListener('resize', handleResize)

    // Initial scroll sync
    handleScroll()

    // ── Animation Loop ──
    let animationFrameId
    let clock = new THREE.Clock()

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate)
      const elapsedTime = clock.getElapsedTime()

      // Smooth lerp for mouse parallax
      mouseX += (targetMouseX - mouseX) * 0.06
      mouseY += (targetMouseY - mouseY) * 0.06

      // Smooth lerp for scroll progress
      scrollProgress += (targetScroll - scrollProgress) * 0.08

      // Slow autonomous rotation of globe
      globeGroup.rotation.y = elapsedTime * 0.07 + scrollProgress * Math.PI * 1.5
      globeGroup.rotation.x = Math.sin(elapsedTime * 0.05) * 0.12 - scrollProgress * 0.4
      globeGroup.rotation.z = Math.cos(elapsedTime * 0.04) * 0.08

      // Subtle wobble of floating rings
      ringMesh1.rotation.z = elapsedTime * 0.1
      ringMesh2.rotation.z = -elapsedTime * 0.08

      // Pulsing beacons
      beacons.forEach((b) => {
        const scale = 1 + Math.sin(elapsedTime * b.pulseSpeed) * 0.45
        b.mesh.scale.set(scale, scale, scale)
      })

      // Starfield parallax
      starField.rotation.y = elapsedTime * 0.015
      starField.position.y = -scrollProgress * 6

      // Ground grid reactive motion
      gridHelper.position.z = (elapsedTime * 1.2) % 2
      gridHelper.rotation.y = mouseX * 0.15

      // 3D CAMERA SCROLL CHOREOGRAPHY:
      // - Hero (scroll 0.0): camera at z=24, y=0.5, looking center-right
      // - Features (scroll ~0.3): camera swoops closer (z ~ 19), pans slightly, tilts down
      // - Demo/Tech (scroll ~0.6): camera rotates to dramatic angled elevation
      // - FAQ/Contact (scroll ~0.9+): camera pulls out wide to reveal overarching matrix
      const camZ = 24 - scrollProgress * 7 + Math.sin(scrollProgress * Math.PI) * 2
      const camY = 0.5 + Math.sin(scrollProgress * Math.PI * 2) * 2.5 - scrollProgress * 3
      const camX = mouseX * 2.5 + Math.sin(scrollProgress * Math.PI * 1.5) * 3

      camera.position.x += (camX - camera.position.x) * 0.08
      camera.position.y += (camY - camera.position.y) * 0.08
      camera.position.z += (camZ - camera.position.z) * 0.08

      // Camera tilt based on mouse & scroll
      camera.lookAt(
        globeGroup.position.x * 0.4 + mouseX * 2,
        globeGroup.position.y * 0.2 + mouseY * 1.5 - scrollProgress * 2,
        0
      )

      renderer.render(scene, camera)
    }

    animate()

    // ── Cleanup on unmount ──
    return () => {
      cancelAnimationFrame(animationFrameId)
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('scroll', handleScroll)
      window.removeEventListener('resize', handleResize)

      dotGeometry.dispose()
      dotMaterial.dispose()
      coreGeo.dispose()
      coreMat.dispose()
      ringGeo.dispose()
      ringMat.dispose()
      starGeo.dispose()
      starMat.dispose()
      gridHelper.geometry.dispose()
      gridHelper.material.dispose()

      if (container && renderer.domElement) {
        container.removeChild(renderer.domElement)
      }
      renderer.dispose()
    }
  }, [])

  // Reactive theme changes for 3D universe
  useEffect(() => {
    if (sceneRef.current) {
      sceneRef.current.fog = new THREE.FogExp2(dark ? 0x0a0908 : 0xfaf9f6, dark ? 0.028 : 0.02)
    }
    if (matsRef.current.gridHelper?.material) {
      matsRef.current.gridHelper.material.opacity = dark ? 0.28 : 0.16
    }
    if (matsRef.current.starMat) {
      matsRef.current.starMat.color.setHex(dark ? 0xebd5a7 : 0x9a8f7c)
      matsRef.current.starMat.opacity = dark ? 0.45 : 0.22
    }
    if (matsRef.current.coreMat) {
      matsRef.current.coreMat.color.setHex(dark ? 0x16120b : 0xebe7de)
      matsRef.current.coreMat.opacity = dark ? 0.22 : 0.12
    }
  }, [dark])

  return (
    <div
      ref={containerRef}
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden transition-all duration-300"
      style={{
        opacity: dark ? 0.95 : 0.38,
        mixBlendMode: dark ? 'screen' : 'multiply',
      }}
    />
  )
}
