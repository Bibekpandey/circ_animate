
class GeneticAlgo {
    constructor(environment) {
        this.environment = environment;
        this.generation = 0;
        this.maxScore = 0;
        this.fittest = null;

        this.currentPopulation = new Population(6);

        this.run = this.run.bind(this);
        this.shouldStop = this.shouldStop.bind(this);
    }

    run () {
        let stop = this.shouldStop();
        while (!stop) {
            // run environment with population and get the scores of the population
            const scores = this.environment.run(this.currentPopulation);

            // get two of the fittests
            const fittest = this.currentPopulation.getFittest();
            const fittest2 = this.currentPopulation.getNextFittest();

            this.fittest = fittest;

            this.maxScore = fittest.score;

            this.currentPopulation =  this.currentPopulation.nextGeneration(fittest, fittest2);
        }
        //console.log(this.currentPopulation);
        console.log(this.fittest);
    }

    shouldStop() {
        // TODO
        if(this.maxScore >=100) return true;
        return false;
    }
}


class Population {
    constructor(size=0, individuals=[], gene_length=50) {
        if (size<=0) {
            this.individuals = individuals;
            this.size = this.individuals.length;
        }
        else {
            this.size = size;
            this.individuals = Array.from(Array(size)).map(x=> new Individual(gene_length));
        }

        // bind methods
        this.getFittest = this.getFittest.bind(this);
        this.getNextFittest = this.getNextFittest.bind(this);
        this.nextGeneration = this.nextGeneration.bind(this);
    }

    getFittest() {
        return this.individuals.reduce(
            (a, e) => e.score > a.score ? e:a,
            this.individuals[0]
        )
    }

    getNextFittest() {
        return this.individuals.reduce(
            (a, e) => e.score > a[0].score ? [e, a[0]] : (e.score > a[1].score ? [a[0], e] : a),
            [this.individuals[0], this.individuals[0]]
        )[1];
    }

    nextGeneration() {
        const fittest = this.getFittest(); // elite
        const fittest2 = this.getNextFittest(); // elite

        // get n/2  crossedovers and the remaining mutated
        const halfpop = Math.ceil(this.size/2) - 1;
        const crossedovers = Array.from(Array(halfpop)).reduce(
            (a, e) => [...a, ...fittest.crossOver(fittest2)], // crossover will take place at random places
            []
        );
        const elite_crossedovers = [fittest, fittest2, ...crossedovers];
        // now mutate each of the crossedovers
        const mutated = elite_crossedovers.map(x => x.mutate());

        const num_mutated = this.size - this.elite_crossedovers;
        const individuals = [...elite_crossedovers, ...mutated.splice(0, num_mutated)]
        return new Population(0, individuals);
    }
}


class Individual {
    constructor(chromosome_len, chromosome) {
        this.chromosomeLength = chromosome_len;
        // gene of 0s and 1s
        if(!chromosome) {
            this.chromosome= Array.from(Array(chromosome_len)).map(x => Math.round(Math.random()));
        }
        else {
            this.chromosome = chromosome;
            this.chromosomeLength = chromosome.length;
        }
        this.score = 0;

        this.crossOver = this.crossOver.bind(this);
        this.mutate = this.mutate.bind(this);
    }

    crossOver(other_individual) {
        // get random crossover point
        const point = parseInt(Math.random()*this.chromosomeLength*3/4);

        const new1 = new Individual(this.chromosomeLength, this.chromosome);
        const new2 = new Individual(this.chromosomeLength, other_individual.chromosome);

        for(let x=0;x<point;x++) {
            new1.chromosome[x] = other_individual.chromosome[x];
        }
        for(let x=point;x<this.chromosomeLength;x++) {
            new2.chromosome[x] = this.chromosome[x];
        }
        return [new1, new2];
    }

    mutate() {
        // mutate with 20% probability of flipping gene
        const newInd = new Individual(this.chromosomeLength, this.chromosome);
        for(let x in newInd.chromosome) {
            newInd.chromosome[x] = Math.random() < 0.2 ? !newInd.chromosome[x]: newInd.chromosome[x];
        }
    }
}
