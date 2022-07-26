// ================================================== [50]
//     Definition

'use strict'

// Quaternion
function qMultiply(p, q) {
    return new Quaternion(p.w*q.w - p.x*q.x - p.y*q.y - p.z*q.z,
                          p.w*q.x + p.x*q.w + p.y*q.z - p.z*q.y,
                          p.w*q.y - p.x*q.z + p.y*q.w + p.z*q.x,
                          p.w*q.z + p.x*q.y - p.y*q.x + p.z*q.w)
}
function qRotation(targetVertex, rotationQuaternion) {
    const p = new Quaternion(targetVertex) // Target Quaternion
    const q = rotationQuaternion
    const q_ = q.conjugate()
    return qMultiply(qMultiply(q, p), q_)
}

// Vector
function genVector(from, to) {
    return new Vector(to.x - from.x,
                      to.y - from.y,
                      to.z - from.z)
}
function distance(u, v) {
    return Math.sqrt((u.x - v.x)**2 +
                     (u.y - v.y)**2 +
                     (u.z - v.z)**2  )
}
function innerProduct(u, v) {
    return (u.x*v.x +
            u.y*v.y +
            u.z*v.z  )
}
function crossProduct(u, v) {
    return new Vector(u.y*v.z - u.z*v.y,
                      u.z*v.x - u.x*v.z,
                      u.x*v.y - u.y*v.x)
}
function add(a, u, b, v) {
    return new Vector(a*u.x + b*v.x,
                      a*u.y + b*v.y,
                      a*u.z + b*v.z)
}
function world(offset, a, v) {
    return new Vertex(offset.x + a*v.x,
                      offset.y + a*v.y,
                      offset.z + a*v.z)
}
function world2V(offset, a, u, b, v) {
    return world(offset, 1, add(a, u, b, v))
}

// Solve Cubic Equation
// https://science-log.com/数学/3次方程式の解析解（厳密解）を求めてみる
// x^3 + ax^2 + bx + c = 0
function sce(a, b, c) {
    const p = -(a**2)/3 + b
    const q = 2*a**3/27 - a*b/3 + c
    const r = q**2/4 + p**3/27
    let A, B
    if (r < 0) {
        const r_ = new ComplexNumber(r).pow(1/2)
        const q_ = new ComplexNumber(-q/2)
        A = q_.t(r_).pow(1/3)
        r_.theta += Math.PI
        B = q_.t(r_).pow(1/3)
    } else {
        A = -q/2 + Math.sqrt(r)
        B = -q/2 - Math.sqrt(r)
        A = new ComplexNumber(Math.pow(Math.abs(A), 1/3), 0 <= A ? 0 : Math.PI)
        B = new ComplexNumber(Math.pow(Math.abs(B), 1/3), 0 <= B ? 0 : Math.PI)
    }
    const w = new ComplexNumber(1, 2/3*Math.PI)
    const C = new ComplexNumber(a/3, Math.PI)
    const A2 = A.x(w)
    const B2 = B.x(w).x(w)
    const A3 = A.x(w).x(w)
    const B3 = B.x(w)
    return [C.t(A ).t(B ),
            C.t(A2).t(B2),
            C.t(A3).t(B3)]
}

// Solve Quartic Equation
// https://science-log.com/数学/4次方程式の解の公式（ferrariの解法）
// x^4 + ax^3 + bx^2 + cx + d = 0
function sqe(a, b, c, d) {
    const p = -3*a**2/8 + b
    const q = a**3/8 - a*b/2 + c
    const r = -3*a**4/256 + a**2*b/16 - a*c/4 + d
    const lambda = sce(-p/2, -r, p*r/2 - q**2/8)[0]
    const neg_1 = new ComplexNumber(-1)
    const two   = new ComplexNumber(2)
    const four  = new ComplexNumber(4)
    const neg_p = new ComplexNumber(p, Math.PI)
    const neg_q = new ComplexNumber(q, Math.PI)
    const neg_r = new ComplexNumber(r, Math.PI)
    const m = two.x(lambda).t(neg_p).pow(1/2)
    let n = neg_q.x(two.x(m).pow(-1)) // if m is zero, n will be zero
    if (Math.abs(m.r) < 0.001) // calculate n in a different way
        n = lambda.pow(2).t(neg_r).pow(1/2)
    const neg_m = m.x(neg_1)
    const neg_n = n.x(neg_1)

    let tmp1 = lambda.t(    n).x(four).x(neg_1).t(m.pow(2)).pow(1/2)
    let tmp2 = lambda.t(neg_n).x(four).x(neg_1).t(m.pow(2)).pow(1/2)
    let ans1 = neg_m.t(tmp1)
    let ans2 = neg_m.t(tmp1.x(neg_1))
    let ans3 = m.t(tmp2)
    let ans4 = m.t(tmp2.x(neg_1))
    ans1.r /= 2
    ans2.r /= 2
    ans3.r /= 2
    ans4.r /= 2
    ans1 = ans1.t(new ComplexNumber(a/4).x(neg_1))
    ans2 = ans2.t(new ComplexNumber(a/4).x(neg_1))
    ans3 = ans3.t(new ComplexNumber(a/4).x(neg_1))
    ans4 = ans4.t(new ComplexNumber(a/4).x(neg_1))
    return [ans1, ans2, ans3, ans4]
}

// ================================================== [50]
//     END
// ================================================== [50]