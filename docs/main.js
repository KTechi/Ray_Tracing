// ================================================== [50]
//     Main

'use strict'

function paint() {
    context.clearRect(0, 0, VW, VH)
    imageData = context.getImageData(0, 0, VW, VH)
    data = imageData.data

    // Quaternion
    const q_p = new Quaternion(pitch, new Vector(1, 0, 0))
    const q_r = new Quaternion(roll , new Vector(0, 1, 0))
    const q_y = new Quaternion(yaw  , new Vector(0, 0, 1))
    const q = qMultiply(qMultiply(q_r, q_p), q_y)

    const screen_pos = world(camera, 500, screen)
    const upVector = new Vector(0, 0, 1)
    const screenX = crossProduct(screen, upVector)
    const screenY = crossProduct(screen, screenX)
    screenX.normalize()
    screenY.normalize()
    screenX.scale(1/scale)
    screenY.scale(1/scale)
    const north_west = world2V(screen_pos, -VW/2, screenX, -VH/2, screenY)

    // Pixel
    if (!wireframe)
    for (let y = 0; y < VH; y++)
    for (let x = 0; x < VW; x++) {
        // anti-aliasing
        const base = 4*(y*VW + x)
        let r = 0
        let g = 0
        let b = 0
        // for (let dy = -.3; dy < .4; dy += .3)
        // for (let dx = -.3; dx < .4; dx += .3) {
            // const pixel = world2V(north_west, x+dx, screenX, y+dy, screenY)
            const pixel = world2V(north_west, x, screenX, y, screenY)
            const ray = genVector(camera, pixel)
    
            let colPoint = torus.getColisionPoint(camera, ray,
                y == parseInt(14) &&
                x == parseInt(10)
            )
            // let colPoint = { visible: false } //torus.getColisionPoint(camera, ray)
            let tmp = pic.getColisionPoint(camera, ray)
            if (colPoint.visible === false || tmp.t < colPoint.t) colPoint = tmp
            
            tmp = sphereMirror.getColisionPoint(camera, ray)
            if (colPoint.visible === false || tmp.t < colPoint.t) colPoint = tmp
    
            if (colPoint.visible) {
                r += colPoint.r
                g += colPoint.g
                b += colPoint.b
            } else {
                r += 30
                g += 30
                b += 30
            }
        // }
        data[base + 0] = parseInt(r/9)
        data[base + 1] = parseInt(g/9)
        data[base + 2] = parseInt(b/9)
        data[base + 3] = 255
    }
    if (!wireframe)
        context.putImageData(imageData, 0, 0)

    // Wireframe
    if (wireframe) {
        context2.clearRect(0, 0, VW2, VH2)
        context2.lineWidth = 1.5
        context2.strokeStyle = 'rgba(255, 255, 255, 1)'
        context2.fillStyle   = 'rgba(255, 255, 255, 1)'
        // for (const list of torus.wireframe()) {
        for (const list of torus.wireframe().concat(sphereMirror.wireframe())) {
            const vtx = []
            for (const li of list) {
                const s2c = genVector(screen_pos, camera)
                const v   = genVector(camera, li)
                v.normalize()
                const t = -(s2c.norm()**2) / innerProduct(v, s2c) / scale
                vtx.push({
                    x: t * innerProduct(v, screenX) / screenX.norm()**2,
                    y: t * innerProduct(v, screenY) / screenY.norm()**2
                })
            }
            context2.beginPath()
            context2.moveTo(VW2/2 + vtx[0].x, VH2/2 + vtx[0].y)
            context2.bezierCurveTo(
                VW2/2 + vtx[1].x, VH2/2 + vtx[1].y,
                VW2/2 + vtx[2].x, VH2/2 + vtx[2].y,
                VW2/2 + vtx[3].x, VH2/2 + vtx[3].y)
            context2.stroke()
        }
        // for (const vtx of torus.vertex()) {
        for (const vtx of torus.vertex().concat(sphereMirror.vertex())) {
            const s2c = genVector(screen_pos, camera)
            const vec= genVector(camera, vtx)
            vec.normalize()
            const t = -(s2c.norm()**2) / innerProduct(vec, s2c) / scale
            const v = {
                x: t * innerProduct(vec, screenX) / screenX.norm()**2,
                y: t * innerProduct(vec, screenY) / screenY.norm()**2
            }
            context2.beginPath()
            context2.arc(VW2/2 + v.x, VH2/2 + v.y, 1.5, 0, 2*Math.PI, true)
            context2.fill()
        }
    }

    // Axis
    // context.lineWidth = 2
    // context.strokeStyle = 'rgb(255, 0, 0, 1)'
    // context.fillStyle   = 'rgb(255, 0, 0, 1)'
    // paintEdgeR(axisX, q)
    // paintVertexR(axisX.v, q)
    // context.strokeStyle = 'rgb(0, 255, 0, 1)'
    // context.fillStyle   = 'rgb(0, 255, 0, 1)'
    // paintEdgeR(axisY, q)
    // paintVertexR(axisY.v, q)
    // context.strokeStyle = 'rgb(0, 127, 255, 1)'
    // context.fillStyle   = 'rgb(0, 127, 255, 1)'
    // paintEdgeR(axisZ, q)
    // paintVertexR(axisZ.v, q)
}
function paintVertex(v) {
    context.beginPath()
    context.arc(VW/2 + v.x, VH/2 - v.z, 3, 0, 2*Math.PI, true)
    context.fill()
}
function paintVertexR(v, q) {
    paintVertex(qRotation(v, q))
}
function paintEdge(e) {
    context.beginPath()
    context.moveTo(VW/2 + e.u.x, VH/2 - e.u.z)
    context.lineTo(VW/2 + e.v.x, VH/2 - e.v.z)
    context.stroke()
}
function paintEdgeR(e, q) {
    paintEdge(new Edge(qRotation(e.u, q),
                       qRotation(e.v, q)))
}

// ================================================== [50]
//     Window

window.onload = load
// window.onresize = resize
function load() {
    document.body.append(canvas)
    document.body.append(canvas2)
    canvas2.style.pointerEvents = 'none'
    resize()
    console.log('Ready')
}
function resize() {
    VW = parseInt(scale * canvas.clientWidth)
    VH = parseInt(scale * canvas.clientHeight)
    VW2 = parseInt(canvas.clientWidth)
    VH2 = parseInt(canvas.clientHeight)
    canvas.width  = VW
    canvas.height = VH
    canvas2.width  = VW2
    canvas2.height = VH2
    paint()
}
function isMobile() {
    const regexp = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
    return window.navigator.userAgent.search(regexp) !== -1
}

// ================================================== [50]
//     END
// ================================================== [50]