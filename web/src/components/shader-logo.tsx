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
  float c = cos(a);
  float s = sin(a);
  return mat2(c, s, -s, c);
}

float hash31(vec3 p) {
  p = fract(p * 0.1031);
  p += dot(p, p.yzx + 33.33);
  return fract((p.x + p.y) * p.z);
}

float noise3(vec3 x) {
  vec3 p = floor(x);
  vec3 f = fract(x);
  f = f * f * (3.0 - 2.0 * f);

  float n000 = hash31(p + vec3(0.0, 0.0, 0.0));
  float n100 = hash31(p + vec3(1.0, 0.0, 0.0));
  float n010 = hash31(p + vec3(0.0, 1.0, 0.0));
  float n110 = hash31(p + vec3(1.0, 1.0, 0.0));
  float n001 = hash31(p + vec3(0.0, 0.0, 1.0));
  float n101 = hash31(p + vec3(1.0, 0.0, 1.0));
  float n011 = hash31(p + vec3(0.0, 1.0, 1.0));
  float n111 = hash31(p + vec3(1.0, 1.0, 1.0));

  float nx00 = mix(n000, n100, f.x);
  float nx10 = mix(n010, n110, f.x);
  float nx01 = mix(n001, n101, f.x);
  float nx11 = mix(n011, n111, f.x);
  float nxy0 = mix(nx00, nx10, f.y);
  float nxy1 = mix(nx01, nx11, f.y);
  return mix(nxy0, nxy1, f.z) * 2.0 - 1.0;
}

float fbm(vec3 p) {
  float total = 0.0;
  total += noise3(p * 0.75) * 0.55;
  total += noise3(p * 1.6) * 0.25;
  total += noise3(p * 3.4) * 0.12;
  return total;
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
  float crystal = dot(fp, normalize(sign(fp) + 0.001)) - 0.1;
  crystal -= sin(fp.y * 0.35) * 1.6;
  crystal -= sin(fp.y * 0.9) * 0.55;
  crystal += min(fp.x * 0.9, sin(fp.y * 0.38));

  fp = fold(fp) - vec3(0.2, 0.57, -0.2);
  fp = fold(fp) - vec3(-0.14, 0.99, -2.4);
  fp = fold(fp) - vec3(-0.03, 1.0, -0.3);
  fp = fold(fp) - vec3(0.0, 0.26, 0.0);
  crystal += sin(fp.y * 0.24) * 3.0;
  crystal *= 0.62;
  return crystal / scale;
}

float sdfMask(vec3 p) {
  p.x = abs(p.x) - 0.28;
  p.xz *= r2d(0.56);
  p.xy *= r2d(-0.01);
  return sdfCrystal(p, 2.75);
}

float de(vec3 p) {
  p.xy *= r2d(sin(u_time * 0.45) * 0.22);
  p.xz *= r2d(sin(u_time * 0.8) * 0.14 + 0.55);
  p.xy *= r2d(sin(sin(u_time * 0.6) * 2.0) * 0.18);
  p.x += sin(u_time * 0.65) * 0.26;
  return sdfMask(p * 0.92) / 0.92 + fbm(p * 4.8) * 0.16;
}

vec3 camera(vec3 ro, vec3 ta, vec2 uv) {
  vec3 fwd = normalize(ta - ro);
  vec3 left = normalize(cross(vec3(0.0, 1.0, 0.0), fwd));
  vec3 up = normalize(cross(fwd, left));
  return normalize(fwd + uv.x * left + uv.y * up);
}

float raymarch(vec3 rayOri, vec2 uv, vec3 tint) {
  vec3 target = vec3(0.0);
  vec3 rayDir = camera(rayOri, target, uv);
  vec3 pos = rayOri;

  float lastDensity = 0.0;
  vec4 sum = vec4(0.0);
  float tdist = 0.0;

  for (int i = 0; i < 52; i++) {
    if (tdist > 12.0 || sum.a > 0.96) {
      break;
    }

    float dist = de(pos) * 0.55;
    float density = max(0.075 - dist, 0.0);
    density *= 0.58;

    vec4 col = vec4(tint * density, density);
    sum += (1.0 - sum.a) * col;

    lastDensity = density;
    dist = max(dist, 0.04);
    pos += dist * rayDir;
    tdist += dist;
  }

  sum.rgb *= 1.35 / exp(lastDensity * 3.8);
  return dot(sum.rgb, vec3(0.299, 0.587, 0.114)) + sum.a * 0.12;
}

void main() {
  vec2 uv = (gl_FragCoord.xy - 0.5 * u_resolution.xy) / u_resolution.y;
  uv *= 1.1;

  float rotationDelta = 1.57;
  float zDst = -8.8;

  vec3 roRed = vec3(zDst * cos(rotationDelta - 0.02), 0.0, zDst * sin(rotationDelta - 0.02));
  vec3 roCyan = vec3(zDst * cos(rotationDelta + 0.02), 0.0, zDst * sin(rotationDelta + 0.02));

  float red = raymarch(roRed, uv, vec3(0.95, 0.22, 0.28));
  float cyan = raymarch(roCyan, uv, vec3(0.32, 0.84, 0.95));

  vec3 color = vec3(red, cyan * 0.94, cyan);
  float vignette = smoothstep(0.92, 0.14, length(uv));
  float grain = hash31(vec3(gl_FragCoord.xy, floor(u_time * 12.0))) * 0.025;

  color *= vignette;
  color += vec3(0.02, 0.024, 0.03) * vignette;
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
            className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-[1.1rem] border border-line bg-black shadow-[0_14px_34px_rgba(0,0,0,0.45)] ${className}`}
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