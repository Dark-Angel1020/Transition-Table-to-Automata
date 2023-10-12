document.getElementById("setupTable").addEventListener("click", function() {
  const numStates = parseInt(document.getElementById("numStates").value, 10);
  displayTransitionTable(numStates);
  document.getElementById("generateDiagram").removeAttribute("disabled");
});

function displayTransitionTable(numStates) {
  const tableContainer = document.getElementById("tableContainer");
  tableContainer.innerHTML = "";

  const table = document.createElement("table");
  table.innerHTML = `
    <tr>
      <th>From</th>
      <th>By</th>
      <th>To</th>
    </tr>
  `;

  for (let i = 0; i < numStates; i++) {
    const row = document.createElement("tr");

    const fromCell = document.createElement("td");
    const fromInput = document.createElement("input");
    fromInput.type = "text";
    fromInput.setAttribute("name", `fromState-${i}`);
    fromInput.setAttribute("placeholder", `q${i}`);
    fromCell.appendChild(fromInput);
    row.appendChild(fromCell);

    const byCell = document.createElement("td");
    const byInput = document.createElement("input");
    byInput.type = "text";
    byInput.setAttribute("name", `byInput-${i}`);
    byCell.appendChild(byInput);
    row.appendChild(byCell);

    const toCell = document.createElement("td");
    const toInput = document.createElement("input");
    toInput.type = "text";
    toInput.setAttribute("name", `toState-${i}`);
    toCell.appendChild(toInput);
    row.appendChild(toCell);

    table.appendChild(row);
  }

  tableContainer.appendChild(table);
}

document.getElementById("generateDiagram").addEventListener("click", function() {
  generateDiagram();
});

function generateDiagram() {
  const numStates = parseInt(document.getElementById("numStates").value, 10);
  const transitionTable = generateTransitionTable(numStates);

  if (transitionTable) {
    drawAutomataDiagram(transitionTable);
  } else {
    alert("Please fill in all transition details.");
  }
}

function generateTransitionTable(numStates) {
  const transitionTable = [];

  for (let i = 0; i < numStates; i++) {
    const fromState = document.querySelector(`#tableContainer input[name="fromState-${i}"]`).value;
    const byInput = document.querySelector(`#tableContainer input[name="byInput-${i}"]`).value;
    const toState = document.querySelector(`#tableContainer input[name="toState-${i}"]`).value;

    if (!fromState || !byInput || !toState) {
      return null; // If any input is empty, return null to indicate an error
    }

    transitionTable.push({ state: fromState, input: byInput, nextState: toState });
  }

  return transitionTable;
}

function drawAutomataDiagram(transitionTable) {
  // Clear the existing diagram
  document.getElementById("diagram").innerHTML = "";

  // Initialize JointJS graph and paper
  const graph = new joint.dia.Graph();
  const paper = new joint.dia.Paper({
    el: document.getElementById("diagram"),
    model: graph,
    width: 600,
    height: 400,
    gridSize: 1,
  });

  const states = [];
  const links = [];

  // Create the states and links based on the transition table
  transitionTable.forEach((transition) => {
    const fromState = transition.state;
    const toState = transition.nextState;
    const byInput = transition.input;

    if (!states.includes(fromState)) {
      states.push(fromState);
    }

    if (!states.includes(toState)) {
      states.push(toState);
    }

    const link = new joint.shapes.standard.Link({
      source: { id: fromState, port: "out" },
      target: { id: toState, port: "in" },
      labels: [
        {
          position: 0.5,
          attrs: {
            text: { text: byInput },
          },
        },
      ],
    });
    links.push(link);
  });

  const stateWidth = 100;
  const stateHeight = 60;
  const paperWidth = paper.options.width;
  const paperHeight = paper.options.height;
  const xSpacing = paperWidth / (states.length + 1);

  states.forEach((state, index) => {
    const x = xSpacing * (index + 1) - stateWidth / 2;
    const y = paperHeight / 2 - stateHeight / 2;

    const rect = new joint.shapes.standard.Rectangle({
      id: state,
      position: { x, y },
      size: { width: stateWidth, height: stateHeight },
      attrs: {
        body: {
          fill: "#ffffcc",
          stroke: "#000000",
          strokeWidth: 1,
        },
        label: {
          text: state,
          fill: "#000000",
        },
      },
    });

    graph.addCell(rect);
  });

  links.forEach((link) => {
    graph.addCell(link);
  });

  // Set the link vertices to avoid overlap
  joint.layout.DirectedGraph.layout(graph, {
    setLinkVertices: true,
  });
}