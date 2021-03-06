import { plays } from './plays.js'

export default function createStatementData(invoice) {
  const statementData = {};
  statementData.customer = invoice.customer;
  statementData.performances = invoice.performances.map(enrichPerformance);
  statementData.totalAmount = totalAmount(statementData);
  statementData.totalVolumeCredits = totalVolumeCredits(statementData);
  return statementData;
}

class performanceCalculator {
  constructor(performance, play) {
    this.performance = performance;
    this.play = play;
  }

  get amount() {
    throw new Error('サブクラスの責務');
  }

  get volumeCredits() {
    let volumeCredits = 0;
    volumeCredits += Math.max(this.performance.audience - 30, 0);
    return volumeCredits;
  }
}

class TragedyCalculator extends performanceCalculator {
  get amount() {
    let thisAmount = 40000;
    if (this.performance.audience > 30) {
      thisAmount += 1000 * (this.performance.audience - 30);
    }
    return thisAmount;
  }
}

class ComedyCalculator extends performanceCalculator {
  get amount() {
    let thisAmount = 0;
    if (this.performance.audience > 20) {
      thisAmount += 10000 + 500 * (this.performance.audience - 20);
    }
    thisAmount += 300 * this.performance.audience;
    return thisAmount;
  }

  get volumeCredits() {
    return super.volumeCredits + Math.floor(this.performance.audience / 5);
  }
}

function createPerformanceCalculator(performance, play) {
  switch (play.type) {
    case "tragedy":
      return new TragedyCalculator(performance, play);
      break;
    case "comedy":
      return new ComedyCalculator(performance, play);
      break;
    default:
      throw new Error(`未知の演劇の種類：${play.type}`)
  }
}

function enrichPerformance(performance) {
  const calculator = createPerformanceCalculator(performance, playFor(performance));
  const result = Object.assign({}, performance);
  result.play = calculator.play;
  result.amount = calculator.amount;
  result.volumeCredits = calculator.volumeCredits;
  return result;
}

function playFor(performance) {
  return plays[performance.playID];
}

function totalVolumeCredits(data) {
  return data.performances
    .reduce((total, p) => total + p.volumeCredits, 0);
}

function totalAmount(data) {
  return data.performances
    .reduce((total, p) => total + p.amount, 0);
}
