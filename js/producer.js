const controls = {
    A: document.getElementById("A"),
    alpha: document.getElementById("alpha"),
    beta: document.getElementById("beta"),
    budget: document.getElementById("budget"),
    wage: document.getElementById("wage"),
    rent: document.getElementById("rent")
};
function getValues() {
    return {
        A: Number(controls.A.value),
        alpha: Number(controls.alpha.value),
        beta: Number(controls.beta.value),
        C: Number(controls.budget.value),
        w: Number(controls.wage.value),
        r: Number(controls.rent.value)
    };
}
function optimalBundle(A, alpha, beta, C, w, r) {

    const L = (alpha/(alpha+beta))*C/w;

    const K = (beta/(alpha+beta))*C/r;

    const Q = A*Math.pow(L,alpha)*Math.pow(K,beta);

    return {L,K,Q};
}
function updateResults(opt) {

    document.getElementById("Lstar")
        .textContent = opt.L.toFixed(2);

    document.getElementById("Kstar")
        .textContent = opt.K.toFixed(2);

    document.getElementById("Qstar")
        .textContent = opt.Q.toFixed(2);
}
function updateSliderLabels() {

    document.getElementById("AVal")
        .textContent = controls.A.value;

    document.getElementById("alphaVal")
        .textContent = controls.alpha.value;

    document.getElementById("betaVal")
        .textContent = controls.beta.value;

    document.getElementById("budgetVal")
        .textContent = controls.budget.value;

    document.getElementById("wageVal")
        .textContent = controls.wage.value;

    document.getElementById("rentVal")
        .textContent = controls.rent.value;
}
function updatePlot() {
    updateSliderLabels();

    const {
        A,
        alpha,
        beta,
        C,
        w,
        r
    } = getValues();

    const opt =
        optimalBundle(
            A,
            alpha,
            beta,
            C,
            w,
            r
        );

    updateResults(opt);

    const xmax = 50;

    const x = [];

    const costY = [];

    const isoY = [];

    for(let i=0;i<200;i++){

        const L = xmax*i/199;

        x.push(L);

        costY.push( (C-w*L)/r );

        if(L>0){

            const K = Math.pow( opt.Q/ (A*Math.pow(L,alpha)), 1/beta );

            isoY.push(K);
        }
        else{
            isoY.push(null);
        }
    }

    const globalLmax = 50;
    const globalKmax = 50;
    Plotly.react(
        "plot",
        [
            {
                x:x,
                y:costY,
                name:"Isocosto", 
                marker: { color: 'green' }
            },
            {
                x:x,
                y:isoY,
                name:"Isocuanta óptima", 
                marker: { color: 'orange' }
            },
            {
                x:[opt.L],
                y:[opt.K],
                mode:"markers",
                name:"Óptimo",
                marker: { color: 'red' }
            }
        ],
        {
            title:
                "Optimización de la Producción",

            xaxis:{
                title:"Trabajo (L)",
                range: [0, globalLmax],
                autorange: false
            },

            yaxis:{
                title:"Capital (K)",
                range: [0, globalKmax],
                autorange: false
            },

            margin:{ t:50 }
        },

        { responsive:true }
    );
    
    /* ==========================
       3D SURFACE
       ========================== */

    const n = 40;

    const Lmax = 50;
    const Kmax = 50;

    const Lgrid = [];
    const Kgrid = [];

    for(let i = 0; i < n; i++){
        Lgrid.push(i * Lmax / (n - 1));
        Kgrid.push(i * Kmax / (n - 1));
    }

    const Z = [];

    for(let j = 0; j < n; j++){

        const row = [];

        for(let i = 0; i < n; i++){

            const L = Lgrid[i];
            const K = Kgrid[j];

            row.push( A * Math.pow(L, alpha) * Math.pow(K, beta) );
        }

        Z.push(row);
    }

    /* ==========================
       CONSTRAINT CURVE
       ========================== */

    const curveL = [];
    const curveK = [];
    const curveQ = [];

    for(let i = 0; i < 150; i++){

        const L = (i / 149) * C / w;

        const K = (C - w * L) / r;

        if(K >= 0){

            const Q = A * Math.pow(L, alpha) * Math.pow(K, beta);

            curveL.push(L);
            curveK.push(K);
            curveQ.push(Q);
        }
    }

    /* ==========================
       CONSTRAINT PLANE
       ========================== */

    const planeX = [];
    const planeY = [];
    const planeZ = [];

    const zMax = Math.max(...curveQ) * 1.2;

    for(let j = 0; j < 2; j++){

        const z =
            j * zMax;

        const rowX = [];
        const rowY = [];
        const rowZ = [];

        for(let i = 0; i < n; i++){

            const L =
                Lgrid[i];

            const K = (C - w * L) / r;

            rowX.push(L);
            rowY.push(K);
            rowZ.push(z);
        }

        planeX.push(rowX);
        planeY.push(rowY);
        planeZ.push(rowZ);
    }

    /* ==========================
       TRACES
       ========================== */

    const surfaceTrace = {

        type: "surface",

        x: Lgrid,
        y: Kgrid,
        z: Z,

        opacity: 0.85,

        name: "Producción",

        showscale: false
    };

    const planeTrace = {

        type: "surface",

        x: planeX,
        y: planeY,
        z: planeZ,

        opacity: 0.35,

        showscale: false,

        name: "Restricción"
    };

    const curveTrace = {

        type: "scatter3d",

        mode: "lines",

        x: curveL,
        y: curveK,
        z: curveQ,

        line: {
            width: 6
        },

        name: "Factible"
    };

    const optimumTrace = {

        type: "scatter3d",

        mode: "markers",

        x: [opt.L],
        y: [opt.K],
        z: [opt.Q],

        marker: {
            size: 6,
            color: "red"
        },

        name: "Óptimo"
    };

    const globalQmax = 100;
    Plotly.react(
        "plot3d",
        [
            surfaceTrace,
            planeTrace,
            curveTrace,
            optimumTrace
        ],
        {
            title:
                "Superficie de Producción y Restricción",

            scene: {

                xaxis: {
                    title: "Trabajo (L)",
                    range: [0, globalLmax],
                    autorange: false
                },

                yaxis: {
                    title: "Capital (K)",
                    range: [0, globalKmax],
                    autorange: false
                },

                zaxis: {
                    title: "Producción (Q)",
                    range: [0, globalQmax],
                    autorange: false
                },
                
                aspectmode: "cube",
     
                camera: {
                    center: { x: 0, y: 0, z: 0 },
                    eye: { x: -1.5, y: -1.5, z: 0.91 },
                    up: { x: 0, y: 0, z: 1 }
                }
            },

            margin: {
                l: 0,
                r: 0,
                t: 50,
                b: 0
            }
        },

        {
            responsive: true
        }
    );
}

Object.values(controls).forEach(control => {
    control.addEventListener("input", updatePlot);
});
updatePlot();
