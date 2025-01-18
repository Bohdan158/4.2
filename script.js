// Параметры задачи
const P = 150; // вместимость рюкзака
const numItems = 100; // количество предметов
const popSize = 100; // размер популяции
const maxIterations = 800; // максимальное число итераций
const mutationRate = 0.05; // вероятность мутации

// Генерация случайных предметов
const items = Array.from({ length: numItems }, () => ({
  value: Math.floor(Math.random() * 9) + 2,
  weight: Math.floor(Math.random() * 5) + 1,
}));

// Функция расчета пригодности
function fitness(individual) {
  const totalValue = individual.reduce(
    (acc, gene, idx) => acc + (gene ? items[idx].value : 0),
    0
  );
  const totalWeight = individual.reduce(
    (acc, gene, idx) => acc + (gene ? items[idx].weight : 0),
    0
  );
  return totalWeight > P ? 0 : totalValue;
}

// Генерация начальной популяции
function generatePopulation() {
  return Array.from({ length: popSize }, () =>
    Array.from({ length: numItems }, () => Math.random() > 0.5 ? 1 : 0)
  );
}

// Оператор отбора (турнирный отбор)
function selection(population) {
  const [a, b] = [population[Math.floor(Math.random() * popSize)], population[Math.floor(Math.random() * popSize)]];
  return fitness(a) > fitness(b) ? a : b;
}

// Оператор скрещивания
function crossover(parent1, parent2) {
  return parent1.map((gene, idx) => (Math.random() > 0.5 ? gene : parent2[idx]));
}

// Оператор мутации
function mutate(individual) {
  if (Math.random() < mutationRate) {
    const [idx1, idx2] = [Math.floor(Math.random() * numItems), Math.floor(Math.random() * numItems)];
    [individual[idx1], individual[idx2]] = [individual[idx2], individual[idx1]];
  }
}

// Локальное улучшение
function localImprovement(individual) {
  const totalWeight = individual.reduce(
    (acc, gene, idx) => acc + (gene ? items[idx].weight : 0),
    0
  );
  if (totalWeight > P) {
    for (let i = 0; i < individual.length; i++) {
      if (individual[i] === 1 && Math.random() < 0.5) {
        individual[i] = 0;
      }
    }
  }
}

// Основной алгоритм
const population = generatePopulation();
let bestSolution = null;
let bestFitness = 0;
const fitnessHistory = [];

for (let iteration = 1; iteration <= maxIterations; iteration++) {
  const newPopulation = [];
  for (let i = 0; i < popSize / 2; i++) {
    const parent1 = selection(population);
    const parent2 = selection(population);
    const child1 = crossover(parent1, parent2);
    const child2 = crossover(parent1, parent2);
    mutate(child1);
    mutate(child2);
    localImprovement(child1);
    localImprovement(child2);
    newPopulation.push(child1, child2);
  }

  const currentBest = newPopulation.reduce((best, individual) =>
    fitness(individual) > fitness(best) ? individual : best, newPopulation[0]
  );
  const currentFitness = fitness(currentBest);
  
  if (currentFitness > bestFitness) {
    bestFitness = currentFitness;
    bestSolution = currentBest;
  }

  if (iteration % 20 === 0) {
    fitnessHistory.push({ iteration, fitness: bestFitness });
  }
}

// Отображение графика
const ctx = document.getElementById("chart").getContext("2d");
const data = {
  labels: fitnessHistory.map((point) => point.iteration),
  datasets: [{
    label: "Значение целевой функции",
    data: fitnessHistory.map((point) => point.fitness),
    borderColor: "rgba(75, 192, 192, 1)",
    borderWidth: 2,
    fill: false,
    tension: 0.1,
  }],
};
const config = {
  type: "line",
  data: data,
  options: {
    responsive: true,
    plugins: {
      legend: {
        display: true,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Итерации",
        },
      },
      y: {
        title: {
          display: true,
          text: "Значение целевой функции",
        },
      },
    },
  },
};
new Chart(ctx, config);
