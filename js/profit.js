const cfg = window.modelConfig ?? {
    xLabel: "Trabajo (L)",
    yLabel: "Capital (K)",
    zLabel: "Beneficio (Π)",
    optimumLabel: "Óptimo",
    plotTitle: "Mapa de Beneficio",
    plot3dTitle: "Superficie de Beneficio"
};

const controls = {
    A: document.getElementById("A"),
    alpha: document.getElementById("alpha"),
    beta: document.getElementById("beta"),
    price: document.getElementById("price"),
    wage: document.getElementById("wage"),
    rent: document.getElementById("rent")
};

function getValues() {
    return {
        A: Number(controls.A.value),
        alpha: Number(controls.alpha.value),
        beta: Number(controls.beta.value),
        P: Number(controls.price.value),
        w: Number(controls.wage.value),
        r: Number(controls.rent.value)
    };
}

function optimalBundle(A, alpha, beta, P, w, r) {

    if(alpha + beta >= 1){
        return {
            L: NaN,
            K: NaN,
            Pi: NaN
        };
    }

    const L =
        Math.pow(
            (
                Math.pow(w, 1-beta) *
                Math.pow(r, beta)
            ) /
            (
                P * A *
                Math.pow(alpha, 1-beta) *
                Math.pow(beta, beta)
            ),
            1/(alpha + beta - 1)
        );

    const K =
        (beta * w / (alpha * r)) * L;

    const Pi =
        P*A*Math.pow(L,alpha)*Math.pow(K,beta)
        - w*L
        - r*K;

    return {L,K,Pi};
}

function updateResults(opt){

    document.getElementById("Lstar").textContent =
        opt.L.toFixed(2);

    document.getElementById("Kstar").textContent =
        opt.K.toFixed(2);

    document.getElementById("Qstar").textContent =
        opt.Pi.toFixed(2);
}

function updateSliderLabels(){

    document.getElementById("AVal").textContent =
        controls.A.value;

    document.getElementById("alphaVal").textContent =
        controls.alpha.value;

    document.getElementById("betaVal").textContent =
        controls.beta.value;

    document.getElementById("priceVal").textContent =
        controls.price.value;

    document.getElementById("wageVal").textContent =
        controls.wage.value;

    document.getElementById("rentVal").textContent =
        controls.rent.value;
    document.getElementById("returnsVal").textContent =
        (Number(controls.alpha.value)
        +
        Number(controls.beta.value)
    ).toFixed(2);
}
function enforceReturnsToScaleConstraint(changed){

    const step = 0.05;

    let alpha = Number(controls.alpha.value);
    let beta  = Number(controls.beta.value);

    if(alpha + beta <= 0.95){
        return;
    }

    if(changed === "alpha"){

        beta =
            Math.max(
                step,
                1 - alpha - step
            );

        controls.beta.value =
            beta.toFixed(2);
    }

    if(changed === "beta"){

        alpha =
            Math.max(
                step,
                1 - beta - step
            );

        controls.alpha.value =
            alpha.toFixed(2);
    }

    updateSliderLabels();
}
function updatePlot(){

    updateSliderLabels();

    const {A, alpha, beta, P, w, r} = getValues();

    if(alpha + beta >= 0.95){
        return;
    }

    const opt = optimalBundle(A, alpha, beta, P, w, r);
const scale = 2.5;

const Lmax =
    Math.max(
        10,
        scale * opt.L
    );

const Kmax =
    Math.max(
        10,
        scale * opt.K
    );
    updateResults(opt);

    const n = 200;


    const Lgrid = [];
    const Kgrid = [];

    for(let i=0;i<n;i++){

        Lgrid.push(
            i * Lmax/(n-1)
        );

        Kgrid.push(
            i * Kmax/(n-1)
        );
    }

    const Z = [];

    let zMin = Infinity;
    let zMax = -Infinity;

    for(let j=0;j<n;j++){

        const row = [];

        for(let i=0;i<n;i++){

            const L = Lgrid[i];
            const K = Kgrid[j];

            const Pi =
                P*A*
                Math.pow(L,alpha)*
                Math.pow(K,beta)
                - w*L
                - r*K;

            row.push(Pi);

            zMin = Math.min(zMin,Pi);
            zMax = Math.max(zMax,Pi);
        }

        Z.push(row);
    }

    Plotly.react(
        "plot",
        [
            {
                type: "contour",
                x: Lgrid,
                y: Kgrid,
                z: Z,
                contours: {
                    coloring: "heatmap"
                }
            },
            {
                x:[opt.L],
                y:[opt.K],
                mode:"markers",
                name:"Óptimo",
                marker:{
                    color:"red",
                    size:10
                }
            }
        ],
        {
            title: cfg.plotTitle,

            xaxis:{
                title: cfg.xLabel
            },

            yaxis:{
                title: cfg.yLabel
            }
        },
        {
            responsive:true
        }
    );

    const surfaceTrace = {

        type:"surface",

        x:Lgrid,
        y:Kgrid,
        z:Z,

        opacity:0.9,

        showscale:false,

        name:"Beneficio"
    };

    const optimumTrace = {

        type:"scatter3d",

        mode:"markers",

        x:[opt.L],
        y:[opt.K],
        z:[opt.Pi],

        marker:{
            size:6,
            color:"red"
        },

        name:"Óptimo"
    };

    Plotly.react(
        "plot3d",
        [
            surfaceTrace,
            optimumTrace
        ],
        {
            title: cfg.plot3dTitle,

            scene: {

                xaxis:{
                    title: cfg.xLabel
                },

                yaxis:{
                    title: cfg.yLabel
                },

                zaxis:{
                    title: cfg.zLabel,
                    range:[zMin,zMax]
                },

                aspectmode:"cube"
            }
        },
        {
            responsive:true
        }
    );
}

controls.alpha.addEventListener("input", () => {

    enforceReturnsToScaleConstraint("alpha");

    updatePlot();
});

controls.beta.addEventListener("input", () => {

    enforceReturnsToScaleConstraint("beta");

    updatePlot();
});

[
    controls.A,
    controls.price,
    controls.wage,
    controls.rent
].forEach(control => {

    control.addEventListener(
        "input",
        updatePlot
    );
});

enforceReturnsToScaleConstraint("alpha");
updatePlot();
