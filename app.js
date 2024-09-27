let matrix = [];
let history = [];
let timerInterval;
let secondsElapsed = 0;

const matrixElement = document.getElementById('matrix');
const matrixInput = document.getElementById('matrix-input');
const operationInput = document.getElementById('operation');
const operationsLog = document.getElementById('operations-log');
const timerElement = document.getElementById('timer');

// Function to start the timer
function startTimer() {
  if (timerInterval) clearInterval(timerInterval);
  secondsElapsed = 0;
  timerInterval = setInterval(() => {
    secondsElapsed++;
    timerElement.innerText = `Time: ${secondsElapsed} seconds`;
  }, 1000);
}

// Function to stop the timer
function stopTimer() {
  clearInterval(timerInterval);
}

// Function to render the matrix
function renderMatrix() {
  matrixElement.innerHTML = '';
  matrix.forEach(row => {
    const rowElement = document.createElement('tr');
    row.forEach(cell => {
      const cellElement = document.createElement('td');
      cellElement.innerText = cell;
      rowElement.appendChild(cellElement);
    });
    matrixElement.appendChild(rowElement);
  });
}

// Function to log the operation
function logOperation(operation) {
  const li = document.createElement('li');
  li.innerText = operation;
  operationsLog.appendChild(li);
}

// Function to parse and execute row operations
function executeOperation(operation) {
    let match;
  
    // Check if the operation is a row swap (e.g., "R1 <> R2")
    if (operation.includes('<>')) {
      match = operation.match(/R(\d)\s*<>\s*R(\d)/);
      if (!match) {
        alert('Invalid row swap operation. Please use "R1 <> R2".');
        return;
      }
  
      const row1 = parseInt(match[1]) - 1;
      const row2 = parseInt(match[2]) - 1;
  
      // Save the current matrix for undo functionality
      history.push(matrix.map(row => [...row]));
  
      // Swap rows
      [matrix[row1], matrix[row2]] = [matrix[row2], matrix[row1]];
  
      logOperation(operation);
      renderMatrix();
      return;
    }
  
    // Check for scalar multiplication (e.g., "R1 = R1 * -2")
    match = operation.match(/R(\d)\s*=\s*R(\d)\s*\*\s*(-?\d+(\.\d+)?)/);
    if (match) {
    const rowResult = parseInt(match[1]) - 1;
    const scalar = parseFloat(match[3]);

    // Save the current matrix for undo functionality
    history.push(matrix.map(row => [...row]));

    // Perform scalar multiplication
    for (let i = 0; i < matrix[rowResult].length; i++) {
        matrix[rowResult][i] *= scalar; // This allows multiplication by negative numbers
    }

    logOperation(operation);
    renderMatrix();
    return;
}

  
    // Check for division operation (e.g., "R1 = R1 / -3")
    match = operation.match(/R(\d)\s*=\s*R(\d)\s*\/\s*(-?\d+(\.\d+)?)/);
    if (match) {
        const rowResult = parseInt(match[1]) - 1;
        const scalar = parseFloat(match[3]);

        // Save the current matrix for undo functionality
        history.push(matrix.map(row => [...row]));

        // Perform division and convert to fraction if necessary
        for (let i = 0; i < matrix[rowResult].length; i++) {
            if (matrix[rowResult][i] % scalar === 0) {
                matrix[rowResult][i] /= scalar; // Perform integer division
            } else {
                matrix[rowResult][i] = `${matrix[rowResult][i]}/${scalar}`; // Convert to fraction
            }
        }

        logOperation(operation);
        renderMatrix();
        return;
    }

  
    // Check for addition/subtraction row operations (e.g., "R1 = R1 + R2")
    match = operation.match(/R(\d)\s*=\s*R(\d)\s*([+-])\s*(\d*)R(\d)/);
    if (match) {
      const rowResult = parseInt(match[1]) - 1;
      const row1 = parseInt(match[2]) - 1;
      const operator = match[3];
      const scalar = match[4] === '' ? 1 : parseFloat(match[4]);
      const row2 = parseInt(match[5]) - 1;
  
      // Save the current matrix for undo functionality
      history.push(matrix.map(row => [...row]));
  
      // Perform the row operation with scalar
      for (let i = 0; i < matrix[rowResult].length; i++) {
        if (operator === '+') {
          matrix[rowResult][i] = matrix[row1][i] + scalar * matrix[row2][i];
        } else if (operator === '-') {
          matrix[rowResult][i] = matrix[row1][i] - scalar * matrix[row2][i];
        }
      }
  
      logOperation(operation);
      renderMatrix();
      return;
    }
  
    alert('Invalid operation format. Please use "R1 = R1 + R2", "R1 = R1 * 2", "R1 = R1 / 3", or "R1 <> R2".');
  }  

// Function to undo the last operation
function undoLastOperation() {
  if (history.length > 0) {
    matrix = history.pop();
    renderMatrix();
    operationsLog.removeChild(operationsLog.lastChild);
  }
}

// Function to set the matrix from the input
function setMatrix() {
  const matrixText = matrixInput.value.trim();
  if (!matrixText) {
    alert('Please enter a valid matrix.');
    return;
  }

  // Parse the matrix input from the textarea
  const rows = matrixText.split('\n').map(row => row.split(' ').map(Number));
  
  // Check if all rows have the same number of columns
  const columnCount = rows[0].length;
  if (!rows.every(row => row.length === columnCount)) {
    alert('All rows must have the same number of columns.');
    return;
  }

  matrix = rows;
  history = []; // Clear history when setting a new matrix
  operationsLog.innerHTML = ''; // Clear operations log
  renderMatrix();
  startTimer(); // Start the timer when matrix is set
}

// Initialize matrix and event listeners
document.getElementById('submit').addEventListener('click', () => {
  const operation = operationInput.value.trim();
  if (operation) {
    executeOperation(operation);
    operationInput.value = '';
  }
});

// Listen for Enter key to initialize matrix
matrixInput.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
        if (!event.shiftKey) {
            setMatrix();
            operationInput.focus();
        }
    }
});

// Listen for Enter key press to submit the operation
operationInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    const operation = operationInput.value.trim();
    if (operation) {
      executeOperation(operation);
      operationInput.value = '';
    }
  }
});

document.getElementById('set-matrix').addEventListener('click', setMatrix);

document.getElementById('reset').addEventListener('click', () => {
  history = [];
  matrix = [];
  operationsLog.innerHTML = '';
  matrixElement.innerHTML = '';
  matrixInput.value = '';
  renderMatrix();
  stopTimer(); // Stop the timer when resetting
  timerElement.innerText = 'Time: 0 seconds';
});

document.getElementById('undo').addEventListener('click', () => {
  undoLastOperation();
});
