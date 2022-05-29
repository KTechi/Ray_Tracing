// ================================================== [50]
//     Definition

'use strict'

// ================================================== [50]
//     Animation

let animation = setInterval(repeat, 100)
setTimeout(stop, 1 * 1000)
function repeat() {
    console.log('Animation')
}
function stop() {
    clearInterval(animation)
    console.log('Animation STOP')
}

// ================================================== [50]
//     Scroll Listener

document.addEventListener('mousewheel', mousewheel, { passive: false })
function mousewheel(event) {
    // Disable scroll event
    event.preventDefault()
    
    yaw   = (yaw   - 0.01 * event.deltaX) % (2*Math.PI)
    pitch = (pitch - 0.01 * event.deltaY)
    if (pitch < -Math.PI / 2) pitch = -Math.PI / 2
    if ( Math.PI / 2 < pitch) pitch =  Math.PI / 2
    
    if (!shift) {
        const q_x = new Quaternion(lock_x ? 0 : -.005 * event.deltaX, new Vector(0, 0, 1))
        const q_y = new Quaternion(lock_y ? 0 : -.005 * event.deltaY, new Vector(1, 0, 0))
        const q = qMultiply(q_y, q_x)
        torus.q = qMultiply(q, torus.q)
    } else {
        const qq_x = new Quaternion(lock_x ? 0 : -.0005 * event.deltaX, new Vector(0, 0, 1))
        const qq_y = new Quaternion(lock_y ? 0 : -.0005 * event.deltaY, new Vector(1, 0, 0))
        qq = qMultiply(qq_y, qq_x)
        const tmp = qRotation(screen, qq)
        screen.x = tmp.x
        screen.y = tmp.y
        screen.z = tmp.z
    }

    paint()
}
let qq = new Quaternion(1, 0, 0, 0)

// ================================================== [50]
//     Mouse Event

//canvas.addEventListener('click'    , click    , false)
//canvas.addEventListener('dblclick' , dblclick , false)
//canvas.addEventListener('mousedown', mousedown, false)
//canvas.addEventListener('mouseup'  , mouseup  , false)
function click(event) {
  console.log('Mouse Click:', event.button)
}
function dblclick(event) {
  if (document.pointerLockElement === null)
    canvas.requestPointerLock()
  else
    document.exitPointerLock()
}
function mousedown(event) {}
function mouseup(event) {}

// ====

//canvas.addEventListener('mouseenter' , mouseenter, false)
//canvas.addEventListener('mouseleave' , mouseleave, false)
//canvas.addEventListener('mouseover'  , mouseover , false)
//canvas.addEventListener('mouseout'   , mouseout  , false)
//canvas.addEventListener('contextmenu', contextmenu, false)
function mouseenter(event) {}
function mouseleave(event) {}
function mouseover(event) {}
function mouseout(event) {}
function contextMenu(event) {}

// ====

canvas.addEventListener('mousemove', mousemove, false)
function mousemove(event) {
  if (document.pointerLockElement === canvas) {
    console.log(event.movementX, event.movementY)
  }
  
  if (event.buttons === 1) {
    camera.x -= event.movementX
    camera.y += event.movementY
    resize()
  }
}

// ================================================== [50]
//     Key Listener

let lock_x = false
let lock_y = false
let shift = false
document.addEventListener('keypress', keypress, false)
document.addEventListener('keydown' , keydown , false)
document.addEventListener('keyup'   , keyup   , false)
function keypress(event) {}
function keydown(event) {
    switch (event.key) {
        case 'Meta':
            lock_x = true
            break
        case 'Alt':
            lock_y = true
            break
        case 'Shift':
            shift = true
            break
        // default:
        //     console.log(event.key)
    }
}
function keyup(event) {
    switch (event.key) {
        case 'Meta':
            lock_x = false
            break
        case 'Alt':
            lock_y = false
            break
        case 'Shift':
            shift = false
            break
        // default:
        //     console.log(event.key)
    }
}

// ================================================== [50]
//     END
// ================================================== [50]