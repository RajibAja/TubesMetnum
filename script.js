const G = 6.67430e-11;
const M = 5.972e24;
const dt = 10;
const SCALE = 1e-5;

const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d');
const centerX = canvas.width / 2;
const centerY = canvas.height / 2;

const positionIndicator = document.getElementById('positionIndicator');

const earthRadius = 6371e3 * SCALE;

let satellites = [
    { position: { x: 0, y: 1.0e7 }, velocity: { x: 7.8e3, y: 0 }, trail: [] },
    { position: { x: 1.5e7, y: 0 }, velocity: { x: 7.0e3, y: 0 }, trail: [] },
    { position: { x: 0, y: 1.5e7 }, velocity: { x: 6.5e3, y: 0 }, trail: [] }
];
let running = false;

function gravity(pos) {
    const r = Math.sqrt(pos.x * pos.x + pos.y * pos.y);
    const accel = -G * M / Math.pow(r, 3);
    return { 
        ax: accel * pos.x, 
        ay: accel * pos.y 
    };
}

function rk4(pos, vel, dt) {
    // k1
    const a1 = gravity(pos);
    const k1vx = a1.ax * dt;
    const k1vy = a1.ay * dt;
    const k1x = vel.x * dt;
    const k1y = vel.y * dt;

    // k2
    const pos2 = { 
        x: pos.x + 0.5 * k1x, 
        y: pos.y + 0.5 * k1y 
    };
    const vel2 = { 
        x: vel.x + 0.5 * k1vx, 
        y: vel.y + 0.5 * k1vy 
    };
    const a2 = gravity(pos2);
    const k2vx = a2.ax * dt;
    const k2vy = a2.ay * dt;
    const k2x = vel2.x * dt;
    const k2y = vel2.y * dt;

    // k3
    const pos3 = { 
        x: pos.x + 0.5 * k2x, 
        y: pos.y + 0.5 * k2y 
    };
    const vel3 = { 
        x: vel.x + 0.5 * k2vx, 
        y: vel.y + 0.5 * k2vy 
    };
    const a3 = gravity(pos3);
    const k3vx = a3.ax * dt;
    const k3vy = a3.ay * dt;
    const k3x = vel3.x * dt;
    const k3y = vel3.y * dt;

    // k4
    const pos4 = { 
        x: pos.x + k3x, 
        y: pos.y + k3y 
    };
    const vel4 = { 
        x: vel.x + k3vx, 
        y: vel.y + k3vy 
    };
    const a4 = gravity(pos4);
    const k4vx = a4.ax * dt;
    const k4vy = a4.ay * dt;
    const k4x = vel4.x * dt;
    const k4y = vel4.y * dt;

    const newPos = {
        x: pos.x + (k1x + 2 * k2x + 2 * k3x + k4x) / 6,
        y: pos.y + (k1y + 2 * k2y + 2 * k3y + k4y) / 6
    };

    const newVel = {
        x: vel.x + (k1vx + 2 * k2vx + 2 * k3vx + k4vx) / 6,
        y: vel.y + (k1vy + 2 * k2vy + 2 * k3vy + k4vy) / 6
    };

    return { newPos, newVel };
}

function drawEarth() {
    ctx.beginPath();
    ctx.arc(centerX, centerY, earthRadius, 0, 2 * Math.PI);
    ctx.fillStyle = '#3498db';
    ctx.fill();
    ctx.closePath();
}

function drawObject(pos) {
    const canvasX = centerX + pos.x * SCALE;
    const canvasY = centerY - pos.y * SCALE; 
    ctx.beginPath();
    ctx.arc(canvasX, canvasY, 8, 0, 2 * Math.PI); 
    ctx.fillStyle = '#2ecc71';
    ctx.fill();
    ctx.closePath();
}

function drawTrail(trail) {
    if (trail.length < 2) return;

    ctx.beginPath();
    ctx.moveTo(centerX + trail[0].x * SCALE, centerY - trail[0].y * SCALE);
    for (let i = 1; i < trail.length; i++) {
        ctx.lineTo(centerX + trail[i].x * SCALE, centerY - trail[i].y * SCALE);
    }
    ctx.strokeStyle = '#1f8cd7';
    ctx.lineWidth = 2;
    ctx.stroke();
    ctx.closePath();
}

function calculateDistanceFromCenter(pos) {
    return Math.sqrt(pos.x * pos.x + pos.y * pos.y);
}

function removeFarthestSatellite() {
    let maxDistance = 0;
    let indexToRemove = -1;

    satellites.forEach((satellite, index) => {
        const distance = calculateDistanceFromCenter(satellite.position);
        if (distance > maxDistance) {
            maxDistance = distance;
            indexToRemove = index;
        }
    });

    if (indexToRemove !== -1) {
        satellites.splice(indexToRemove, 1);
        console.log(`Satelit terluar dihapus. Total satelit sekarang: ${satellites.length}`);
    }
}



function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawEarth();

    satellites.forEach(satellite => {
        drawTrail(satellite.trail);
        drawObject(satellite.position);

        // Menghitung jarak satelit dari pusat Bumi
        const distance = calculateDistanceFromCenter(satellite.position) / 1000; // Jarak dalam kilometer

        // Menampilkan informasi jarak di canvas
        ctx.fillStyle = '#000000'; // Warna teks
        ctx.font = '12px Arial';
        ctx.fillText(`Jarak: ${distance.toFixed(2)} km`, centerX + satellite.position.x * SCALE, centerY - satellite.position.y * SCALE + 15);
    });

    console.log(`Rendering posisi satelit:`);
    satellites.forEach((satellite, index) => {
        console.log(`Satelit ${index + 1}: (${satellite.position.x.toFixed(2)}, ${satellite.position.y.toFixed(2)}) m`);
    });
}


function resetSimulation() {
    satellites = [
        { position: { x: 0, y: 1.0e7 }, velocity: { x: 7.8e3, y: 0 }, trail: [] },
        { position: { x: 1.5e7, y: 0 }, velocity: { x: 7.0e3, y: 0 }, trail: [] },
        { position: { x: 0, y: 1.5e7 }, velocity: { x: 6.5e3, y: 0 }, trail: [] }
    ];
    running = false;
    render();
    console.log('Simulasi di-reset');
}

function simulate() {
    if (!running) return;
    const stepsPerFrame = 10;
    for (let i = 0; i < stepsPerFrame; i++) {
        satellites.forEach(satellite => {
            const result = rk4(satellite.position, satellite.velocity, dt);
            satellite.position = result.newPos;
            satellite.velocity = result.newVel;
            satellite.trail.push({ x: satellite.position.x, y: satellite.position.y });
            if (satellite.trail.length > 1000) {
                satellite.trail.shift();
            }
        });

        
        if (satellites.length > 2) {
            removeFarthestSatellite();
        }
    }

    render();
    requestAnimationFrame(simulate);
}

document.getElementById('startButton').addEventListener('click', () => {
    if (!running) {
        running = true;
        simulate();
        console.log('Simulasi dimulai');
    }
});

document.getElementById('resetButton').addEventListener('click', () => {
    resetSimulation();
    console.log('Simulasi di-reset melalui tombol');
});

resetSimulation();
