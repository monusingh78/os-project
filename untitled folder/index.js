/* =========================================================
    TAB SWITCHING
========================================================= */
function openTab(tabId, btn) {
    document.querySelectorAll(".tabContent").forEach(t => t.classList.remove("active"));
    document.getElementById(tabId).classList.add("active");

    document.querySelectorAll(".tabBtn").forEach(b => b.classList.remove("active"));
    btn.classList.add("active");
}

/* =========================================================
    THEME TOGGLE
========================================================= */
function toggleTheme() {
    const body = document.body;
    const icon = document.getElementById("themeIcon");

    if (body.classList.contains("dark")) {
        body.classList.remove("dark");
        body.classList.add("light");
        icon.textContent = "☀️";
    } else {
        body.classList.remove("light");
        body.classList.add("dark");
        icon.textContent = "🌙";
    }
}

/* =========================================================
    GLOBAL VARIABLES
========================================================= */
let P = 0, R = 0;
let max = [];
let alloc = [];
let avail = [];
let need = [];

/* =========================================================
    GENERATE INPUT TABLES
========================================================= */
function generateTables() {
    P = Number(document.getElementById("procCount").value);
    R = Number(document.getElementById("resCount").value);

    if (P <= 0 || R <= 0) {
        alert("Enter valid process and resource counts.");
        return;
    }

    let html = `
        <h3>Allocation Matrix</h3>
        <table id="allocTable"><tr><th>P/R</th>`;

    for (let j = 0; j < R; j++) html += `<th>R${j}</th>`;
    html += "</tr>";

    for (let i = 0; i < P; i++) {
        html += `<tr><th>P${i}</th>`;
        for (let j = 0; j < R; j++) {
            html += `<td><input class="mInput" id="A${i}${j}" type="number" min="0"></td>`;
        }
        html += "</tr>";
    }
    html += "</table>";

    html += `
        <h3>Maximum Matrix</h3>
        <table id="maxTable"><tr><th>P/R</th>`;

    for (let j = 0; j < R; j++) html += `<th>R${j}</th>`;
    html += "</tr>";

    for (let i = 0; i < P; i++) {
        html += `<tr><th>P${i}</th>`;
        for (let j = 0; j < R; j++) {
            html += `<td><input class="mInput" id="M${i}${j}" type="number" min="0"></td>`;
        }
        html += "</tr>";
    }
    html += "</table>";

    html += `
        <h3>Available Resources</h3>
        <table><tr>`;
    for (let j = 0; j < R; j++) 
        html += `<td><input class="mInput" id="V${j}" type="number" min="0"></td>`;
    html += "</tr></table>";

    document.getElementById("inputTables").innerHTML = html;
}

/* =========================================================
    SAVE INPUT DATA
========================================================= */
function saveData() {
    alloc = Array.from({ length: P }, () => Array(R).fill(0));
    max = Array.from({ length: P }, () => Array(R).fill(0));
    avail = Array(R).fill(0);

    for (let i = 0; i < P; i++) {
        for (let j = 0; j < R; j++) {
            alloc[i][j] = Number(document.getElementById(`A${i}${j}`).value);
            max[i][j] = Number(document.getElementById(`M${i}${j}`).value);
        }
    }

    for (let j = 0; j < R; j++) {
        avail[j] = Number(document.getElementById(`V${j}`).value);
    }

    computeNeed();
    alert("Data saved successfully!");
}

function computeNeed() {
    need = Array.from({ length: P }, () => Array(R).fill(0));

    for (let i = 0; i < P; i++) {
        for (let j = 0; j < R; j++) {
            need[i][j] = max[i][j] - alloc[i][j];
        }
    }
}

/* =========================================================
    BANKER'S ALGORITHM
========================================================= */
function runBanker() {
    let work = [...avail];
    let finish = Array(P).fill(false);
    let safeSeq = [];

    let changed = true;
    while (changed) {
        changed = false;

        for (let i = 0; i < P; i++) {
            if (!finish[i]) {
                let canRun = true;
                for (let j = 0; j < R; j++) {
                    if (need[i][j] > work[j]) {
                        canRun = false;
                        break;
                    }
                }

                if (canRun) {
                    for (let j = 0; j < R; j++)
                        work[j] += alloc[i][j];

                    finish[i] = true;
                    safeSeq.push("P" + i);
                    changed = true;
                }
            }
        }
    }

    let resultDiv = document.getElementById("bankerResult");

    if (finish.every(f => f)) {
        resultDiv.innerHTML = `
            <div class="box">
                <h3 style='color:var(--neon2)'>System is in a SAFE STATE ✔</h3>
                <p>Safe Sequence: <b>${safeSeq.join(" → ")}</b></p>
            </div>`;
    } else {
        resultDiv.innerHTML = `
            <div class="box">
                <h3 style='color:red'>System is NOT SAFE ❌</h3>
                <p>A deadlock may occur.</p>
            </div>`;
    }
}

/* =========================================================
    DEADLOCK DETECTION
========================================================= */
function runDetection() {
    let work = [...avail];
    let finish = Array(P).fill(false);

    let deadlocked = [];

    for (let i = 0; i < P; i++) {
        let canRun = true;

        for (let j = 0; j < R; j++) {
            if (alloc[i][j] > 0 && need[i][j] > work[j]) {
                canRun = false;
                break;
            }
        }

        if (!canRun) deadlocked.push("P" + i);
    }

    let resultDiv = document.getElementById("detectResult");

    if (deadlocked.length === 0) {
        resultDiv.innerHTML = `
            <div class="box">
                <h3 style='color:var(--neon2)'>No Deadlock Detected ✔</h3>
            </div>`;
    } else {
        resultDiv.innerHTML = `
            <div class="box">
                <h3 style='color:red'>Deadlock Detected ❌</h3>
                <p>Involved Processes: <b>${deadlocked.join(", ")}</b></p>
            </div>`;
    }
}

/* =========================================================
    RECOVERY METHODS
========================================================= */
function recoverTerminate() {
    let result = document.getElementById("recoverResult");
    result.innerHTML = `
        <div class="box">
            <h3>Recovery by Terminating a Process</h3>
            <p>Terminate the lowest priority deadlocked process to free resources.</p>
        </div>`;
}

function recoverPreempt() {
    let result = document.getElementById("recoverResult");
    result.innerHTML = `
        <div class="box">
            <h3>Recovery by Resource Preemption</h3>
            <p>Resources from deadlocked processes are forcibly taken and reallocated.</p>
        </div>`;
}

/* =========================================================
    RAG VISUALIZATION (Canvas Graph)
========================================================= */
function drawRAG() {
    const canvas = document.getElementById("ragCanvas");
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0,0,canvas.width,canvas.height);

    ctx.strokeStyle = "#00f5ff";
    ctx.lineWidth = 2;

    let px = 80, py = 70;
    let rx = 400, ry = 70;

    // Draw processes
    for (let i = 0; i < P; i++) {
        ctx.beginPath();
        ctx.arc(px, py + i*80, 30, 0, Math.PI*2);
        ctx.stroke();
        ctx.fillStyle = "#00ff95";
        ctx.fillText("P"+i, px-8, py+i*80+5);
    }

    // Draw resources
    for (let j = 0; j < R; j++) {
        ctx.strokeRect(rx, ry + j*80, 50, 50);
        ctx.fillStyle = "#00f5ff";
        ctx.fillText("R"+j, rx+15, ry+j*80+30);
    }

    // Draw edges
    ctx.strokeStyle = "#00ff95";

    for (let i = 0; i < P; i++) {
        for (let j = 0; j < R; j++) {
            if (alloc[i][j] > 0) {
                ctx.beginPath();
                ctx.moveTo(px+30, py+i*80);
                ctx.lineTo(rx, ry+j*80+25);
                ctx.stroke();
            }
        }
    }

    document.getElementById("ragInfo").innerHTML = `
        <div class="box">RAG drawn successfully ✔</div>`;
}