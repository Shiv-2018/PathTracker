// File: src/App.jsx
import React, { useState } from 'react';
import './App.css';

const numRows = 20;
const numCols = 40;

function createGrid(start, end) {
  return Array.from({ length: numRows }, (_, row) =>
    Array.from({ length: numCols }, (_, col) => ({
      row,
      col,
      isStart: row === start.row && col === start.col,
      isEnd: row === end.row && col === end.col,
      isVisitedBFS: false,
      isVisitedDFS: false,
      isWall: false,
    }))
  );
}

function App() {
  const [start, setStart] = useState({ row: 2, col: 5 });
  const [end, setEnd] = useState({ row: 15, col: 30 });
  const [grid, setGrid] = useState(() => createGrid({ row: 2, col: 5 }, { row: 15, col: 30 }));
  const [mode, setMode] = useState("wall");
  const [mouseDown, setMouseDown] = useState(false);
  const [bfsTime, setBfsTime] = useState(null);
  const [dfsTime, setDfsTime] = useState(null);

  function updateGrid(newStart, newEnd) {
    setGrid(createGrid(newStart, newEnd));
  }

  function handleCellInteraction(row, col) {
    if (mode === "start") {
      setStart({ row, col });
      updateGrid({ row, col }, end);
    } else if (mode === "end") {
      setEnd({ row, col });
      updateGrid(start, { row, col });
    } else {
      const newGrid = grid.map(r => r.map(cell => ({ ...cell })));
      newGrid[row][col].isWall = true;
      setGrid(newGrid);
    }
  }

  function resetVisited(mode = "both") {
    setGrid(grid.map(row =>
      row.map(cell => ({
        ...cell,
        isVisitedBFS: mode === "both" || mode === "bfs" ? false : cell.isVisitedBFS,
        isVisitedDFS: mode === "both" || mode === "dfs" ? false : cell.isVisitedDFS,
      }))
    ));
  }

  async function bfs() {
    resetVisited("bfs");
    const startTime = performance.now();

    const newGrid = grid.map(r => r.map(cell => ({ ...cell })));
    const queue = [start];
    const visited = Array(numRows).fill(null).map(() => Array(numCols).fill(false));
    visited[start.row][start.col] = true;

    const directions = [
      [0, 1], [1, 0], [0, -1], [-1, 0]
    ];

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    while (queue.length > 0) {
      const { row, col } = queue.shift();

      if (!(row === start.row && col === start.col) && !(row === end.row && col === end.col)) {
        newGrid[row][col].isVisitedBFS = true;
      }

      setGrid([...newGrid]);
      await sleep(20);

      if (row === end.row && col === end.col) break;

      for (const [dr, dc] of directions) {
        const r = row + dr, c = col + dc;
        if (
          r >= 0 && r < numRows && c >= 0 && c < numCols &&
          !visited[r][c] && !newGrid[r][c].isWall
        ) {
          visited[r][c] = true;
          queue.push({ row: r, col: c });
        }
      }
    }

    const endTime = performance.now();
    setBfsTime((endTime - startTime).toFixed(2));
  }

  async function dfs() {
    resetVisited("dfs");
    const startTime = performance.now();

    const newGrid = grid.map(r => r.map(cell => ({ ...cell })));
    const visited = Array(numRows).fill(null).map(() => Array(numCols).fill(false));

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let reachedEnd = false;

    async function dfsHelper(row, col) {
      if (
        row < 0 || row >= numRows ||
        col < 0 || col >= numCols ||
        visited[row][col] || newGrid[row][col].isWall || reachedEnd
      ) return;

      visited[row][col] = true;
      if (!(row === start.row && col === start.col) && !(row === end.row && col === end.col)) {
        newGrid[row][col].isVisitedDFS = true;
      }
      setGrid([...newGrid]);
      await sleep(20);

      if (row === end.row && col === end.col) {
        reachedEnd = true;
        return;
      }

      const directions = [
        [0, 1], [1, 0], [0, -1], [-1, 0]
      ];

      for (const [dr, dc] of directions) {
        await dfsHelper(row + dr, col + dc);
        if (reachedEnd) break;
      }
    }

    await dfsHelper(start.row, start.col);
    const endTime = performance.now();
    setDfsTime((endTime - startTime).toFixed(2));
  }

  return (
    <div className="app"
      onMouseDown={() => setMouseDown(true)}
      onMouseUp={() => setMouseDown(false)}
    >
      <h1 className="title">Pathfinding Visualizer (BFS vs DFS)</h1>

      <div className="buttons">
        <button onClick={bfs}>Start BFS</button>
        <button onClick={dfs}>Start DFS</button>
        <select onChange={e => setMode(e.target.value)} value={mode}>
          <option value="wall">Wall</option>
          <option value="start">Start Node</option>
          <option value="end">End Node</option>
        </select>
      </div>

      <div className="timings">
        {bfsTime && <p>BFS Time: {bfsTime} ms</p>}
        {dfsTime && <p>DFS Time: {dfsTime} ms</p>}
      </div>

      <div className="grid">
        {grid.map((row, rIdx) => (
          <div key={rIdx} className="row">
            {row.map((cell, cIdx) => (
              <div
                key={cIdx}
                className={`cell
                  ${cell.isStart ? 'start' : ''}
                  ${cell.isEnd ? 'end' : ''}
                  ${cell.isWall ? 'wall' : ''}
                  ${cell.isVisitedBFS ? 'visited-bfs' : ''}
                  ${cell.isVisitedDFS ? 'visited-dfs' : ''}`}
                onMouseDown={() => handleCellInteraction(cell.row, cell.col)}
                onMouseEnter={() => mouseDown && handleCellInteraction(cell.row, cell.col)}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export default App;
