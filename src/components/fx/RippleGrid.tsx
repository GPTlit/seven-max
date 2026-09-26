import { useEffect, useRef } from "react";

/** WebGL crimson ambient grid with mouse ripple interaction. */
export function RippleGrid({ className = "" }: { className?: string }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current!;
    const gl = canvas.getContext("webgl", { premultipliedAlpha: false, alpha: true });
    if (!gl) return;
    const vs = `attribute vec2 p; void main(){ gl_Position = vec4(p,0.,1.); }`;
    const fs = `precision mediump float;
      uniform vec2 r; uniform float t; uniform vec2 m; uniform float mi;
      void main(){
        vec2 uv = (gl_FragCoord.xy - .5*r)/r.y;
        vec2 mu = (m - .5*r)/r.y;
        float d = length(uv - mu);
        float ripple = sin(d*28. - t*5.) * exp(-d*4.) * .06 * mi;
        float wave = sin(length(uv)*10. - t*1.4)*.015;
        vec2 g = uv * 14. + normalize(uv - mu + 1e-4) * ripple * 14. + wave*14.;
        vec2 f = abs(fract(g) - .5);
        float line = smoothstep(.47, .5, max(f.x, f.y));
        float glow = exp(-d*3.) * mi * .6;
        float vign = smoothstep(1.1, .1, length(uv));
        vec3 crimson = vec3(0.502, 0.075, 0.149);
        float a = (line * .75 + glow*.35) * vign;
        gl_FragColor = vec4(crimson * (1.2 + glow), a);
      }`;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, vs));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(prog);
    gl.useProgram(prog);
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "p");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    const uR = gl.getUniformLocation(prog, "r");
    const uT = gl.getUniformLocation(prog, "t");
    const uM = gl.getUniformLocation(prog, "m");
    const uMi = gl.getUniformLocation(prog, "mi");
    let mouse = [0, 0];
    let target = 0;
    let intensity = 0;
    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      canvas.width = canvas.clientWidth * dpr;
      canvas.height = canvas.clientHeight * dpr;
      gl.viewport(0, 0, canvas.width, canvas.height);
      mouse = [canvas.width / 2, canvas.height / 2];
    };
    resize();
    const move = (e: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      const dpr = canvas.width / rect.width;
      mouse = [(e.clientX - rect.left) * dpr, (rect.height - (e.clientY - rect.top)) * dpr];
      target = 1;
    };
    const leave = () => (target = 0.25);
    window.addEventListener("resize", resize);
    canvas.parentElement?.addEventListener("pointermove", move);
    canvas.parentElement?.addEventListener("pointerleave", leave);
    let raf = 0;
    const start = performance.now();
    target = 0.25;
    const loop = () => {
      intensity += (target - intensity) * 0.05;
      gl.uniform2f(uR, canvas.width, canvas.height);
      gl.uniform1f(uT, (performance.now() - start) / 1000);
      gl.uniform2f(uM, mouse[0], mouse[1]);
      gl.uniform1f(uMi, intensity);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    loop();
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.parentElement?.removeEventListener("pointermove", move);
      canvas.parentElement?.removeEventListener("pointerleave", leave);
    };
  }, []);

  return <canvas ref={ref} className={`pointer-events-none absolute inset-0 h-full w-full ${className}`} aria-hidden />;
}
