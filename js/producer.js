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

    const L =
        (alpha/(alpha+beta))*C/w;

    const K =
        (beta/(alpha+beta))*C/r;

    const Q =
        A*Math.pow(L,alpha)*Math.pow(K,beta);

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

    const xmax = Math.max(
        1.2*C/w,
        1.2*opt.L
    );

    const x = [];

    const costY = [];

    const isoY = [];

    for(let i=0;i<200;i++){

        const L = xmax*i/199;

        x.push(L);

        costY.push(
            (C-w*L)/r
        );

        if(L>0){

            const K =
                Math.pow(
                    opt.Q/
                    (A*Math.pow(L,alpha)),
                    1/beta
                );

            isoY.push(K);
        }
        else{
            isoY.push(null);
        }
    }

    Plotly.react(
        "plot",
        [
            {
                x:x,
                y:costY,
                name:"Isocosto"
            },
            {
                x:x,
                y:isoY,
                name:"Isocuanta óptima"
            },
            {
                x:[opt.L],
                y:[opt.K],
                mode:"markers",
                name:"Óptimo"
            }
        ],
        {
            title:
                "Optimización de la Producción",

            xaxis:{
                title:"Trabajo (L)"
            },

            yaxis:{
                title:"Capital (K)"
            },

            margin:{
                t:50
            }
        },

        {
            responsive:true
        }
    );
}

Object.values(controls).forEach(control => {
    control.addEventListener("input", updatePlot);
});
updatePlot();
