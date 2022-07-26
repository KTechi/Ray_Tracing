// ================================================== [50]
//     Definition

'use strict'

class ComplexNumber {
    constructor(...args) {
        if (args.length === 1) {
            // Real Number
            this.r = Math.abs(args[0])
            this.theta = 0 <= args[0] ? 0 : Math.PI
        } else if (args.length === 2) {
            // Complex Number
            this.r = args[0]
            this.theta = args[1]
        } else {
            throw '[Argument number: ERROR]'
        }
    }

    R() {
        const r = this.r * Math.cos(this.theta)
        return Math.abs(r) < 0.0000000001 ? 0 : r
    }

    I() {
        const i = this.r * Math.sin(this.theta)
        return Math.abs(i) < 0.0000000001 ? 0 : i
    }

    t(num) {
        const R = this.R() + num.R()
        const I = this.I() + num.I()
        const r = Math.sqrt(R**2 + I**2)
        const theta = Math.atan2(I, R)
        return new ComplexNumber(r, theta)
    }

    x(num) {
        return new ComplexNumber(this.r * num.r, this.theta + num.theta)
    }

    pow(n) {
        return new ComplexNumber(Math.pow(this.r, n), n * this.theta)
    }

    print() {
        console.log(this.R() + ' + ' + this.I() + 'i')
    }
}

class Quaternion {
    constructor(...args) {
        if (args.length === 1) {
            // Vector
            this.w = 0
            this.x = args[0].x
            this.y = args[0].y
            this.z = args[0].z
        } else if (args.length === 2) {
            // Angle, Axis
            this.w = Math.cos(args[0] / 2)
            this.x = Math.sin(args[0] / 2) * args[1].x
            this.y = Math.sin(args[0] / 2) * args[1].y
            this.z = Math.sin(args[0] / 2) * args[1].z
        } else if (args.length === 3) {
            // x, y, z
            this.w = 0
            this.x = args[0]
            this.y = args[1]
            this.z = args[2]
        } else if (args.length === 4) {
            // w, x, y, z
            this.w = args[0]
            this.x = args[1]
            this.y = args[2]
            this.z = args[3]
        } else {
            throw '[Argument number: ERROR]'
        }
    }

    clone() {
        return new Quaternion(this.w, this.x, this.y, this.z)
    }

    conjugate() {
        return new Quaternion(this.w, -this.x, -this.y, -this.z)
    }

    toVector() {
        return new Vector(this.x, this.y, this.z)
    }
}

class Vertex {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    clone() {
        return new Vertex(this.x, this.y, this.z)
    }

    toVector() {
        return new Vector(this.x, this.y, this.z)
    }
}

class Edge {
    constructor(u, v) {
        this.u = u
        this.v = v
    }

    clone() {
        return new Edge(this.u.clone(), this.v.clone())
    }
}

class Vector {
    constructor(x, y, z) {
        this.x = x
        this.y = y
        this.z = z
    }

    clone() {
        return new Vector(this.x, this.y, this.z)
    }

    norm() {
        return Math.sqrt(this.x**2 + this.y**2 + this.z**2)
    }

    scale(s) {
        this.x *= s
        this.y *= s
        this.z *= s
    }

    normalize() {
        this.scale(1 / this.norm())
    }
}

class Material {
    constructor(r, g, b, Kd, Ks) {
        this.r = r
        this.g = g
        this.b = b
        this.Kd = Kd // Diffuse
        this.Ks = Ks // Specular
    }

    clone() {
        return new Material(this.r, this.g, this.b, this.Kd, this.Ks)
    }
}

// Primitive
class PlaneInfty {
    constructor(origin, quaternion, material) {
        this.origin = origin
        this.q = quaternion
        this.m = material
    }

    getColisionPoint(from, direction) {
        const cam    = qRotation(world(from , -1, this.origin), this.q.conjugate()).toVector()
        const ray    = qRotation(direction                    , this.q.conjugate()).toVector()
        const light_ = qRotation(world(light, -1, this.origin), this.q.conjugate()).toVector()
        ray.normalize()
    
        const t = -cam.z / ray.z
        if (t < 0) return { visible: false } // Opposite Direction
    
        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const n = new Vector(0, 0, 1)
        l.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) {
            n.z = -1
            inp = innerProduct(l, n)
            if (inp < 0) inp = 0
        }
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30
        return {
            visible: true, t: t,
            r: this.m.r*diff + 255*spec,
            g: this.m.g*diff + 255*spec,
            b: this.m.b*diff + 255*spec,
        }
    }
}

class PlaneInftyChecker extends PlaneInfty {
    getColisionPoint(from, direction) {
        const cam    = qRotation(world(from , -1, this.origin), this.q.conjugate()).toVector()
        const ray    = qRotation(direction                    , this.q.conjugate()).toVector()
        const light_ = qRotation(world(light, -1, this.origin), this.q.conjugate()).toVector()
        ray.normalize()

        const t = -cam.z / ray.z
        if (t < 0) return { visible: false } // Opposite Direction
        let m = this.m.clone()
        const x = cam.x + t*ray.x
        const y = cam.y + t*ray.y
        if ((parseInt(x/60) + parseInt(y/60)) % 2 === 0) m = new Material(0, 0, 255, 1, 1)
        
        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const n = new Vector(0, 0, 1)
        l.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) {
            n.z = -1
            inp = innerProduct(l, n)
            if (inp < 0) inp = 0
        }
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30
        return {
            visible: true, t: t,
            r: m.r*diff + 255*spec,
            g: m.g*diff + 255*spec,
            b: m.b*diff + 255*spec,
        }
    }
}

class Plane {
    constructor(x, y, w, h, origin, quaternion, material) {
        this.x1 = x
        this.y1 = y
        this.x2 = x + w
        this.y2 = y + h
        this.origin = origin
        this.q = quaternion
        this.m = material
    }

    getColisionPoint(from, direction) {
        const cam    = qRotation(world(from , -1, this.origin), this.q.conjugate()).toVector()
        const ray    = qRotation(direction                    , this.q.conjugate()).toVector()
        const light_ = qRotation(world(light, -1, this.origin), this.q.conjugate()).toVector()
        ray.normalize()
    
        const t = -cam.z / ray.z
        if (t < 0) return { visible: false } // Opposite Direction
        const x = cam.x + t*ray.x
        const y = cam.y + t*ray.y
        if (x < this.x1 || this.x2 < x || y < this.y1 || this.y2 < y) return { visible: false } // Out of Face

        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const n = new Vector(0, 0, 1)
        l.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) {
            n.z = -1
            inp = innerProduct(l, n)
            if (inp < 0) inp = 0
        }
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30
        return {
            visible: true, t: t,
            r: this.m.r*diff + 255*spec,
            g: this.m.g*diff + 255*spec,
            b: this.m.b*diff + 255*spec,
        }
    }
}

class Sphere {
    constructor(r, origin, material) {
        this.r = r
        this.origin = origin
        this.m = material
    }

    getColisionPoint(from, direction) {
        const cam    = world(from , -1, this.origin).toVector()
        const ray    = direction.clone()
        const light_ = world(light, -1, this.origin).toVector()
        ray.normalize()
        const b = innerProduct(ray, cam)
        const c = genVector(zero, cam).norm()**2 - this.r**2
        
        if (b*b - c < 0) return { visible: false }
        let t = undefined
        const t1 = -b + Math.sqrt(b*b - c)
        const t2 = -b - Math.sqrt(b*b - c)
        if (0 < t1) t = t1
        if (0 < t2 && t2 < t) t = t2
        if (t === undefined) return { visible: false }
    
        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const n = genVector(zero, v)
        l.normalize()
        n.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) inp = 0
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30
        return {
            visible: true, t: t,
            r: this.m.r*diff + 255*spec,
            g: this.m.g*diff + 255*spec,
            b: this.m.b*diff + 255*spec,
        }
    }

    vertex() {
        const array = []
        // for (let R = .02; R < 1; R += .04)
        // for (let r = .05; r < 1; r += .1) {
        for (let R = .04; R < 1; R += .0834)
        for (let r = .02; r < 1; r += .04) {
            const x = this.r*Math.sin(R*Math.PI) * Math.cos(r*2*Math.PI)
            const y = this.r*Math.sin(R*Math.PI) * Math.sin(r*2*Math.PI)
            const z = this.r*Math.cos(R*Math.PI)
            array.push(world(this.origin, 1, new Vertex(x, y, z)))
        }
        return array
    }

    wireframe() {
        const array = []
        const p = 4*(Math.sqrt(2)-1)/3
        const origin = this.origin
        for (let i = 0; i < 1; i += .0834) {
            function a(x, y) {
                return world(origin, 1, new Vertex(x, y, z))
            }
            const z = this.r*Math.cos(i*Math.PI)
            const r = this.r*Math.sin(i*Math.PI)
            array.push([a( r,  0), a(   r,  p*r), a( p*r,    r), a( 0,  r)])
            array.push([a( 0,  r), a(-p*r,    r), a(  -r,  p*r), a(-r,  0)])
            array.push([a(-r,  0), a(  -r, -p*r), a(-p*r,   -r), a( 0, -r)])
            array.push([a( 0, -r), a( p*r,   -r), a(   r, -p*r), a( r,  0)])
        }
        for (let i = 0; i < 1; i += .04) {
            function a(x, y, z) {
                return world(origin, 1, new Vertex(x, y, z))
            }
            const x = this.r*Math.cos(i*2*Math.PI)
            const y = this.r*Math.sin(i*2*Math.PI)
            const r = this.r
            array.push([a(0, 0, r), a(p*x, p*y,    r), a(  x,   y, p*r), a(x, y,  0)])
            array.push([a(x, y, 0), a(  x,   y, -p*r), a(p*x, p*y,  -r), a(0, 0, -r)])
        }
        return array
    }
}

class SphereMirror extends Sphere{
    getColisionPoint(from, direction) {
        const cam    = world(from , -1, this.origin).toVector()
        const ray    = direction.clone()
        const light_ = world(light, -1, this.origin).toVector()
        ray.normalize()
        const b = innerProduct(ray, cam)
        const c = genVector(zero, cam).norm()**2 - this.r**2
        
        if (b*b - c < 0) return { visible: false }
        let t = undefined
        const t1 = -b + Math.sqrt(b*b - c)
        const t2 = -b - Math.sqrt(b*b - c)
        if (0 < t1) t = t1
        if (0 < t2 && t2 < t) t = t2
        if (t === undefined) return { visible: false }
        
        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const n = genVector(zero, v)
        l.normalize()
        n.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) inp = 0
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30

        const c_ = genVector(v, cam)
        c_.normalize()
        inp = innerProduct(c_, n)
        if (inp < 0) inp = 0
        const r_ = n.clone()
        r_.scale(2*inp)
        r_.x -= c_.x
        r_.y -= c_.y
        r_.z -= c_.z
        const tmp_m = pic.getColisionPoint(world(v, 1, this.origin), r_)
        const new_m = tmp_m.visible? {
            r: tmp_m.r *.6 + this.m.r*diff *.4,
            g: tmp_m.g *.6 + this.m.g*diff *.4,
            b: tmp_m.b *.6 + this.m.b*diff *.4,
        } : {
            r: this.m.r*diff,
            g: this.m.g*diff,
            b: this.m.b*diff,
        }
        return {
            visible: true, t: t,
            r: new_m.r + 255*spec,
            g: new_m.g + 255*spec,
            b: new_m.b + 255*spec,
        }
    }
}

class Torus {
    constructor(R, r, origin, quaternion, material) {
        this.R = R
        this.r = r
        this.origin = origin
        this.q = quaternion
        this.m = material
    }

    getColisionPoint(from, direction, pr) {
        const cam    = qRotation(world(from , -1, this.origin), this.q.conjugate()).toVector()
        const ray    = qRotation(direction                    , this.q.conjugate()).toVector()
        const light_ = qRotation(world(light, -1, this.origin), this.q.conjugate()).toVector()
        ray.normalize()
        const c2 = 2 * innerProduct(ray, cam)
        const c3 = cam.norm()**2 + this.R**2 - this.r**2
        const c4 = 4 * this.R**2 * (ray.x**2 + ray.y**2)
        const c5 = 8 * this.R**2 * (ray.x*cam.x + ray.y*cam.y)
        const c6 = 4 * this.R**2 * (cam.x**2 + cam.y**2)
        const answer = sqe(
            2*c2,
            2*c3 + c2**2 - c4,
            2*c2*c3 - c5,
            c3**2 - c6, pr)
        if (pr) {
            console.log('===========================')
            console.log(answer)
            console.log(cam, ray)
            console.log(
                2*c2,
                2*c3 + c2**2 - c4,
                2*c2*c3 - c5,
                c3**2 - c6)
        }
    
        let t = undefined
        for (const tmp of answer)
            if (Math.abs(tmp.I()) < 0.000000000001 && 0 < tmp.R() && (t === undefined || tmp.R() < t))
                t = tmp.R()
        if (t === undefined) return { visible: false }
    
        const v = world(cam, t, ray)
        const l = genVector(v, light_)
        const angle = Math.atan2(v.y, v.x)
        const n = new Vector(
            v.x - this.R*Math.cos(angle),
            v.y - this.R*Math.sin(angle),
            v.z)
        l.normalize()
        n.normalize()
        let inp = innerProduct(l, n)
        if (inp < 0) inp = 0
        const r = n.clone()
        r.scale(2*inp)
        r.x -= l.x
        r.y -= l.y
        r.z -= l.z
        r.normalize()
        const toCam = genVector(v, cam)
        toCam.normalize()
        const alpha = innerProduct(r, toCam) < 0 ? 0 : innerProduct(r, toCam)
        const diff = alpha + 0.2
        const spec = alpha**30
        return {
            visible: true, t: t,
            r: this.m.r*diff + 255*spec,
            g: this.m.g*diff + 255*spec,
            b: this.m.b*diff + 255*spec,
        }
    }

    vertex() {
        const array = []
        const PI2 = 2 * Math.PI
        for (let R = .02; R < 1; R += .04)
        for (let r = .05; r < 1; r += .1) {
            const x = (this.R + this.r*Math.cos(r*PI2)) * Math.cos(R*PI2)
            const y = (this.R + this.r*Math.cos(r*PI2)) * Math.sin(R*PI2)
            const z = this.r*Math.sin(r*PI2)
            array.push(world(this.origin, 1, qRotation(new Vertex(x, y, z), this.q)))
        }
        return array
    }

    wireframe() {
        const array = []
        const p = 4*(Math.sqrt(2)-1)/3
        const R = this.R
        const r = this.r
        const q = this.q
        const origin = this.origin
        for (let i = 0; i < 1; i += .1) {
            function a(x, y) {
                return world(origin, 1, qRotation(new Vertex(x, y, r*Math.sin(i*2*Math.PI)), q))
            }
            const s = r*Math.cos(i*2*Math.PI) + R
            array.push([a( s,   0), a(   s,  p*s), a( p*s,    s), a(  0,  s)])
            array.push([a(  0,  s), a(-p*s,    s), a(  -s,  p*s), a(-s,   0)])
            array.push([a(-s,   0), a(  -s, -p*s), a(-p*s,   -s), a(  0, -s)])
            array.push([a(  0, -s), a( p*s,   -s), a(   s, -p*s), a( s,   0)])
        }
        for (let i = 0; i < 1; i += .04) {
            function a(x, y, k) {
                return world(origin, 1, qRotation(new Vertex(x, y, k*r), q))
            }
            const cos = Math.cos(i*2*Math.PI)
            const sin = Math.sin(i*2*Math.PI)
            const x1 = (R + r*4/3)*cos
            const y1 = (R + r*4/3)*sin
            const x2 = (R - r*4/3)*cos
            const y2 = (R - r*4/3)*sin
            array.push([a(R*cos, R*sin,  1), a(x1, y1,  1), a(x1, y1, -1), a(R*cos, R*sin, -1)])
            array.push([a(R*cos, R*sin, -1), a(x2, y2, -1), a(x2, y2,  1), a(R*cos, R*sin,  1)])
        }
        return array
    }
}

// ================================================== [50]
//     END
// ================================================== [50]