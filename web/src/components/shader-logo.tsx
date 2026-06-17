"use client";

import { useEffect, useRef, useState } from "react";

type ShaderLogoProps = {
    className?: string;
};

const vertexShaderSource = `
attribute vec2 a_position;

void main() {
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const fragmentShaderSource = `
precision highp float;

uniform vec2 u_resolution;
uniform float u_time;

mat2 r2d(float a) {
  float c = cos(a), s = sin(a);
  return mat2(c, s, -s, c);
}

// ── Procedural 2D noise that replaces ShaderToy iChannel0 texture ──
// Bilinear-interpolated hash, tiled at 256 so patterns stay coherent.
float hash2d(vec2 p) {
  p = mod(p, 256.0);
  p = fract(p * vec2(0.1031, 0.1030));
  p += dot(p, p.yx + 33.33);
  return fract((p.x + p.y) * p.x);
}

float noiseLayer(vec2 uv) {
  vec2 i = floor(uv);
  vec2 f = fract(uv);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash2d(i),              hash2d(i + vec2(1.0, 0.0)), f.x),
    mix(hash2d(i + vec2(0.0, 1.0)), hash2d(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

// Matches iq's texture-based noise from the original ShaderToy.
// Returns ~[-8, -5.6] — the consistently-negative range is what creates
// the dense volumetric cloud around the crystal.
float noise(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (5.0 - 3.0 * f);
  vec2 uv0 = p.xy + vec2(37.0, 17.0) * p.z       + f.xy;
  vec2 uv1 = p.xy + vec2(37.0, 17.0) * (p.z + 1.0) + f.xy;
  return -8.0 + 2.4 * mix(noiseLayer(uv0), noiseLayer(uv1), f.z);
}

float fbm(vec3 p) {
  return noise(p * 0.06125) * 0.5
       + noise(p * 0.125)   * 0.25
       + noise(p * 0.25)    * 0.125;
}

vec3 fold(vec3 p) {
  vec3 nc = vec3(-0.5, -0.809017, 0.309017);
  for (int i = 0; i < 5; i++) {
    p.xy = abs(p.xy);
    p -= 2.0 * min(0.0, dot(p, nc)) * nc;
  }
  return p - vec3(0.0, 0.0, 1.275);
}

float sdfCrystal(vec3 p, float scale) {
  vec3 fp = fold(p * scale);
  // Matches original exactly — larger low-freq ripples produce the full flower shape
  float crystal = dot(fp, normalize(sign(fp) + 0.001)) - 0.1
                - sin(fp.y * 0.2) * 2.0
                - sin(fp.y * 0.7) * 1.0;
  crystal += min(fp.x * 1.0, sin(fp.y * 0.3));
  fp = fold(fp) - vec3( 0.2,  0.57, -0.2);
  fp = fold(fp) - vec3(-0.14, 0.99, -2.4);
  fp = fold(fp) - vec3(-0.03, 1.0,  -0.3);
  fp = fold(fp) - vec3( 0.0,  0.26,  0.0);
  crystal += sin(fp.y * 0.18) * 5.0;
  crystal *= 0.6;
  return crystal / scale;
}

float sdfMask(vec3 p) {
  p.x = abs(p.x) - 0.28;
  p.xz *= r2d(0.56);
  p.xy *= r2d(-0.01);
  return sdfCrystal(p, 3.0);
}

float de(vec3 p) {
  // Original animation — large horizontal sway is key to the look
  p.xy *= r2d(sin(u_time) * 0.3);
  p.xz *= r2d(sin(u_time * 2.0) * 0.12);
  p.xy *= r2d(sin(sin(u_time * 2.0) * 2.0) * 0.2);
  p.x  += sin(u_time * 2.0) * 0.9;
  // p * 0.1 makes the crystal 10× larger in world space — matches original
  return sdfMask(p * 0.1) / 0.1 + fbm(p * 35.0) * 0.1;
}

vec3 camera(vec3 ro, vec3 ta, vec2 uv) {
  vec3 fwd  = normalize(ta - ro);
  vec3 left = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up   = normalize(cross(fwd, left));
  return normalize(fwd + uv.x * left + up * uv.y);
}

float raymarch(vec3 rayOri, vec2 uv) {
  vec3 rayDir = camera(rayOri, vec3(0.0), uv);
  vec3 pos    = rayOri;

  float ldensity = 0.0;
  vec4  sum      = vec4(0.0);
  float tdist    = 0.0;
  float dist     = 0.0; // checked at top of loop (previous step's clamped dist)

  for (int i = 0; i < 64; i++) {
    if (dist < tdist * 0.001 || tdist > 25.0 || sum.a > 0.95) break;

    dist     = de(pos) * 0.59;
    ldensity = (0.05 - dist) * step(dist, 0.05);

    vec4 col = vec4(1.0);
    col.a    = ldensity;
    col.rgb *= col.a;
    sum      += (1.0 - sum.a) * col;
    sum.a    += 0.004; // base atmospheric scatter

    dist  = max(dist, 0.03);
    pos   += dist * rayDir;
    tdist += dist;
  }

  sum   *= 1.0 / exp(ldensity * 3.0) * 1.25;
  sum.r  = pow(max(sum.r, 0.0), 2.15);
  return sum.r;
}

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

void main() {
  // Aspect-correct UV matching the original exactly
  vec2 uv = gl_FragCoord.xy / u_resolution.xy - 0.5;
  uv.x   *= u_resolution.x / u_resolution.y;

  float rotDelta = 1.57;
  float zDst     = -19.5; // original camera distance

  vec3 ro1 = vec3(zDst * cos(rotDelta - 0.02), 0.0, zDst * sin(rotDelta - 0.02));
  vec3 ro2 = vec3(zDst * cos(rotDelta + 0.02), 0.0, zDst * sin(rotDelta + 0.02));

  float red  = raymarch(ro1, uv);
  float cyan = raymarch(ro2, uv);

  vec3  color    = vec3(red, cyan * 0.94, cyan);
  float grain    = hash31(vec3(gl_FragCoord.xy, floor(u_time * 12.0))) * 0.025;
  float vignette = smoothstep(0.92, 0.14, length(uv));

  color *= vignette;
  color += grain;

  float alpha = clamp(max(max(color.r, color.g), color.b) * 1.45 + vignette * 0.1, 0.0, 1.0);
  gl_FragColor = vec4(color, alpha);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
    const shader = gl.createShader(type);

    if (!shader) {
        return null;
    }

    gl.shaderSource(shader, source);
    gl.compileShader(shader);

    if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        return shader;
    }

    gl.deleteShader(shader);
    return null;
}

function createProgram(gl: WebGLRenderingContext) {
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    if (!vertexShader || !fragmentShader) {
        return null;
    }

    const program = gl.createProgram();

    if (!program) {
        gl.deleteShader(vertexShader);
        gl.deleteShader(fragmentShader);
        return null;
    }

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    gl.deleteShader(vertexShader);
    gl.deleteShader(fragmentShader);

    if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
        return program;
    }

    gl.deleteProgram(program);
    return null;
}

export function ShaderLogo({ className = "" }: ShaderLogoProps) {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const [isReady, setIsReady] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;

        if (!canvas) {
            return;
        }

        const gl = canvas.getContext("webgl", {
            alpha: true,
            antialias: true,
            premultipliedAlpha: false,
        });

        if (!gl) {
            return;
        }

        const program = createProgram(gl);

        if (!program) {
            return;
        }

        const positionLocation = gl.getAttribLocation(program, "a_position");
        const resolutionLocation = gl.getUniformLocation(program, "u_resolution");
        const timeLocation = gl.getUniformLocation(program, "u_time");
        const buffer = gl.createBuffer();

        if (!buffer || !resolutionLocation || !timeLocation) {
            gl.deleteProgram(program);
            return;
        }

        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
            -1, -1,
            1, -1,
            -1, 1,
            1, 1,
        ]), gl.STATIC_DRAW);

        gl.useProgram(program);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
        gl.clearColor(0, 0, 0, 0);

        const resize = () => {
            const dpr = Math.min(window.devicePixelRatio || 1, 2);
            const width = Math.max(1, Math.floor(canvas.clientWidth * dpr));
            const height = Math.max(1, Math.floor(canvas.clientHeight * dpr));

            if (canvas.width !== width || canvas.height !== height) {
                canvas.width = width;
                canvas.height = height;
                gl.viewport(0, 0, width, height);
            }
        };

        let frameId = 0;

        const render = (time: number) => {
            resize();
            gl.clear(gl.COLOR_BUFFER_BIT);
            gl.uniform2f(resolutionLocation, canvas.width, canvas.height);
            gl.uniform1f(timeLocation, time * 0.001);
            gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
            frameId = window.requestAnimationFrame(render);
        };

        setIsReady(true);
        frameId = window.requestAnimationFrame(render);

        return () => {
            window.cancelAnimationFrame(frameId);
            gl.deleteBuffer(buffer);
            gl.deleteProgram(program);
        };
    }, []);

    return (
        <span
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden bg-black shadow-[0_14px_34px_rgba(0,0,0,0.45)] ${className}`}
            aria-hidden="true"
        >
            <canvas ref={canvasRef} className="h-full w-full" />
            {isReady ? null : (
                <span className="absolute inset-0 flex items-center justify-center text-xs font-semibold uppercase tracking-[0.28em] text-foreground">
                    LY
                </span>
            )}
        </span>
    );
}