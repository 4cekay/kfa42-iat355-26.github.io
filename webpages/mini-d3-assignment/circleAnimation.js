import * as d3 from "https://cdn.jsdelivr.net/npm/d3@7/+esm";

let svg;
//let circle;

const width = 800;
const height = 600;
const duration = 400;
const clickFrameCount = 10;
let clickCount = 0;

async function prepareVis() {
  svg = d3
    .select("#animation-container")
    .append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", (event) => playAnimation(event));
  // Set attributes for D3 container canvas
}

function randomRGB(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1) + min);
}

//fires and draws every time a click happens -> new circle every click
async function playAnimation() {
  clickCount++;

  if (clickCount <= 10) {
    //https://stackoverflow.com/questions/16770763/mouse-position-in-d3
    //get mouseCoords in array using d3 pointer (when clicked svg)
    const [mouseX, mouseY] = d3.pointer(event);

    //create new circle
    const newCircle = svg
      .append("circle")
      .attr("r", 15)
      .attr("fill", "black")
      .attr("cx", mouseX)
      .attr("cy", mouseY);

    //animation code
    let index = 0;

    const interval = setInterval(() => {
      let randomX = Math.random() * width;
      let randomY = Math.random() * height;
      let randomR = Math.random() * 50 + 10;
      let randomRed = randomRGB(0, 255);
      let randomGreen = randomRGB(0, 255);
      let randomBlue = randomRGB(0, 255);

      newCircle
        .transition()
        .attr("cx", randomX)
        .attr("cy", randomY)
        .attr("r", randomR)
        .attr("fill", `rgb(${randomRed}, ${randomBlue}, ${randomGreen})`) //randomize colour with each change
        .duration(duration); //each spawned circle should go thru its own ani cycle

      //animation frames
      index++;
      if (index >= clickFrameCount) {
        clearInterval(interval);
      }
    }, duration);
  } else {
    alert("Max 10 circles at a time! Don't be greedy, now.");
  }
}

async function runApp() {
  await prepareVis();
  //clear canvas/remove all circles upon clicking button
  document.querySelector("#clear").addEventListener("click", () => {
    const canvas = document.querySelector("svg");
    canvas.replaceChildren();
    clickCount = 0;
  });
}

runApp();
