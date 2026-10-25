# Apple iOS 26 Liquid Glass 3D Scientific Calculator 🫧📐🔬

An ultra-refined, futuristic 3D scientific calculator engineered with **Apple iOS 26 Liquid Glass Glassmorphism**, interactive **GSAP 3 physics**, tactile acoustic feedback, and dynamic 3D spatial perspective.

---

## 🌟 Visual & Hardware Simulation Highlights

### 1. Dual-Power Solar & Battery Simulation
- **Photovoltaic Solar Cell Strip**: Realistic 4-cell silicon photovoltaic panel mounted at the top of the glass chassis with specular glint that dynamically tracks your 3D spatial tilt.
- **Power Management Indicator**: Real-time solar charging status pill and high-charge lithium battery monitor.

### 2. Multi-Line Natural Textbook Display
- **Top Status Tier**: Dynamic badges for active angle mode (`DEG` / `RAD` / `GRAD`), shift modifiers (`2ND`, `HYP`), memory indicator (`M`), and current calculation engine (`COMP`, `BASE-N`, `STAT`, `EQN`, `MATRIX`).
- **Expression Buffer**: Shows natural multi-step mathematical expressions with parentheses, fractions, roots, and functions.
- **Dynamic Result Scaling**: Smart font sizing automatically adapts to avoid overflow on large numbers and complex results.
- **Click-to-Copy**: Tap the OLED glass display anytime to copy the result with a floating neon HUD toast.

### 3. Apple iOS 26 Liquid Glass & 3D Spatial Rig
- **Multi-layered optical glass**: Multi-stop frosted backdrop blur (`blur(48px) saturate(200%)`), specular prismatic edge borders, and deep ambient reflections.
- **Interactive 3D Parallax Tilt**: Gyroscope / pointer tracking with damped GSAP physics.
- **Fluid Ambient Caustics**: Interactive HTML5 Canvas fluid simulation reacting to cursor coordinates.
- **Tactile Web Audio Synthesizer**: Pure Web Audio synthesis delivering soft glass taps, crystalline operator clinks, and resonant chord chimes.

---

## 🧮 Mathematical & Scientific Capabilities

### 1. Core Functions & Capabilities
- **Basic Arithmetic**: Addition ($+$), subtraction ($-$), multiplication ($\times$), division ($\div$).
- **Exponents & Roots**: Squares ($x^2$), cubes ($x^3$), general powers ($x^y$), square roots ($\sqrt{x}$), higher-order roots ($\sqrt[n]{x}$), cube roots ($\sqrt[3]{x}$), reciprocals ($1/x$).
- **Trigonometry & Hyperbolics**: $\sin, \cos, \tan$, inverses ($\sin^{-1}, \cos^{-1}, \tan^{-1}$), hyperbolic functions ($\sinh, \cosh, \tanh, \text{asinh}, \text{acosh}, \text{atanh}$), and quick angle toggling between **DEG**, **RAD**, and **GRAD**.
- **Logarithms & Powers**: Common logarithm ($\log_{10}$), natural logarithm ($\ln$), $10^x$, and $e^x$.
- **Scientific Notation (EXP / $\times 10^x$)**: Dedicated input button for very large or small numbers.
- **Constants**: Direct keys for $\pi$ ($3.14159...$) and Euler's number $e$ ($2.71828...$).
- **Fractions & Percentages (S⇔D)**: Convert between exact common fractions, mixed numbers, and decimal representations.
- **Parentheses & Hierarchy**: Full grouping with `(` and `)` adhering to strict PEMDAS precedence with implicit multiplication support ($2\pi$, $3(4+5)$).

### 2. Advanced Suites & Solvers (Modular Glass Sheets)
- **Base-N Converter & Bitwise Logic**: Real-time conversions across Decimal, Hexadecimal, Binary, and Octal with bitwise `AND`, `OR`, `XOR`, `NOT`, `SHL`, and `SHR`.
- **Equation Solvers**:
  - Linear equations: $ax + b = 0$
  - Quadratic equations: $ax^2 + bx + c = 0$ (calculates real and complex imaginary roots $a \pm bi$)
  - 2×2 Simultaneous Linear Systems (Cramer's rule)
- **Matrices & Vectors**:
  - $2 \times 2$ and $3 \times 3$ Matrix Determinants, Transpose, Inversion, Addition, and Multiplication.
  - 3D Vector operations: Dot product ($u \cdot v$), Cross product ($u \times v$), and Magnitude ($|u|$).
- **Statistical Analysis & Linear Regression**:
  - 1-Variable dataset analysis: count $n$, sum $\sum x$, mean $\bar{x}$, variance $s^2$, sample std dev $s$, population std dev $\sigma$, min, max, and median.
  - 2-Variable Linear Regression: slope $m$, y-intercept $b$, Pearson correlation $r$, and coefficient of determination $r^2$.
- **Memory Registers**:
  - Full variable storage for registers $M$, $Ans$, $A$, $B$, $C$, $D$, $X$, and $Y$ with dedicated Recall and Store triggers.

---

## ⌨️ Keyboard Shortcuts

| Key | Action |
| :--- | :--- |
| `0` - `9` | Input Numbers / Digits |
| `.` | Decimal Point |
| `+`, `-`, `*`, `/` | Standard Operators |
| `(` and `)` | Parentheses Grouping |
| `Enter` or `=` | Calculate Result |
| `Backspace` | Delete last character / digit |
| `Escape` | Clear All (AC) / Close active modal sheet |
| `%` | Percentage |
| `s` / `c` | Sine / Cosine |

---

## 🚀 How to Run Locally

Double-click `index.html` or run:

```bash
open index.html
```

Or start a local development server:

```bash
python3 -m http.server 3000
# Open http://localhost:3000
```
