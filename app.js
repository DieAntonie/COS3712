const canvas = document.querySelector('#gl-canvas');
const gl = canvas.getContext('webgl', { antialias: true, alpha: true });
const errorMessage = document.querySelector('#webgl-error');
const topicButtons = [...document.querySelectorAll('.topic-button')];
const topicTitle = document.querySelector('#scene-title');
const topicTag = document.querySelector('#topic-tag');
const topicDescription = document.querySelector('#topic-description');
const controlsElement = document.querySelector('#controls');
const stage = document.querySelector('#stage');

const topicInfo = {
  transformations: { title: 'Transformations', tag: '01 / TRANSFORM', description: 'Change an object\'s position, orientation, and scale in 3D space.' },
  cameras: { title: 'Cameras', tag: '02 / VIEW', description: 'Orbit the virtual camera and adjust its distance from the scene.' },
  lighting: { title: 'Lighting & materials', tag: '03 / SHADING', description: 'Shape the surface response by moving the light and tuning its highlight.' },
  particles: { title: 'Particles', tag: '04 / SYSTEMS', description: 'Add a field of points and control how they drift around the object.' },
  shaders: { title: 'Shaders', tag: '05 / PROGRAMS', description: 'Swap fragment programs to change how every visible surface is shaded.' },
  pipeline: { title: 'Graphics pipeline', tag: '06 / PIPELINE', description: 'Follow geometry from vertex transforms through rasterization to color.' }
};

const defaults = { translateX: 0, translateY: 0, translateZ: 0, rotateX: -18, rotateY: 25, rotateZ: 0, scale: 1, cameraX: 0, cameraY: 0, zoom: 4.5, lightX: -2, lightY: 3, shininess: 44, particleCount: 180, drift: 45, shader: 'Phong', particles: false };
const state = { ...defaults, color: [0.925, 0.475, 0.365], drag: null, start: performance.now() };

const controlDefinitions = {
  transformations: [
    { id: 'translateX', label: 'Position X', min: -1, max: 1, step: 0.01, ends: ['−1', '1'] },
    { id: 'translateY', label: 'Position Y', min: -1, max: 1, step: 0.01, ends: ['−1', '1'] },
    { id: 'translateZ', label: 'Position Z', min: -1, max: 1, step: 0.01, ends: ['−1', '1'] },
    { id: 'rotateX', label: 'Rotate X', min: -180, max: 180, step: 1, unit: '°', ends: ['−180°', '180°'] },
    { id: 'rotateY', label: 'Rotate Y', min: -180, max: 180, step: 1, unit: '°', ends: ['−180°', '180°'] },
    { id: 'rotateZ', label: 'Rotate Z', min: -180, max: 180, step: 1, unit: '°', ends: ['−180°', '180°'] },
    { id: 'scale', label: 'Uniform scale', min: 0.5, max: 1.6, step: 0.01, ends: ['0.5', '1.6'] }
  ],
  cameras: [
    { id: 'cameraX', label: 'Orbit horizontal', min: -90, max: 90, step: 1, unit: '°', ends: ['−90°', '90°'] },
    { id: 'cameraY', label: 'Orbit vertical', min: -55, max: 55, step: 1, unit: '°', ends: ['−55°', '55°'] },
    { id: 'zoom', label: 'Camera distance', min: 3.2, max: 8, step: 0.1, unit: '', ends: ['NEAR', 'FAR'] }
  ],
  lighting: [
    { id: 'lightX', label: 'Light azimuth', min: -5, max: 5, step: 0.1, ends: ['LEFT', 'RIGHT'] },
    { id: 'lightY', label: 'Light height', min: 0.5, max: 6, step: 0.1, ends: ['LOW', 'HIGH'] },
    { id: 'shininess', label: 'Highlight size', min: 4, max: 96, step: 1, ends: ['SOFT', 'SHARP'] }
  ],
  particles: [
    { id: 'particleCount', label: 'Particle count', min: 0, max: 500, step: 10, ends: ['0', '500'] },
    { id: 'drift', label: 'Drift speed', min: 0, max: 100, step: 1, ends: ['STILL', 'FAST'] },
    { id: 'particles', label: 'Show particle field', type: 'toggle' }
  ],
  shaders: [{ id: 'shader', label: 'Fragment shader', type: 'select', options: ['Phong', 'Toon', 'Rim', 'Normals'] }],
  pipeline: [{ id: 'shader', label: 'Fragment stage', type: 'select', options: ['Phong', 'Toon', 'Rim', 'Normals'] }, { id: 'particles', label: 'Render point pass', type: 'toggle' }]
};

const shaderSources = {
  vertex: `attribute vec3 aPosition; attribute vec3 aNormal; uniform mat4 uMvp; uniform mat4 uModel; varying vec3 vNormal; varying vec3 vWorld; void main(){ vec4 world=uModel*vec4(aPosition,1.0); vWorld=world.xyz; vNormal=mat3(uModel)*aNormal; gl_Position=uMvp*vec4(aPosition,1.0); }`,
  fragment: `precision mediump float; uniform vec3 uColor; uniform vec3 uLight; uniform vec3 uEye; uniform float uShine; uniform int uMode; varying vec3 vNormal; varying vec3 vWorld; void main(){ vec3 n=normalize(vNormal); vec3 l=normalize(uLight-vWorld); vec3 v=normalize(uEye-vWorld); float diff=max(dot(n,l),0.0); vec3 h=normalize(l+v); float spec=pow(max(dot(n,h),0.0),uShine); vec3 base=uColor; if(uMode==1){ float band=floor(diff*4.0)/3.0; gl_FragColor=vec4(base*(0.22+band),1.0); } else if(uMode==2){ float rim=pow(1.0-max(dot(n,v),0.0),2.4); gl_FragColor=vec4(base*(0.28+diff*0.5)+vec3(0.55,0.76,0.65)*rim,1.0); } else if(uMode==3){ gl_FragColor=vec4(n*0.5+0.5,1.0); } else { gl_FragColor=vec4(base*(0.2+0.8*diff)+vec3(1.0)*spec*0.7,1.0); } }`,
  particleVertex: `attribute vec3 aPosition; attribute float aPhase; uniform mat4 uMvp; uniform float uTime; uniform float uDrift; varying float vFade; void main(){ vec3 p=aPosition; p.y+=sin(uTime*0.7+aPhase)*0.17*uDrift; p.x+=cos(uTime*0.37+aPhase)*0.10*uDrift; gl_Position=uMvp*vec4(p,1.0); gl_PointSize=2.0+2.0*abs(sin(aPhase+uTime)); vFade=0.35+0.65*abs(sin(aPhase+uTime*0.4)); }`,
  particleFragment: `precision mediump float; varying float vFade; void main(){ vec2 c=gl_PointCoord-0.5; float d=length(c); if(d>0.5) discard; gl_FragColor=vec4(0.67,0.82,0.71,vFade*(1.0-smoothstep(0.2,0.5,d))); }`
};

function compile(type, source) {
  const shader = gl.createShader(type);
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(shader));
  return shader;
}
function createProgram(vertex, fragment) {
  const program = gl.createProgram();
  gl.attachShader(program, compile(gl.VERTEX_SHADER, vertex));
  gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fragment));
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(program));
  return program;
}

function multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col++) for (let row = 0; row < 4; row++)
    out[col * 4 + row] = a[row] * b[col * 4] + a[4 + row] * b[col * 4 + 1] + a[8 + row] * b[col * 4 + 2] + a[12 + row] * b[col * 4 + 3];
  return out;
}
function perspective(fov, aspect, near, far) {
  const f = 1 / Math.tan(fov / 2), nf = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * nf, -1, 0, 0, 2 * far * near * nf, 0]);
}
function translation(x, y, z) { return new Float32Array([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, x, y, z, 1]); }
function rotationX(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([1, 0, 0, 0, 0, c, s, 0, 0, -s, c, 0, 0, 0, 0, 1]); }
function rotationY(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, 0, -s, 0, 0, 1, 0, 0, s, 0, c, 0, 0, 0, 0, 1]); }
function rotationZ(a) { const c = Math.cos(a), s = Math.sin(a); return new Float32Array([c, s, 0, 0, -s, c, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1]); }
function normalize(v) { const length = Math.hypot(...v) || 1; return v.map((value) => value / length); }
function lookAt(eye, target) {
  const z = normalize([eye[0] - target[0], eye[1] - target[1], eye[2] - target[2]]);
  const x = normalize([z[2], 0, -z[0]]);
  const y = [z[1] * x[2] - z[2] * x[1], z[2] * x[0] - z[0] * x[2], z[0] * x[1] - z[1] * x[0]];
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -x.reduce((s, v, i) => s + v * eye[i], 0), -y.reduce((s, v, i) => s + v * eye[i], 0), -z.reduce((s, v, i) => s + v * eye[i], 0), 1]);
}
function sphereData(rows = 32, columns = 48) {
  const positions = [], normals = [], indices = [];
  for (let row = 0; row <= rows; row++) {
    const v = row / rows, phi = v * Math.PI;
    for (let col = 0; col <= columns; col++) {
      const u = col / columns, theta = u * Math.PI * 2;
      const point = [-Math.cos(theta) * Math.sin(phi), Math.cos(phi), Math.sin(theta) * Math.sin(phi)];
      positions.push(...point); normals.push(...point);
    }
  }
  for (let row = 0; row < rows; row++) for (let col = 0; col < columns; col++) {
    const a = row * (columns + 1) + col, b = a + columns + 1;
    indices.push(a, b, a + 1, b, b + 1, a + 1);
  }
  return { positions: new Float32Array(positions), normals: new Float32Array(normals), indices: new Uint16Array(indices) };
}
function bufferData(target, data, usage = gl.STATIC_DRAW) { const buffer = gl.createBuffer(); gl.bindBuffer(target, buffer); gl.bufferData(target, data, usage); return buffer; }

let mainProgram, particleProgram, sphere, particleBuffers;
if (!gl) {
  errorMessage.hidden = false;
} else {
  try {
    mainProgram = createProgram(shaderSources.vertex, shaderSources.fragment);
    particleProgram = createProgram(shaderSources.particleVertex, shaderSources.particleFragment);
    const data = sphereData();
    sphere = { position: bufferData(gl.ARRAY_BUFFER, data.positions), normal: bufferData(gl.ARRAY_BUFFER, data.normals), index: bufferData(gl.ELEMENT_ARRAY_BUFFER, data.indices), count: data.indices.length };
    particleBuffers = createParticles(500);
    document.querySelector('#triangle-count').textContent = (data.indices.length / 3).toLocaleString();
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    requestAnimationFrame(render);
  } catch (error) {
    errorMessage.hidden = false;
    errorMessage.textContent = `WebGL could not compile the scene: ${error.message}`;
  }
}

function createParticles(count) {
  const positions = [], phases = [];
  for (let i = 0; i < count; i++) {
    const y = 2 * (i / count) - 1;
    const radius = Math.sqrt(1 - y * y);
    const angle = i * Math.PI * (3 - Math.sqrt(5));
    positions.push(Math.cos(angle) * radius * 1.7, y * 1.7, Math.sin(angle) * radius * 1.7);
    phases.push((i * 2.399) % (Math.PI * 2));
  }
  return { position: bufferData(gl.ARRAY_BUFFER, new Float32Array(positions)), phase: bufferData(gl.ARRAY_BUFFER, new Float32Array(phases)), count };
}
function setAttribute(program, name, buffer, size) {
  const location = gl.getAttribLocation(program, name);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.enableVertexAttribArray(location);
  gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
}
function uniform(program, name, value) {
  const location = gl.getUniformLocation(program, name);
  if (typeof value === 'number') gl.uniform1f(location, value);
  else if (value.length === 16) gl.uniformMatrix4fv(location, false, value);
  else if (value.length === 3) gl.uniform3fv(location, value);
}
function resizeCanvas() {
  const ratio = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.round(canvas.clientWidth * ratio), height = Math.round(canvas.clientHeight * ratio);
  if (canvas.width !== width || canvas.height !== height) { canvas.width = width; canvas.height = height; }
  gl.viewport(0, 0, canvas.width, canvas.height);
}
function render(now) {
  if (!gl || !mainProgram) return;
  resizeCanvas();
  gl.clearColor(0, 0, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  const elapsed = (now - state.start) / 1000;
  const aspect = canvas.width / Math.max(canvas.height, 1);
  const cameraAzimuth = state.cameraX * Math.PI / 180, cameraElevation = state.cameraY * Math.PI / 180;
  const eye = [Math.sin(cameraAzimuth) * Math.cos(cameraElevation) * state.zoom, Math.sin(cameraElevation) * state.zoom, Math.cos(cameraAzimuth) * Math.cos(cameraElevation) * state.zoom];
  const view = lookAt(eye, [0, 0, 0]);
  const projection = perspective(Math.PI / 4, aspect, 0.1, 40);
  const rotation = multiply(multiply(rotationZ(state.rotateZ * Math.PI / 180), rotationY(state.rotateY * Math.PI / 180)), rotationX(state.rotateX * Math.PI / 180));
  const scale = new Float32Array([state.scale, 0, 0, 0, 0, state.scale, 0, 0, 0, 0, state.scale, 0, 0, 0, 0, 1]);
  const model = multiply(multiply(translation(state.translateX, state.translateY, state.translateZ), rotation), scale);
  const mvp = multiply(multiply(projection, view), model);
  gl.useProgram(mainProgram);
  setAttribute(mainProgram, 'aPosition', sphere.position, 3);
  setAttribute(mainProgram, 'aNormal', sphere.normal, 3);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.index);
  uniform(mainProgram, 'uMvp', mvp);
  uniform(mainProgram, 'uModel', model);
  uniform(mainProgram, 'uColor', state.color);
  uniform(mainProgram, 'uLight', [state.lightX, state.lightY, 3]);
  uniform(mainProgram, 'uEye', eye);
  uniform(mainProgram, 'uShine', state.shininess);
  gl.uniform1i(gl.getUniformLocation(mainProgram, 'uMode'), ['Phong', 'Toon', 'Rim', 'Normals'].indexOf(state.shader));
  gl.drawElements(gl.TRIANGLES, sphere.count, gl.UNSIGNED_SHORT, 0);
  if (state.particles) {
    gl.disable(gl.DEPTH_TEST);
    gl.useProgram(particleProgram);
    setAttribute(particleProgram, 'aPosition', particleBuffers.position, 3);
    setAttribute(particleProgram, 'aPhase', particleBuffers.phase, 1);
    uniform(particleProgram, 'uMvp', multiply(multiply(projection, view), translation(0, 0, 0)));
    uniform(particleProgram, 'uTime', elapsed);
    uniform(particleProgram, 'uDrift', state.drift / 100);
    gl.drawArrays(gl.POINTS, 0, state.particleCount);
    gl.enable(gl.DEPTH_TEST);
  }
  requestAnimationFrame(render);
}

function rangeControl(definition) {
  const value = state[definition.id];
  const unit = definition.unit || '';
  const display = (number) => `${Number(number).toFixed(definition.step < 1 ? 2 : 0).replace(/\.00$/, '')}${unit}`;
  const progress = ((value - definition.min) / (definition.max - definition.min)) * 100;
  return `<div class="control-group"><label class="control-label" for="control-${definition.id}">${definition.label}<span class="control-value" data-value="${definition.id}">${display(value)}</span></label><input class="range-control" id="control-${definition.id}" type="range" min="${definition.min}" max="${definition.max}" step="${definition.step}" value="${value}" style="--range-progress:${progress}%" data-control="${definition.id}" data-unit="${unit}" data-decimals="${definition.step < 1 ? 2 : 0}"><div class="range-ends"><span>${definition.ends[0]}</span><span>${definition.ends[1]}</span></div></div>`;
}
function renderControls(topic) {
  controlsElement.innerHTML = controlDefinitions[topic].map((definition) => {
    if (!definition.type) return rangeControl(definition);
    if (definition.type === 'toggle') return `<label class="toggle-row" for="control-${definition.id}">${definition.label}<input class="switch" id="control-${definition.id}" type="checkbox" data-control="${definition.id}" ${state[definition.id] ? 'checked' : ''}></label>`;
    return `<div class="control-group"><label class="control-label" for="control-${definition.id}">${definition.label}</label><select class="select-control" id="control-${definition.id}" data-control="${definition.id}">${definition.options.map((option) => `<option ${state[definition.id] === option ? 'selected' : ''}>${option}</option>`).join('')}</select></div>`;
  }).join('');
  controlsElement.querySelectorAll('[data-control]').forEach((control) => control.addEventListener('input', updateControl));
  controlsElement.querySelectorAll('select').forEach((control) => control.addEventListener('change', updateControl));
}
function updateControl(event) {
  const control = event.currentTarget;
  const id = control.dataset.control;
  state[id] = control.type === 'checkbox' ? control.checked : control.tagName === 'SELECT' ? control.value : Number(control.value);
  if (control.type === 'range') {
    const valueNode = controlsElement.querySelector(`[data-value="${id}"]`);
    const number = Number(control.value), decimals = Number(control.dataset.decimals);
    valueNode.textContent = `${number.toFixed(decimals).replace(/\.00$/, '')}${control.dataset.unit}`;
    control.style.setProperty('--range-progress', `${((number - Number(control.min)) / (Number(control.max) - Number(control.min))) * 100}%`);
  }
  updatePipeline();
}
function updatePipeline() {
  const active = document.querySelector('.topic-button.is-active')?.dataset.topic || 'transformations';
  const current = active === 'pipeline' ? 'fragment' : active === 'shaders' ? 'fragment' : active === 'particles' ? 'raster' : active === 'lighting' ? 'fragment' : 'vertex';
  document.querySelectorAll('.pipeline-step').forEach((step) => step.classList.toggle('is-current', step.dataset.pipe === current));
}
function selectTopic(topic) {
  topicButtons.forEach((button) => button.classList.toggle('is-active', button.dataset.topic === topic));
  topicTitle.textContent = topicInfo[topic].title;
  topicTag.textContent = topicInfo[topic].tag;
  topicDescription.textContent = topicInfo[topic].description;
  renderControls(topic);
  updatePipeline();
}
topicButtons.forEach((button) => button.addEventListener('click', () => selectTopic(button.dataset.topic)));

document.querySelectorAll('.swatch').forEach((swatch) => swatch.addEventListener('click', () => {
  document.querySelector('.swatch.is-selected')?.classList.remove('is-selected');
  swatch.classList.add('is-selected');
  const hex = swatch.dataset.color;
  state.color = [1, 3, 5].map((offset) => parseInt(hex.slice(offset, offset + 2), 16) / 255);
}));

document.querySelector('#reset-scene').addEventListener('click', () => {
  Object.assign(state, defaults, { color: [0.925, 0.475, 0.365] });
  document.querySelectorAll('.swatch').forEach((swatch, index) => swatch.classList.toggle('is-selected', index === 0));
  selectTopic(document.querySelector('.topic-button.is-active')?.dataset.topic || 'transformations');
});

canvas.addEventListener('pointerdown', (event) => { state.drag = { x: event.clientX, y: event.clientY, cameraX: state.cameraX, cameraY: state.cameraY }; canvas.setPointerCapture(event.pointerId); });
canvas.addEventListener('pointermove', (event) => {
  if (!state.drag) return;
  state.cameraX = Math.max(-90, Math.min(90, state.drag.cameraX + (event.clientX - state.drag.x) * 0.45));
  state.cameraY = Math.max(-55, Math.min(55, state.drag.cameraY - (event.clientY - state.drag.y) * 0.35));
});
canvas.addEventListener('pointerup', () => { state.drag = null; });
canvas.addEventListener('pointercancel', () => { state.drag = null; });

renderControls('transformations');
updatePipeline();
