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

var reproduction = [0, 0];

var most_adapted = {
  health: 0,
  myDNA: [],
  howMany: 0,
};

var generation = 0;

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
    isAdapted(population[i]);
    // Eat the food (index 0)
    v.eat(food, 0);
    // Eat the poison (index 1)
    v.eat(poison, 1);
    // Check boundaries
    v.boundaries();

    // Update and draw
    v.update();
    v.display();

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
      if (random(1) > .95) {
        population.forEach(mate => {
          if (v.position === mate.position && random(10) > 9.999) {
            let puppy = mateSucess(v, mate);
            population.push(puppy);
            reproduction[1]++;
            document.querySelector('#mate').textContent = `${reproduction[1]}`;
          }
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
    for (var i = 0; i < 10; i++) {
      population[i] = new Vehicle(random(width), random(height));
    }
  }
}


function isAdapted(individuo) {
  let best_health = individuo.health;
  let best_DNA = individuo.dna;
  if (individuo.health > most_adapted.health) {
    most_adapted.myDNA = best_DNA;
    most_adapted.health = best_health;
    most_adapted.howMany++;
    document.querySelector('#time-stamp').textContent = `${most_adapted.howMany}`;
    document.querySelector('#most_healthy').textContent = `${most_adapted.health}`;
    document.querySelector('#dna_0').textContent = `${most_adapted.myDNA[0]}`;
    document.querySelector('#dna_1').textContent = `${most_adapted.myDNA[1]}`;
    document.querySelector('#dna_2').textContent = `${most_adapted.myDNA[2]}`;
    document.querySelector('#dna_3').textContent = `${most_adapted.myDNA[3]}`;

  }
}

function mateSucess(mate_1, mate_2) {
  let choice = [];
  if (mate_1.position == mate_2.position) {
    for (let i = 0; i < 4; i++) {
      choice.push(random_DNA(mate_1, mate_2, i));
    }
  }
  return new Vehicle(mate_1.position.x, mate_2.position.y, choice);
}

function random_DNA(mate_1, mate_2, index) {
  if (random(1) > .5) {
    return mate_1.dna[index];
  } else {
    return mate_2.dna[index];
  }
}