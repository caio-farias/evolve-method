// Daniel Shiffman
// Nature of Code: Intelligence and Learning
// https://github.com/shiffman/NOC-S17-2-Intelligence-Learning

// Evolutionary "Steering Behavior" Simulation

// An array of vehicles
var population = [];

// An array of "food"
var food = [];
// An array of "poison"
var poison = [];

// How good is food, how bad is poison?
var nutrition = [0.1, -1];

// Show additional info on DNA?
var debug;

// var evolve_m = 0.0002;

var reproduction = [0, 0];

var most_adapted = {
  health: [0],
  myDNA: [],
  n_mate: [],
  n_mitose: [],
  isChild: [],
  n_cani: []
};

var generation = 0;

var db;

function setup() {

  // Add canvas and grab checkbox
  var canvas = createCanvas(800, 600);
  canvas.parent('canvascontainer');
  debug = select('#debug');


  // Create 10 vehicles
  angleMode(RADIANS);
  for (var i = 0; i < 10; i++) {
    population[i] = new Vehicle(random(width), random(height));
  }

  // Start with some food
  for (var i = 0; i < 10; i++) {
    food[i] = createVector(random(width), random(height));
  }
  // Start with some poison
  for (var i = 0; i < 5; i++) {
    poison[i] = createVector(random(width), random(height));
  }
}

// Add new vehicles by dragging mouse
function mouseDragged() {
  population.push(new Vehicle(mouseX, mouseY));
}

function draw() {
  background(0);

  // 10% chance of new food
  if (random(1) < 0.1) {
    food.push(createVector(random(width), random(height)));
  }

  // 1% chance of new poison
  if (random(1) < 0.01) {
    poison.push(createVector(random(width), random(height)));
  }

  // Go through all vehicles
  for (var i = population.length - 1; i >= 0; i--) {
    var v = population[i];

    // Eat the food (index 0)
    v.eat(food, 0);
    // Eat the poison (index 1)
    v.eat(poison, 1);
    // Check boundaries
    v.boundaries();

    // Update and draw
    v.update();
    v.display();
    isAdapted(population[i]);
    // If the vehicle has died, remove
    if (v.dead()) {
      population.splice(i, 1);
    } else {
      // Every vehicle has a chance of cloning itself
      var child = v.mitose();
      if (child != null) {
        population.push(child);
        reproduction[0]++;
        document.querySelector('#mitose').textContent = `${reproduction[0]}`;
      }
      if (random(1) > .2) {
        population.forEach(mate => {
          if (v.position === mate.position && random(10) > 9.999) {
            let res = v.mateSucess(mate, reproduction[1]);
            let puppy = res[0];
            reproduction[1] = res[1];
            puppy.isChild = true;
            population.push(puppy);
            document.querySelector('#mate').textContent = `${reproduction[1]}`;
          }
          v.canib(mate);
        });
      }
    }
  }

  // Draw all the food and all the poison
  for (var i = 0; i < food.length; i++) {
    fill(0, 255, 0);
    noStroke();
    ellipse(food[i].x, food[i].y, 4);
  }

  for (var i = 0; i < poison.length; i++) {
    fill(255, 0, 0);
    noStroke();
    ellipse(poison[i].x, poison[i].y, 4);
  }
  document.querySelector('#pop').textContent = `${population.length}`
  if (!population.length) {
    generation++;
    document.querySelector('#gen').textContent = `${generation}`;
    for (var i = 0; i < 10 + round(generation / 10); i++) {
      population[i] = new Vehicle(random(width), random(height));
    }
    saveAsJson(most_adapted);
  }
}


function isAdapted(individuo) {
  let best_health = individuo.health;
  let best_DNA = individuo.dna;
  let best_n_mate = individuo.n_mate;
  let best_n_mitose = individuo.n_mitose;
  let best_isChild = individuo.isChild;
  let best_canibalism = individuo.canibalism;
  let old_l;
  most_adapted.health.length ? old_l = most_adapted.health.length - 1 : old_l = 0;
  if (individuo.health > most_adapted.health[old_l]) {

    most_adapted.myDNA.push(best_DNA);
    l1 = most_adapted.myDNA.length - 1;
    most_adapted.health.push(best_health);
    l2 = most_adapted.health.length - 1;
    most_adapted.n_mate.push(best_n_mate);
    most_adapted.n_mitose.push(best_n_mitose);
    most_adapted.isChild.push(best_isChild);
    most_adapted.n_cani.push(best_canibalism);

    document.querySelector('#time-stamp').textContent = `${l2+1}`;
    document.querySelector('#most_healthy').textContent = `${most_adapted.health[l2]}`;
    document.querySelector('#dna_0').textContent = `${most_adapted.myDNA[l1][0]}`;
    document.querySelector('#dna_1').textContent = `${most_adapted.myDNA[l1][1]}`;
    document.querySelector('#dna_2').textContent = `${most_adapted.myDNA[l1][2]}`;
    document.querySelector('#dna_3').textContent = `${most_adapted.myDNA[l1][3]}`;
    document.querySelector('#caniRate').textContent = `rounded rate: ${round(most_adapted.myDNA[l1][4])} %`;
    document.querySelector('#child').textContent = `${most_adapted.isChild[most_adapted.isChild.length-1]}`;
    document.querySelector('#n-mitose').textContent = `${most_adapted.n_mitose[most_adapted.n_mitose.length-1]}`;
    document.querySelector('#n-mate').textContent = `${most_adapted.n_mate[most_adapted.n_mate.length-1]}`;
    document.querySelector('#cani').textContent = `${most_adapted.n_cani[most_adapted.n_cani.length-1][0]} times / ${most_adapted.n_cani[most_adapted.n_cani.length-1][0]*.02} health points `;
    document.querySelector('#cani-kills').textContent = `${most_adapted.n_cani[most_adapted.n_cani.length-1][1]} kills `;
  }
}

function saveAsJson(data) {
  var json = JSON.stringify(data);
  saveJSON(data, `gen-${generation}.json`);
}