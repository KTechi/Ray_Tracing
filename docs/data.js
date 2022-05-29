// ================================================== [50]
//     Definition

'use strict'

const canvas = document.createElement('canvas')
const canvas2= document.createElement('canvas')
const context = canvas.getContext('2d')
const context2= canvas2.getContext('2d')
const aln = 200 // Axis Length
const axisX = new Edge(new Vertex(-aln, 0, 0), new Vertex(aln, 0, 0))
const axisY = new Edge(new Vertex(0, -aln, 0), new Vertex(0, aln, 0))
const axisZ = new Edge(new Vertex(0, 0, -aln), new Vertex(0, 0, aln))
const zero = new Vector(0, 0, 0)
const vertices = []
const edges = []
let scale = .1
let VW = window.innerWidth
let VH = window.innerHeight
let VW2 = window.innerWidth
let VH2 = window.innerHeight
let imageData = context.getImageData(0, 0, VW, VH)
let data = imageData.data
let pitch = 0
let roll  = 0
let yaw   = 0
let wireframe = false

const camera = new Vertex(0, -700, 200)
const screen = new Vector(0, 7, -2)
screen.normalize()
const light = new Vertex(0, 0, 1000000)

const planeInfty = new PlaneInfty(
    new Vertex(0, 0, 0),
    new Quaternion(0, new Vector(1, 0, 0)),
    new Material(255, 255, 0, 1, 0.9)
)
const pic = new PlaneInftyChecker(
    new Vertex(0, 0, -150),
    new Quaternion(0, new Vector(1, 0, 0)),
    new Material(255, 255, 0, 1, 0.9)
)
const plane = new Plane(
    -100, -100, 200, 200, // x, y, w, h
    new Vertex(0, 0, 0),
    new Quaternion(Math.PI/4, new Vector(1, 0, 0)),
    new Material(255, 255, 0, 1, 0.9)
)
const sphere = new Sphere(
    200, // R
    new Vertex(0, 0, 0),
    new Material(255, 100, 255, 1, 0.4)
)
const sphereMirror = new SphereMirror(
    200, // R
    new Vertex(0, 0, 0),
    new Material(255, 100, 255, 1, 0.4)
)
const torus = new Torus(
    200, 50, // R, r
    new Vertex(0, 0, 0),
    new Quaternion(0, new Vector(1, 0, 0)),
    new Material(100, 255, 255, 1, 0.4)
)

// ================================================== [50]
//     END
// ================================================== [50]