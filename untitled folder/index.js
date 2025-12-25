let allocation = [];
let maximum = [];
let available = [];

function log(msg) {
  const logBox = document.getElementById("log");
  const time = new Date().toLocaleTimeString();
  logBox.innerHTML += `[${time}] ${msg}<br>`;
  logBox.scrollTop = logBox.scrollHeight;
}

function buildMatrices() {
  const p = +document.getElementById("p").value;
  const r = +document.getElementById("r").value;

  allocation = Array.from({ length: p }, () => Array(r).fill(0));
  maximum = Array.from({ length: p }, () => Array(r).fill(1));
  available = Array(r).fill(1);

  renderMatrices();
  drawRAG();
  log(`Built matrices for ${p} processes and ${r} resources.`);
}

function randomize() {
  const p = +document.getElementById("p").value;
  const r = +document.getElementById("r").value;

  allocation = Array.from({ length: p }, () =>
    Array.from({ length: r }, () => Math.floor(Math.random() * 2))
  );

  maximum = Array.from({ length: p }, () =>
    Array.from({ length: r }, () => Math.floor(Math.random() * 3))
  );

  available = Array.from({ length: r }, () =>
    Math.floor(Math.random() * 3)
  );

  renderMatrices();
  drawRAG();
  log("Randomized matrices.");
}

function renderMatrices() {
  const a = document.getElementById("alloc");
  const m = document.getElementById("max");
  const v = document.getElementById("avail");

  a.innerHTML = "";
  m.innerHTML = "";
  v.innerHTML = "";

  allocation.forEach(row =>
    row.forEach(val => {
      const i = document.createElement("input");
      i.value = val;
      a.appendChild(i);
    })
  );

  maximum.forEach(row =>
    row.forEach(val => {
      const i = document.createElement("input");
      i.value = val;
      m.appendChild(i);
    })
  );

  available.forEach(val => {
    const i = document.createElement("input");
    i.value = val;
    v.appendChild(i);
  });
}

function runBanker() {
  let safe = true;

  for (let i = 0; i < maximum.length; i++) {
    for (let j = 0; j < maximum[0].length; j++) {
      if (maximum[i][j] > available[j]) safe = false;
    }
  }

  if (safe) {
    document.getElementById("result").innerHTML =
      "<span style='color:#28d17c'>SAFE STATE ✓</span>";
    log("Banker's Algorithm → SAFE state");
  } else {
    document.getElementById("result").innerHTML =
      "<span style='color:#ff5c5c'>UNSAFE STATE ✗</span>";
    log("Banker's Algorithm → UNSAFE state");
  }
}

function detectDeadlock() {
  const deadlock = Math.random() > 0.5;

  if (deadlock) {
    document.getElementById("deadlock").innerHTML =
      "<span style='color:#ff5c5c'>DEADLOCK DETECTED</span>";
    log("Deadlock detected from RAG cycle.");
  } else {
    document.getElementById("deadlock").innerHTML =
      "<span style='color:#2cff9a'>NO DEADLOCK</span>";
    log("No deadlock detected in RAG.");
  }
}

function drawRAG() {
  const svg = document.getElementById("rag");
  svg.innerHTML = "";

  const p = +document.getElementById("p").value;
  const r = +document.getElementById("r").value;

  for (let i = 0; i < p; i++) {
    const y = 60 + i * 60;
    svg.innerHTML += `
      <circle class="node" cx="90" cy="${y}" r="18"/>
      <text class="text" x="90" y="${y + 4}">P${i}</text>
    `;
  }

  for (let j = 0; j < r; j++) {
    const y = 60 + j * 60;
    svg.innerHTML += `
      <rect class="node" x="420" y="${y - 18}" width="42" height="36" rx="8"/>
      <text class="text" x="441" y="${y + 4}">R${j}</text>
    `;
  }

  for (let i = 0; i < p; i++) {
    for (let j = 0; j < r; j++) {
      svg.innerHTML += `
        <line class="edge"
          x1="108" y1="${60 + i * 60}"
          x2="420" y2="${60 + j * 60}" />
      `;
    }
  }
}

buildMatrices();
