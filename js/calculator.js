/**
 * Comprehensive Scientific Mathematics Engine for Apple iOS 26 Liquid Glass Calculator
 * Implements high-precision arithmetic, Lexer + Shunting-Yard AST parser, exact Rational/Fraction math,
 * Complex numbers (a + bi), Statistical analysis, Equation solvers, Matrix/Vector operations,
 * and Base-N conversion with bitwise logic.
 */

// ==========================================
// 1. EXACT RATIONAL MATH (Fraction Engine)
// ==========================================
class Fraction {
  constructor(num, den = 1) {
    if (den === 0) throw new Error("Zero denominator");
    if (den < 0) { num = -num; den = -den; }
    const g = Fraction.gcd(Math.abs(Math.round(num)), Math.abs(Math.round(den)));
    this.num = (Math.round(num) / g) || 0;
    this.den = (Math.round(den) / g) || 1;
  }

  static gcd(a, b) {
    a = Math.abs(a);
    b = Math.abs(b);
    while (b) { const t = b; b = a % b; a = t; }
    return a || 1;
  }

  static fromDecimal(val, maxDenom = 100000) {
    if (val === null || val === undefined || !isFinite(val) || isNaN(val)) return null;
    if (Number.isInteger(val)) return new Fraction(val, 1);

    const sign = val < 0 ? -1 : 1;
    let x = Math.abs(val);

    // Continuous fraction approximation
    let h1 = 1, h2 = 0, k1 = 0, k2 = 1, b = x;
    let iter = 0;
    while (iter++ < 20) {
      const a = Math.floor(b);
      let auxH = a * h1 + h2;
      let auxK = a * k1 + k2;
      if (auxK > maxDenom) break;
      h2 = h1; h1 = auxH;
      k2 = k1; k1 = auxK;
      const diff = b - a;
      if (Math.abs(diff) < 1e-9) break;
      b = 1 / diff;
      if (Math.abs(x - h1 / k1) < 1e-8) break;
    }

    return new Fraction(sign * h1, k1);
  }

  toMixedString() {
    if (this.den === 1) return `${this.num}`;
    const whole = Math.trunc(this.num / this.den);
    const rem = Math.abs(this.num % this.den);
    if (whole === 0) return `${this.num}/${this.den}`;
    return `${whole} ${rem}/${this.den}`;
  }

  toProperString() {
    return this.den === 1 ? `${this.num}` : `${this.num}/${this.den}`;
  }

  toDouble() {
    return this.num / this.den;
  }

  add(other) {
    const o = other instanceof Fraction ? other : Fraction.fromDecimal(other);
    return new Fraction(this.num * o.den + o.num * this.den, this.den * o.den);
  }

  sub(other) {
    const o = other instanceof Fraction ? other : Fraction.fromDecimal(other);
    return new Fraction(this.num * o.den - o.num * this.den, this.den * o.den);
  }

  mul(other) {
    const o = other instanceof Fraction ? other : Fraction.fromDecimal(other);
    return new Fraction(this.num * o.num, this.den * o.den);
  }

  div(other) {
    const o = other instanceof Fraction ? other : Fraction.fromDecimal(other);
    if (o.num === 0) throw new Error("Fraction division by zero");
    return new Fraction(this.num * o.den, this.den * o.num);
  }
}

// ==========================================
// 2. COMPLEX NUMBER ENGINE (a + bi)
// ==========================================
class Complex {
  constructor(re = 0, im = 0) {
    this.re = parseFloat(re) || 0;
    this.im = parseFloat(im) || 0;
  }

  add(other) {
    const o = Complex.from(other);
    return new Complex(this.re + o.re, this.im + o.im);
  }

  sub(other) {
    const o = Complex.from(other);
    return new Complex(this.re - o.re, this.im - o.im);
  }

  mul(other) {
    const o = Complex.from(other);
    return new Complex(
      this.re * o.re - this.im * o.im,
      this.re * o.im + this.im * o.re
    );
  }

  div(other) {
    const o = Complex.from(other);
    const denom = o.re * o.re + o.im * o.im;
    if (denom === 0) throw new Error("Complex division by zero");
    return new Complex(
      (this.re * o.re + this.im * o.im) / denom,
      (this.im * o.re - this.re * o.im) / denom
    );
  }

  abs() {
    return Math.hypot(this.re, this.im);
  }

  arg(deg = false) {
    let rad = Math.atan2(this.im, this.re);
    return deg ? (rad * 180) / Math.PI : rad;
  }

  conj() {
    return new Complex(this.re, -this.im);
  }

  static from(val) {
    if (val instanceof Complex) return val;
    if (typeof val === 'number') return new Complex(val, 0);
    const s = String(val).replace(/\s+/g, '');
    if (s === 'i') return new Complex(0, 1);
    if (s === '-i') return new Complex(0, -1);
    const m = s.match(/^([+-]?\d*(?:\.\d+)?(?:e[+-]?\d+)?)?([+-]?\d*(?:\.\d+)?(?:e[+-]?\d+)?i)?$/i);
    if (!m) return new Complex(parseFloat(val) || 0, 0);
    let re = m[1] ? parseFloat(m[1]) : 0;
    let imStr = m[2];
    let im = 0;
    if (imStr) {
      imStr = imStr.replace(/i/i, '');
      if (imStr === '' || imStr === '+') im = 1;
      else if (imStr === '-') im = -1;
      else im = parseFloat(imStr);
    }
    return new Complex(re, im);
  }

  toString(precision = 6) {
    const r = parseFloat(this.re.toFixed(precision));
    const i = parseFloat(this.im.toFixed(precision));
    if (i === 0) return `${r}`;
    if (r === 0) return i === 1 ? 'i' : i === -1 ? '-i' : `${i}i`;
    const sign = i > 0 ? '+' : '-';
    const absI = Math.abs(i);
    const iPart = absI === 1 ? 'i' : `${absI}i`;
    return `${r} ${sign} ${iPart}`;
  }
}

// ==========================================
// 3. STATISTICAL SUITE (1-Var & Regression)
// ==========================================
class StatisticsSuite {
  static analyze(dataset) {
    if (!dataset || dataset.length === 0) {
      throw new Error("Dataset is empty");
    }
    const n = dataset.length;
    const sum = dataset.reduce((a, b) => a + b, 0);
    const mean = sum / n;
    const sumSq = dataset.reduce((a, b) => a + b * b, 0);

    const varPop = dataset.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
    const stdPop = Math.sqrt(varPop);
    const varSample = n > 1 ? dataset.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / (n - 1) : 0;
    const stdSample = Math.sqrt(varSample);

    const sorted = [...dataset].sort((a, b) => a - b);
    const min = sorted[0];
    const max = sorted[n - 1];
    let median = 0;
    if (n % 2 === 0) {
      median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
    } else {
      median = sorted[Math.floor(n / 2)];
    }

    return {
      n,
      sum: parseFloat(sum.toFixed(8)),
      mean: parseFloat(mean.toFixed(8)),
      sumSq: parseFloat(sumSq.toFixed(8)),
      stdPop: parseFloat(stdPop.toFixed(8)),
      stdSample: parseFloat(stdSample.toFixed(8)),
      variance: parseFloat(varSample.toFixed(8)),
      min,
      max,
      median
    };
  }

  static linearRegression(xArr, yArr) {
    if (xArr.length !== yArr.length || xArr.length < 2) {
      throw new Error("Datasets must have equal length and at least 2 points");
    }
    const n = xArr.length;
    const sumX = xArr.reduce((a, b) => a + b, 0);
    const sumY = yArr.reduce((a, b) => a + b, 0);
    const sumXY = xArr.reduce((acc, x, i) => acc + x * yArr[i], 0);
    const sumXX = xArr.reduce((acc, x) => acc + x * x, 0);
    const sumYY = yArr.reduce((acc, y) => acc + y * y, 0);

    const denom = n * sumXX - sumX * sumX;
    if (denom === 0) throw new Error("Vertical line, infinite slope");
    const slope = (n * sumXY - sumX * sumY) / denom;
    const intercept = (sumY - slope * sumX) / n;

    const rDenom = Math.sqrt((n * sumXX - sumX * sumX) * (n * sumYY - sumY * sumY));
    const r = rDenom !== 0 ? (n * sumXY - sumX * sumY) / rDenom : 0;

    return {
      slope: parseFloat(slope.toFixed(6)),
      intercept: parseFloat(intercept.toFixed(6)),
      r: parseFloat(r.toFixed(6)),
      r2: parseFloat((r * r).toFixed(6)),
      equation: `y = ${slope.toFixed(4)}x ${intercept >= 0 ? '+' : '-'} ${Math.abs(intercept).toFixed(4)}`
    };
  }
}

// ==========================================
// 4. EQUATION SOLVER (Linear, Quad, 2x2 System)
// ==========================================
class EquationSolver {
  static solveLinear(a, b) {
    if (a === 0) {
      return b === 0 ? "Infinite solutions (0 = 0)" : "No solution";
    }
    const x = -b / a;
    return `x = ${parseFloat(x.toFixed(8))}`;
  }

  static solveQuadratic(a, b, c) {
    if (a === 0) return this.solveLinear(b, c);
    const disc = b * b - 4 * a * c;
    if (disc > 0) {
      const x1 = (-b + Math.sqrt(disc)) / (2 * a);
      const x2 = (-b - Math.sqrt(disc)) / (2 * a);
      return `x₁ = ${parseFloat(x1.toFixed(6))}\nx₂ = ${parseFloat(x2.toFixed(6))}`;
    } else if (disc === 0) {
      const x = -b / (2 * a);
      return `x = ${parseFloat(x.toFixed(6))} (Double root)`;
    } else {
      const re = -b / (2 * a);
      const im = Math.sqrt(-disc) / (2 * a);
      return `x₁ = ${parseFloat(re.toFixed(4))} + ${parseFloat(Math.abs(im).toFixed(4))}i\nx₂ = ${parseFloat(re.toFixed(4))} - ${parseFloat(Math.abs(im).toFixed(4))}i`;
    }
  }

  static solve2x2(a1, b1, c1, a2, b2, c2) {
    const D = a1 * b2 - a2 * b1;
    const Dx = c1 * b2 - c2 * b1;
    const Dy = a1 * c2 - a2 * c1;
    if (D === 0) {
      return Dx === 0 && Dy === 0 ? "Infinite solutions" : "Inconsistent (No solution)";
    }
    const x = Dx / D;
    const y = Dy / D;
    return `x = ${parseFloat(x.toFixed(6))}\ny = ${parseFloat(y.toFixed(6))}`;
  }
}

// ==========================================
// 5. MATRIX & VECTOR ENGINE
// ==========================================
class MatrixEngine {
  static det2x2(m) {
    return m[0][0] * m[1][1] - m[0][1] * m[1][0];
  }

  static det3x3(m) {
    return (
      m[0][0] * (m[1][1] * m[2][2] - m[1][2] * m[2][1]) -
      m[0][1] * (m[1][0] * m[2][2] - m[1][2] * m[2][0]) +
      m[0][2] * (m[1][0] * m[2][1] - m[1][1] * m[2][0])
    );
  }

  static transpose(m) {
    return m[0].map((_, c) => m.map(r => r[c]));
  }

  static add(A, B) {
    return A.map((row, r) => row.map((val, c) => val + B[r][c]));
  }

  static multiply(A, B) {
    const rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
    const res = Array.from({ length: rowsA }, () => Array(colsB).fill(0));
    for (let i = 0; i < rowsA; i++) {
      for (let j = 0; j < colsB; j++) {
        let sum = 0;
        for (let k = 0; k < colsA; k++) sum += A[i][k] * B[k][j];
        res[i][j] = parseFloat(sum.toFixed(6));
      }
    }
    return res;
  }

  static inverse2x2(m) {
    const det = this.det2x2(m);
    if (det === 0) throw new Error("Matrix is singular (det = 0)");
    return [
      [parseFloat((m[1][1] / det).toFixed(6)), parseFloat((-m[0][1] / det).toFixed(6))],
      [parseFloat((-m[1][0] / det).toFixed(6)), parseFloat((m[0][0] / det).toFixed(6))]
    ];
  }

  static dot(u, v) {
    return u.reduce((sum, val, idx) => sum + val * (v[idx] || 0), 0);
  }

  static cross(u, v) {
    return [
      u[1] * v[2] - u[2] * v[1],
      u[2] * v[0] - u[0] * v[2],
      u[0] * v[1] - u[1] * v[0]
    ];
  }

  static magnitude(v) {
    return Math.hypot(...v);
  }
}

// ==========================================
// 6. BASE-N ENGINE & BITWISE OPERATORS
// ==========================================
class BaseNEngine {
  static convert(valueStr, fromBase = 10) {
    try {
      const cleanStr = String(valueStr).trim().replace(/,/g, '');
      let intVal = parseInt(cleanStr, fromBase);
      if (isNaN(intVal)) return { dec: "0", hex: "0", bin: "0", oct: "0" };
      intVal = intVal >>> 0;
      return {
        dec: intVal.toString(10),
        hex: intVal.toString(16).toUpperCase(),
        bin: intVal.toString(2).padStart(8, '0'),
        oct: intVal.toString(8)
      };
    } catch(e) {
      return { dec: "Error", hex: "Error", bin: "Error", oct: "Error" };
    }
  }

  static bitwise(a, b, op) {
    const valA = parseInt(a, 10);
    const valB = parseInt(b, 10);
    switch (op) {
      case 'AND': return (valA & valB) >>> 0;
      case 'OR':  return (valA | valB) >>> 0;
      case 'XOR': return (valA ^ valB) >>> 0;
      case 'NOT': return (~valA) >>> 0;
      case 'SHL': return (valA << valB) >>> 0;
      case 'SHR': return (valA >>> valB) >>> 0;
      default: return valA;
    }
  }
}

// ==========================================
// 7. DETERMINISTIC AST & SHUNTING-YARD PARSER
// ==========================================
class MathParser {
  constructor(engine) {
    this.engine = engine;
  }

  // Tokenize string with automatic implicit multiplication
  tokenize(rawExpr) {
    const s = rawExpr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/−/g, '-')
      .replace(/–/g, '-');

    const tokens = [];
    let i = 0;

    const isDigit = c => (c >= '0' && c <= '9') || c === '.';
    const isLetter = c => (c >= 'a' && c <= 'z') || (c >= 'A' && c <= 'Z') || c === 'π' || c === '√' || c === '∛';

    while (i < s.length) {
      const c = s[i];

      if (c === ' ' || c === '\t') {
        i++;
        continue;
      }

      // Numbers (with optional scientific exponent e.g. 1.25e-3)
      if (isDigit(c)) {
        let numStr = c;
        i++;
        while (i < s.length && (isDigit(s[i]) || s[i].toLowerCase() === 'e')) {
          if (s[i].toLowerCase() === 'e') {
            numStr += s[i];
            i++;
            if (i < s.length && (s[i] === '+' || s[i] === '-')) {
              numStr += s[i];
              i++;
            }
          } else {
            numStr += s[i];
            i++;
          }
        }
        tokens.push({ type: 'NUM', val: parseFloat(numStr), raw: numStr });
        continue;
      }

      // Identifiers / Functions / Constants
      if (isLetter(c)) {
        let ident = c;
        i++;
        while (i < s.length && (isLetter(s[i]) || isDigit(s[i]) || s[i] === '⁻' || s[i] === '¹')) {
          ident += s[i];
          i++;
        }
        tokens.push({ type: 'IDENT', val: ident });
        continue;
      }

      // Operators and grouping
      if (['+', '-', '*', '/', '^', '%', '!', '(', ')', ','].includes(c)) {
        tokens.push({ type: 'OP', val: c });
        i++;
        continue;
      }

      i++;
    }

    // Insert implicit multiplications
    const processed = [];
    for (let k = 0; k < tokens.length; k++) {
      const curr = tokens[k];
      const prev = tokens[k - 1];

      if (prev) {
        const prevCanMultiply = prev.type === 'NUM' || prev.val === ')' || prev.val === '!' || prev.type === 'IDENT';
        const currCanBeMultiplied = curr.type === 'NUM' || curr.val === '(' || curr.type === 'IDENT';

        if (prevCanMultiply && currCanBeMultiplied) {
          // If prev is a function identifier, don't insert * before its argument '('
          const isFunc = prev.type === 'IDENT' && this.isFunction(prev.val);
          if (!isFunc) {
            processed.push({ type: 'OP', val: '*' });
          }
        }
      }
      processed.push(curr);
    }

    return processed;
  }

  isFunction(name) {
    const funcs = [
      'sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'sin⁻¹', 'cos⁻¹', 'tan⁻¹',
      'sinh', 'cosh', 'tanh', 'asinh', 'acosh', 'atanh',
      'log', 'ln', 'sqrt', 'cbrt', 'abs', 'nroot', 'exp', 'fact'
    ];
    return funcs.includes(name.toLowerCase());
  }

  // Shunting-Yard to Postfix (RPN)
  toRPN(tokens) {
    const output = [];
    const opStack = [];

    const precedence = {
      '+': 1, '-': 1,
      '*': 2, '/': 2, '%': 2,
      '^': 3,
      'u-': 4, 'u+': 4,
      '!': 5
    };

    const rightAssoc = { '^': true, 'u-': true, 'u+': true };

    for (let i = 0; i < tokens.length; i++) {
      const token = tokens[i];

      if (token.type === 'NUM') {
        output.push(token);
      } else if (token.type === 'IDENT') {
        if (this.isFunction(token.val)) {
          opStack.push(token);
        } else {
          // Constant or Variable
          const val = this.resolveVariable(token.val);
          output.push({ type: 'NUM', val, raw: token.val });
        }
      } else if (token.val === ',') {
        while (opStack.length && opStack[opStack.length - 1].val !== '(') {
          output.push(opStack.pop());
        }
      } else if (token.type === 'OP') {
        let op = token.val;

        // Unary minus/plus detection
        if (op === '-' || op === '+') {
          const prev = tokens[i - 1];
          if (!prev || (prev.type === 'OP' && prev.val !== ')') || prev.val === '(') {
            op = op === '-' ? 'u-' : 'u+';
          }
        }

        if (op === '!') {
          output.push({ type: 'OP', val: '!' });
          continue;
        }

        if (op === '(') {
          opStack.push({ type: 'OP', val: '(' });
        } else if (op === ')') {
          while (opStack.length && opStack[opStack.length - 1].val !== '(') {
            output.push(opStack.pop());
          }
          if (opStack.length && opStack[opStack.length - 1].val === '(') {
            opStack.pop(); // remove '('
          }
          if (opStack.length && opStack[opStack.length - 1].type === 'IDENT' && this.isFunction(opStack[opStack.length - 1].val)) {
            output.push(opStack.pop());
          }
        } else {
          const prec = precedence[op] || 0;
          while (opStack.length) {
            const top = opStack[opStack.length - 1];
            if (top.val === '(') break;
            const topPrec = precedence[top.val] || (top.type === 'IDENT' ? 6 : 0);
            if ((!rightAssoc[op] && prec <= topPrec) || (rightAssoc[op] && prec < topPrec)) {
              output.push(opStack.pop());
            } else {
              break;
            }
          }
          opStack.push({ type: 'OP', val: op });
        }
      }
    }

    while (opStack.length) {
      output.push(opStack.pop());
    }

    return output;
  }

  resolveVariable(name) {
    const n = name.toLowerCase();
    if (n === 'π' || n === 'pi') return Math.PI;
    if (n === 'e') return Math.E;
    if (n === 'ans') return this.engine.memory.Ans || 0;
    if (this.engine.memory[name.toUpperCase()] !== undefined) {
      return this.engine.memory[name.toUpperCase()];
    }
    return parseFloat(name) || 0;
  }

  // Evaluate Postfix expression
  evalRPN(rpn) {
    const stack = [];

    for (const token of rpn) {
      if (token.type === 'NUM') {
        stack.push(token.val);
      } else if (token.type === 'OP') {
        if (token.val === 'u-') {
          stack.push(-stack.pop());
        } else if (token.val === 'u+') {
          // no-op
        } else if (token.val === '!') {
          const a = stack.pop();
          stack.push(this.engine.factorial(a));
        } else {
          const b = stack.pop();
          const a = stack.pop();
          switch (token.val) {
            case '+': stack.push(a + b); break;
            case '-': stack.push(a - b); break;
            case '*': stack.push(a * b); break;
            case '/':
              if (b === 0) throw new Error("Division by zero");
              stack.push(a / b);
              break;
            case '%': stack.push(a % b); break;
            case '^': stack.push(Math.pow(a, b)); break;
          }
        }
      } else if (token.type === 'IDENT' && this.isFunction(token.val)) {
        const fn = token.val.toLowerCase();
        const a = stack.pop();
        stack.push(this.evalFunction(fn, a));
      }
    }

    if (stack.length !== 1) throw new Error("Invalid expression syntax");
    return stack[0];
  }

  evalFunction(fn, val) {
    const eng = this.engine;
    switch (fn) {
      case 'sin': return Math.sin(eng.toRadians(val));
      case 'cos': return Math.cos(eng.toRadians(val));
      case 'tan':
        if (eng.angleMode === 'DEG' && Math.abs(val % 180) === 90) throw new Error("Undefined (tan 90°)");
        return Math.tan(eng.toRadians(val));
      case 'asin':
      case 'sin⁻¹': return eng.fromRadians(Math.asin(val));
      case 'acos':
      case 'cos⁻¹': return eng.fromRadians(Math.acos(val));
      case 'atan':
      case 'tan⁻¹': return eng.fromRadians(Math.atan(val));
      case 'sinh': return Math.sinh(val);
      case 'cosh': return Math.cosh(val);
      case 'tanh': return Math.tanh(val);
      case 'asinh': return Math.asinh(val);
      case 'acosh': return Math.acosh(val);
      case 'atanh': return Math.atanh(val);
      case 'log':
        if (val <= 0) throw new Error("Log out of domain");
        return Math.log10(val);
      case 'ln':
        if (val <= 0) throw new Error("Ln out of domain");
        return Math.log(val);
      case 'sqrt':
      case '√':
        if (val < 0) throw new Error("Negative square root");
        return Math.sqrt(val);
      case 'cbrt':
      case '∛': return Math.cbrt(val);
      case 'abs': return Math.abs(val);
      case 'exp': return Math.exp(val);
      case 'fact': return eng.factorial(val);
      default: return val;
    }
  }

  evaluate(exprStr) {
    const tokens = this.tokenize(exprStr);
    if (tokens.length === 0) return 0;
    const rpn = this.toRPN(tokens);
    const res = this.evalRPN(rpn);
    // Cleanup precision quirks (e.g. 0.1 + 0.2 = 0.3)
    if (Math.abs(res) < 1e-14) return 0;
    return parseFloat(res.toFixed(12));
  }
}

// ==========================================
// 8. UNIFIED SCIENTIFIC CALCULATOR ENGINE
// ==========================================
class ScientificCalculatorEngine {
  constructor() {
    this.currentValue = '0';
    this.expression = '';
    this.previousValue = null;
    this.operation = null;
    this.shouldResetScreen = false;
    
    // Modes
    this.mode = 'COMP'; // COMP | CMPLX | BASE | STAT | EQN | MATRIX
    this.angleMode = 'DEG'; // DEG | RAD | GRAD
    this.baseMode = 10;     // 10 (DEC) | 16 (HEX) | 2 (BIN) | 8 (OCT)
    this.isSecond = false;  // Shift / 2nd mode active
    this.isHyp = false;     // Hyperbolic trig mode

    // Memory registers
    this.memory = {
      M: 0,
      Ans: 0,
      A: 0,
      B: 0,
      C: 0,
      D: 0,
      X: 0,
      Y: 0
    };

    // Fractions
    this.currentFraction = null;
    this.isFractionView = false;

    // History
    this.history = JSON.parse(localStorage.getItem('calc_history') || '[]');

    // Math parser
    this.parser = new MathParser(this);
  }

  // Angle Mode Helpers
  setAngleMode(mode) {
    if (['DEG', 'RAD', 'GRAD'].includes(mode)) {
      this.angleMode = mode;
    }
    return this.angleMode;
  }

  toggleRadDeg() {
    if (this.angleMode === 'DEG') this.angleMode = 'RAD';
    else if (this.angleMode === 'RAD') this.angleMode = 'GRAD';
    else this.angleMode = 'DEG';
    return this.angleMode === 'RAD';
  }

  cycleAngleMode() {
    return this.toggleRadDeg();
  }

  toRadians(val) {
    if (this.angleMode === 'RAD') return val;
    if (this.angleMode === 'GRAD') return (val * Math.PI) / 200;
    return (val * Math.PI) / 180;
  }

  fromRadians(rad) {
    if (this.angleMode === 'RAD') return rad;
    if (this.angleMode === 'GRAD') return (rad * 200) / Math.PI;
    return (rad * 180) / Math.PI;
  }

  factorial(n) {
    if (n < 0 || !Number.isInteger(n) || n > 170) throw new Error("Invalid factorial");
    if (n <= 1) return 1;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  // Number & Digit Input
  appendNumber(number) {
    if (this.currentValue === '0' || this.shouldResetScreen || this.currentValue === 'Error') {
      this.currentValue = String(number);
      this.shouldResetScreen = false;
    } else {
      // In Base mode, validate digits
      if (this.mode === 'BASE') {
        if (this.baseMode === 2 && !['0', '1'].includes(number)) return;
        if (this.baseMode === 8 && !['0', '1', '2', '3', '4', '5', '6', '7'].includes(number)) return;
        if (this.baseMode === 10 && !/[0-9]/.test(number)) return;
      }
      this.currentValue += String(number);
    }
    this.currentFraction = null;
    this.isFractionView = false;
  }

  appendDecimal() {
    if (this.mode === 'BASE') return; // Decimals disabled in Base-N
    if (this.shouldResetScreen) {
      this.currentValue = '0.';
      this.shouldResetScreen = false;
      return;
    }
    if (!this.currentValue.includes('.')) {
      this.currentValue += '.';
    }
  }

  appendConstant(constName) {
    const val = constName === 'pi' || constName === 'π' ? Math.PI : Math.E;
    this.currentValue = `${val}`;
    this.shouldResetScreen = true;
    this.currentFraction = null;
    this.isFractionView = false;
  }

  appendExp() {
    if (this.shouldResetScreen || this.currentValue === '0') {
      this.currentValue = '1e+';
      this.shouldResetScreen = false;
      return;
    }
    if (!this.currentValue.toLowerCase().includes('e')) {
      this.currentValue += 'e+';
    }
  }

  // Unary Modifiers
  toggleSign() {
    if (this.currentValue === '0' || this.currentValue === 'Error') return;
    if (this.currentValue.startsWith('-')) {
      this.currentValue = this.currentValue.substring(1);
    } else {
      this.currentValue = '-' + this.currentValue;
    }
  }

  percent() {
    const val = parseFloat(this.currentValue);
    if (isNaN(val)) return;
    const res = val / 100;
    this.currentValue = `${res}`;
    this.currentFraction = Fraction.fromDecimal(res);
    this.shouldResetScreen = true;
  }

  backspace() {
    if (this.shouldResetScreen || this.currentValue === 'Error') {
      this.clearAll();
      return;
    }
    if (this.currentValue.length <= 1 || (this.currentValue.length === 2 && this.currentValue.startsWith('-'))) {
      this.currentValue = '0';
    } else {
      this.currentValue = this.currentValue.slice(0, -1);
    }
  }

  clearAll() {
    this.currentValue = '0';
    this.previousValue = null;
    this.operation = null;
    this.expression = '';
    this.shouldResetScreen = false;
    this.currentFraction = null;
    this.isFractionView = false;
  }

  clearEntry() {
    this.currentValue = '0';
  }

  // Fraction Toggle (S⇔D)
  toggleFractionDisplay() {
    const num = parseFloat(this.currentValue);
    if (isNaN(num) || !isFinite(num)) return;

    if (!this.currentFraction) {
      this.currentFraction = Fraction.fromDecimal(num);
    }
    if (!this.currentFraction) return;

    this.isFractionView = !this.isFractionView;
    if (this.isFractionView) {
      this.currentValue = this.currentFraction.toMixedString();
    } else {
      this.currentValue = `${this.currentFraction.toDouble()}`;
    }
  }

  // Standard Binary Operations (+, -, *, /, ^)
  chooseOperation(op) {
    if (this.currentValue === 'Error') return;

    // Convert display operators
    let cleanOp = op;
    if (op === '×') cleanOp = '*';
    if (op === '÷') cleanOp = '/';
    if (op === '−') cleanOp = '-';

    if (this.previousValue !== null && !this.shouldResetScreen) {
      this.compute(false);
    }

    this.operation = cleanOp;
    this.previousValue = this.currentValue;
    const symbol = cleanOp === '*' ? '×' : cleanOp === '/' ? '÷' : cleanOp === '-' ? '−' : cleanOp;
    this.expression = `${this.previousValue} ${symbol}`;
    this.shouldResetScreen = true;
  }

  // Evaluate Expression
  compute(addToHistory = true) {
    if (this.previousValue === null || this.operation === null) {
      // Direct expression evaluate if expression string has formula
      if (this.expression && !this.expression.endsWith('=')) {
        try {
          const fullExpr = this.expression + ' ' + this.currentValue;
          const result = this.parser.evaluate(fullExpr);
          if (addToHistory) {
            this.addHistory(fullExpr, this.formatNumber(result));
          }
          this.memory.Ans = result;
          this.expression = `${fullExpr} =`;
          this.currentValue = this.formatNumber(result);
          this.currentFraction = Fraction.fromDecimal(result);
          this.shouldResetScreen = true;
          return;
        } catch(e) {
          this.currentValue = 'Error';
          this.shouldResetScreen = true;
          return;
        }
      }
      return;
    }

    const prev = parseFloat(this.previousValue);
    const curr = parseFloat(this.currentValue);
    if (isNaN(prev) || isNaN(curr)) return;

    let computation;
    const op = this.operation;

    try {
      switch (op) {
        case '+': computation = prev + curr; break;
        case '-': computation = prev - curr; break;
        case '*': computation = prev * curr; break;
        case '/':
          if (curr === 0) throw new Error("Divide by zero");
          computation = prev / curr;
          break;
        case '^': computation = Math.pow(prev, curr); break;
        case 'nroot':
          if (prev <= 0 && curr % 2 === 0) throw new Error("Even root of negative");
          computation = Math.pow(prev, 1 / curr);
          break;
        default: return;
      }

      if (!isFinite(computation) || isNaN(computation)) throw new Error("Math Error");

      computation = parseFloat(computation.toFixed(11));
      const symbol = op === '*' ? '×' : op === '/' ? '÷' : op === '-' ? '−' : op;
      const expr = `${this.previousValue} ${symbol} ${this.currentValue}`;

      if (addToHistory) {
        this.addHistory(expr, this.formatNumber(computation));
      }

      this.memory.Ans = computation;
      this.currentValue = this.formatNumber(computation);
      this.currentFraction = Fraction.fromDecimal(computation);
      this.expression = `${expr} =`;
      this.operation = null;
      this.previousValue = null;
      this.shouldResetScreen = true;
    } catch(err) {
      this.currentValue = 'Error';
      this.expression = '';
      this.shouldResetScreen = true;
    }
  }

  // Scientific Unary / Direct Actions
  scientificOp(op) {
    const val = parseFloat(this.currentValue);
    if (isNaN(val) && op !== 'pi' && op !== 'e' && op !== 'ans') {
      this.currentValue = 'Error';
      this.shouldResetScreen = true;
      return;
    }

    let res = 0;
    let label = '';

    try {
      switch (op) {
        case 'rad-deg':
          this.toggleRadDeg();
          return;
        case 'pi':
          this.appendConstant('pi');
          return;
        case 'e':
          this.appendConstant('e');
          return;
        case 'ans':
          this.currentValue = `${this.memory.Ans || 0}`;
          this.shouldResetScreen = true;
          return;
        case 'sqr':
          res = Math.pow(val, 2);
          label = `sqr(${val})`;
          break;
        case 'cube':
          res = Math.pow(val, 3);
          label = `cube(${val})`;
          break;
        case 'sqrt':
          if (val < 0) throw new Error("Negative square root");
          res = Math.sqrt(val);
          label = `√(${val})`;
          break;
        case 'cbrt':
          res = Math.cbrt(val);
          label = `∛(${val})`;
          break;
        case 'inv':
          if (val === 0) throw new Error("Division by zero");
          res = 1 / val;
          label = `1/(${val})`;
          break;
        case 'exp10':
          res = Math.pow(10, val);
          label = `10^(${val})`;
          break;
        case 'expe':
          res = Math.exp(val);
          label = `e^(${val})`;
          break;
        case 'abs':
          res = Math.abs(val);
          label = `|${val}|`;
          break;
        case 'sin':
          res = this.isSecond ? this.fromRadians(Math.asin(val)) : Math.sin(this.toRadians(val));
          label = this.isSecond ? `sin⁻¹(${val})` : `sin(${val})`;
          break;
        case 'cos':
          res = this.isSecond ? this.fromRadians(Math.acos(val)) : Math.cos(this.toRadians(val));
          label = this.isSecond ? `cos⁻¹(${val})` : `cos(${val})`;
          break;
        case 'tan':
          if (!this.isSecond && this.angleMode === 'DEG' && Math.abs(val % 180) === 90) {
            throw new Error("Undefined (tan 90°)");
          }
          res = this.isSecond ? this.fromRadians(Math.atan(val)) : Math.tan(this.toRadians(val));
          label = this.isSecond ? `tan⁻¹(${val})` : `tan(${val})`;
          break;
        case 'sinh':
          res = this.isSecond ? Math.asinh(val) : Math.sinh(val);
          label = this.isSecond ? `asinh(${val})` : `sinh(${val})`;
          break;
        case 'cosh':
          res = this.isSecond ? Math.acosh(val) : Math.cosh(val);
          label = this.isSecond ? `acosh(${val})` : `cosh(${val})`;
          break;
        case 'tanh':
          res = this.isSecond ? Math.atanh(val) : Math.tanh(val);
          label = this.isSecond ? `atanh(${val})` : `tanh(${val})`;
          break;
        case 'log':
          if (val <= 0) throw new Error("Non-positive logarithm");
          res = Math.log10(val);
          label = `log(${val})`;
          break;
        case 'ln':
          if (val <= 0) throw new Error("Non-positive ln");
          res = Math.log(val);
          label = `ln(${val})`;
          break;
        case 'fact':
          res = this.factorial(val);
          label = `${val}!`;
          break;
        case 'sd':
          this.toggleFractionDisplay();
          return;
        default:
          return;
      }

      if (Math.abs(res) < 1e-14) res = 0;
      else if (Math.abs(res - 1) < 1e-14) res = 1;
      else if (Math.abs(res + 1) < 1e-14) res = -1;

      this.currentValue = this.formatNumber(res);
      this.currentFraction = Fraction.fromDecimal(res);
      this.expression = `${label} =`;
      this.shouldResetScreen = true;
      this.addHistory(label, this.formatNumber(res));
    } catch(err) {
      this.currentValue = 'Error';
      this.shouldResetScreen = true;
    }
  }

  // Memory Operations
  memoryStore(reg = 'M') {
    const val = parseFloat(this.currentValue);
    if (!isNaN(val) && this.memory[reg] !== undefined) {
      this.memory[reg] = val;
    }
  }

  memoryRecall(reg = 'M') {
    if (this.memory[reg] !== undefined) {
      this.currentValue = `${this.memory[reg]}`;
      this.shouldResetScreen = true;
    }
  }

  memoryAdd(reg = 'M') {
    const val = parseFloat(this.currentValue);
    if (!isNaN(val)) this.memory[reg] = (this.memory[reg] || 0) + val;
    this.shouldResetScreen = true;
  }

  memorySub(reg = 'M') {
    const val = parseFloat(this.currentValue);
    if (!isNaN(val)) this.memory[reg] = (this.memory[reg] || 0) - val;
    this.shouldResetScreen = true;
  }

  memoryClear(reg = 'M') {
    this.memory[reg] = 0;
  }

  // Number Formatting
  formatNumber(num) {
    if (num === 'Error' || num === undefined || num === null) return 'Error';
    if (!isFinite(num)) return 'Error';
    const rounded = parseFloat(num.toFixed(10));
    if (Math.abs(rounded) >= 1e12 || (Math.abs(rounded) > 0 && Math.abs(rounded) < 1e-7)) {
      return rounded.toExponential(6);
    }
    return rounded.toString();
  }

  formatDisplayValue(valStr) {
    if (valStr === 'Error' || valStr === undefined || valStr === null) return 'Error';
    if (String(valStr).includes('/') || String(valStr).includes('i') || String(valStr).includes('e')) {
      return String(valStr);
    }
    const parts = String(valStr).split('.');
    const integerPart = parts[0];
    const decimalPart = parts[1];
    const formattedInt = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return decimalPart !== undefined ? `${formattedInt}.${decimalPart}` : formattedInt;
  }

  addHistory(expr, res) {
    const item = {
      id: Date.now(),
      expression: expr,
      result: res,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    this.history.unshift(item);
    if (this.history.length > 30) this.history.pop();
    localStorage.setItem('calc_history', JSON.stringify(this.history));
  }

  clearHistory() {
    this.history = [];
    localStorage.removeItem('calc_history');
  }
}

// Instantiate engine and provide backward-compatible facades
const engineInstance = new ScientificCalculatorEngine();
window.scientificEngine = engineInstance;
window.calculatorEngine = engineInstance; // Facade for app.js

window.Fraction = Fraction;
window.Complex = Complex;
window.StatisticsSuite = StatisticsSuite;
window.EquationSolver = EquationSolver;
window.MatrixEngine = MatrixEngine;
window.BaseNEngine = BaseNEngine;
