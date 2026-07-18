(() => {
  const canvas = document.getElementById('heroLedCanvas');
  const hero = canvas?.closest('.hero');
  const toggle = document.getElementById('heroMagicToggle');
  if (!canvas || !hero || !toggle) return;

  const ctx = canvas.getContext('2d', { alpha: true });
  const SOURCE = { w: 1672, h: 941 };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const colors = ['#31e6ff', '#158dff', '#8a6dff', '#ff3cad', '#35ff8b', '#ff7a18', '#ff334f', '#fff7d6'];
  let frame = 0;
  let running = !reduceMotion.matches;
  let visible = true;
  let dpr = 1;
  let lastDraw = 0;

  const line = (x1, y1, x2, y2, count, color, mode='chase', speed=1, phase=0) => ({ kind:'line', x1,y1,x2,y2,count,color,mode,speed,phase });
  const ring = (x, y, rx, ry, count, color, mode='chase', speed=1, phase=0) => ({ kind:'ring', x,y,rx,ry,count,color,mode,speed,phase });
  const poly = (points, count, color, mode='chase', speed=1, phase=0) => ({ kind:'poly', points,count,color,mode,speed,phase });

  // Coordinates follow the actual 1672 × 941 hero art: wheel rims, frames,
  // flag poles, rider accessories, moon and trailers all animate separately.
  const strips = [
    line(217,355,222,614,26,'#ff3cad','chase',1.4,.1), line(319,378,325,602,23,'#31e6ff','sparkle',1.2,.4),
    line(492,373,500,591,24,'#35ff8b','chase',1.0,.7), line(576,360,580,579,25,'#8a6dff','sparkle',1.4,.2),
    line(679,358,682,575,26,'#158dff','chase',1.5,.5), line(726,354,730,570,26,'#ff334f','beat',1.1,.8),
    line(780,350,783,566,26,'#31e6ff','sparkle',1.3,.3), line(892,349,896,568,27,'#ff7a18','chase',1.2,.6),
    line(941,345,945,571,28,'#ff3cad','chase',1.5,.15), line(1065,333,1069,557,27,'#31e6ff','sparkle',1.2,.45),
    line(1123,329,1127,548,28,'#158dff','chase',1.6,.75), line(1266,258,1270,544,34,'#31e6ff','beat',1.0,.25),
    ring(197,771,119,125,52,'#ff334f','chase',1.3,.1), ring(403,680,57,62,30,'#ff7a18','sparkle',1.0,.6),
    ring(574,651,50,55,27,'#31e6ff','chase',1.4,.2), ring(661,686,46,50,25,'#ff3cad','chase',1.2,.7),
    ring(806,678,47,52,25,'#158dff','sparkle',1.4,.4), ring(1005,787,88,92,44,'#ff7a18','chase',1.15,.15),
    ring(1182,687,78,82,42,'#ff3cad','chase',1.35,.55), ring(1378,651,72,76,40,'#31e6ff','sparkle',1.1,.3),
    ring(1608,704,109,113,52,'#158dff','chase',1.45,.8),
    poly([[934,690],[875,680],[850,615],[914,576],[970,606],[934,690]],34,'#ff334f','beat',1.15,.2),
    poly([[1102,655],[1043,657],[1082,576],[1172,579],[1211,641]],38,'#ff3cad','chase',1.25,.6),
    poly([[1326,625],[1286,578],[1370,555],[1454,611],[1398,651]],40,'#158dff','chase',1.4,.35),
    poly([[1460,640],[1517,556],[1622,610]],28,'#31e6ff','sparkle',1.2,.85),
    poly([[694,615],[694,725],[780,724],[784,627],[694,615]],34,'#31e6ff','chase',1.25,.4),
    ring(429,304,31,31,24,'#31e6ff','beat',.8,.1),
    poly([[241,486],[278,482],[292,519],[260,525]],18,'#8a6dff','sparkle',1.3,.5),
    poly([[820,518],[855,514],[860,551],[827,553]],18,'#35ff8b','chase',1.0,.2),
    poly([[1042,472],[1077,477],[1080,515],[1045,513]],18,'#ff3cad','beat',1.2,.7),
    poly([[1314,393],[1352,396],[1356,427],[1318,426]],18,'#8a6dff','sparkle',1.3,.35)
  ];

  const stars = Array.from({ length: 95 }, (_, i) => ({
    x: 30 + ((i * 149) % 1590), y: 14 + ((i * 83) % 275),
    phase: (i * .173) % 1, size: i % 11 === 0 ? 2.1 : 1.1
  }));

  function resize() {
    const rect = hero.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.round(rect.width * dpr);
    canvas.height = Math.round(rect.height * dpr);
    canvas.style.width = `${rect.width}px`;
    canvas.style.height = `${rect.height}px`;
  }

  function transform() {
    const w = canvas.width / dpr, h = canvas.height / dpr;
    const scale = Math.max(w / SOURCE.w, h / SOURCE.h);
    return { scale, ox: (w - SOURCE.w * scale) / 2, oy: (h - SOURCE.h * scale) / 2 };
  }

  const samplePolyline = (points, t) => {
    const lengths=[]; let total=0;
    for(let i=1;i<points.length;i++){ const l=Math.hypot(points[i][0]-points[i-1][0],points[i][1]-points[i-1][1]); lengths.push(l); total+=l; }
    let target=t*total;
    for(let i=0;i<lengths.length;i++){
      if(target<=lengths[i]){ const q=target/lengths[i]; return [points[i][0]+(points[i+1][0]-points[i][0])*q, points[i][1]+(points[i+1][1]-points[i][1])*q]; }
      target-=lengths[i];
    }
    return points[points.length-1];
  };

  function pointAt(s, t) {
    if (s.kind === 'line') return [s.x1+(s.x2-s.x1)*t, s.y1+(s.y2-s.y1)*t];
    if (s.kind === 'ring') { const a=t*Math.PI*2; return [s.x+Math.cos(a)*s.rx, s.y+Math.sin(a)*s.ry]; }
    return samplePolyline(s.points, t);
  }

  function energy(s, i, time) {
    const p = (i / s.count + time * .00012 * s.speed + s.phase) % 1;
    if (s.mode === 'chase') return .15 + Math.pow(Math.max(0, Math.sin(p*Math.PI*4)), 7) * .95;
    if (s.mode === 'beat') return .2 + Math.pow((Math.sin(time*.006*s.speed+s.phase*7)+1)/2, 5) * .85;
    const hash = Math.sin((i+1)*91.73 + Math.floor(time/95*s.speed)*17.13) * 43758.54;
    return .18 + (hash-Math.floor(hash) > .76 ? .95 : .18);
  }

  function drawLed(x,y,color,power,size,tf) {
    const px=tf.ox+x*tf.scale, py=tf.oy+y*tf.scale;
    ctx.globalAlpha=Math.min(1,power);
    ctx.fillStyle=color; ctx.shadowColor=color; ctx.shadowBlur=(5+power*15)*tf.scale;
    ctx.beginPath(); ctx.arc(px,py,(size+power*1.4)*tf.scale,0,Math.PI*2); ctx.fill();
    ctx.globalAlpha=.8*power; ctx.fillStyle='#fff'; ctx.shadowBlur=0;
    ctx.beginPath(); ctx.arc(px,py,Math.max(.7,size*.28)*tf.scale,0,Math.PI*2); ctx.fill();
  }

  function draw(time=0) {
    const w=canvas.width/dpr,h=canvas.height/dpr;
    ctx.setTransform(dpr,0,0,dpr,0,0); ctx.clearRect(0,0,w,h);
    const tf=transform(); ctx.globalCompositeOperation='lighter';
    stars.forEach((s,i)=>drawLed(s.x,s.y,i%13===0?'#31e6ff':'#fff',.15+.8*Math.pow((Math.sin(time*.002+s.phase*9)+1)/2,7),s.size,tf));
    strips.forEach(s=>{
      for(let i=0;i<s.count;i++){
        const [x,y]=pointAt(s,i/Math.max(1,s.count-1));
        const color=Array.isArray(s.color)?s.color[i%s.color.length]:s.color;
        drawLed(x,y,color,energy(s,i,time),2.1,tf);
      }
    });
    ctx.globalAlpha=1; ctx.shadowBlur=0; ctx.globalCompositeOperation='source-over';
  }

  function animate(time) {
    frame=requestAnimationFrame(animate);
    if (running && visible && time-lastDraw >= 33) { lastDraw=time; draw(time); }
  }

  function setRunning(next) {
    running=next;
    toggle.setAttribute('aria-pressed', String(!next));
    toggle.textContent=next?'Pause LED magic':'Play LED magic';
    if(!next) draw(480);
  }

  toggle.addEventListener('click',()=>setRunning(!running));
  reduceMotion.addEventListener('change',e=>setRunning(!e.matches));
  document.addEventListener('visibilitychange',()=>{ visible=!document.hidden; });
  new ResizeObserver(()=>{ resize(); draw(performance.now()); }).observe(hero);
  resize(); draw(0); frame=requestAnimationFrame(animate);
})();
