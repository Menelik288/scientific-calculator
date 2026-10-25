/**
 * Main Controller & Event Wiring for Apple iOS 26 Liquid Glass 3D Scientific Calculator
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize subsystems
  const bg = new LiquidBackground('liquid-canvas');
  const motion = new MotionController();
  const engine = window.scientificEngine || window.calculatorEngine;
  const audio = window.soundEngine;

  // Primary UI Elements
  const displayVal = document.querySelector('.display-value');
  const displayExpr = document.querySelector('.display-expression');
  const calcDisplay = document.querySelector('.calc-display');
  const scene = document.querySelector('.scene-3d');
  const clearBtn = document.getElementById('btn-clear');
  const degRadBtn = document.getElementById('btn-deg-rad');
  const displayModeBadge = document.getElementById('display-mode');
  const flag2nd = document.getElementById('flag-2nd');
  const flagHyp = document.getElementById('flag-hyp');
  const flagMem = document.getElementById('flag-mem');
  const historyDrawer = document.querySelector('.history-drawer');
  const historyList = document.querySelector('.history-list');
  const themePicker = document.querySelector('.theme-picker-modal');
  const modePicker = document.querySelector('.mode-picker-modal');

  // Control Buttons
  const toggleSciBtn = document.getElementById('btn-toggle-sci');
  const toggleHistoryBtn = document.getElementById('btn-history');
  const closeHistoryBtn = document.getElementById('btn-close-history');
  const clearHistoryBtn = document.getElementById('btn-clear-history');
  const toggleSoundBtn = document.getElementById('btn-sound');
  const toggleTiltBtn = document.getElementById('btn-tilt');
  const toggleThemeBtn = document.getElementById('btn-theme');
  const btnModeMenu = document.getElementById('btn-mode-menu');
  const activeModeLabel = document.getElementById('active-mode-label');
  const btn2nd = document.getElementById('btn-2nd');
  const btnHyp = document.getElementById('btn-hyp');

  let isScientific = true; // Scientific by default
  let isHistoryOpen = false;

  // Restore saved theme
  const savedTheme = localStorage.getItem('calc_theme') || 'nebula';
  applyTheme(savedTheme);

  // Restore saved sound state
  updateSoundUI();

  // Function to adapt font size to prevent overflow
  function adjustFontSize(text) {
    if (!displayVal) return;
    const len = String(text).length;
    if (len > 14) {
      displayVal.style.fontSize = '24px';
    } else if (len > 11) {
      displayVal.style.fontSize = '28px';
    } else if (len > 8) {
      displayVal.style.fontSize = '34px';
    } else {
      displayVal.style.fontSize = '42px';
    }
  }

  // Update UI Display
  function updateDisplay(animate = false) {
    const formatted = engine.formatDisplayValue(engine.currentValue);
    displayVal.textContent = formatted;
    displayExpr.textContent = engine.expression;
    adjustFontSize(formatted);

    // Dynamic AC / C text
    if (clearBtn) {
      clearBtn.textContent = (engine.currentValue !== '0' || engine.previousValue !== null) ? 'C' : 'AC';
    }

    // Angle unit indicator
    if (degRadBtn) {
      degRadBtn.textContent = engine.angleMode;
    }

    // Active Mode indicator
    if (displayModeBadge) {
      displayModeBadge.textContent = engine.mode;
    }
    if (activeModeLabel) {
      activeModeLabel.textContent = engine.mode;
    }

    // Status flags
    if (flag2nd) flag2nd.classList.toggle('active', engine.isSecond);
    if (flagHyp) flagHyp.classList.toggle('active', engine.isHyp);
    if (flagMem) flagMem.classList.toggle('active', (engine.memory.M !== 0));

    // Active operator button highlights
    document.querySelectorAll('.key-btn.btn-operator').forEach((btn) => {
      if (btn.dataset.action === engine.operation && engine.shouldResetScreen) {
        btn.classList.add('active-op');
      } else {
        btn.classList.remove('active-op');
      }
    });

    if (animate) {
      motion.animateDisplayUpdate();
    }
  }

  // Handle Button Clicks
  document.querySelectorAll('.key-btn').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      motion.animateButtonPress(btn, e);
      bg.pulseRipple(e.clientX, e.clientY);

      const num = btn.dataset.num;
      const action = btn.dataset.action;
      const sci = btn.dataset.sci;
      const hex = btn.dataset.hex;

      if (num !== undefined) {
        audio.playDigit();
        engine.appendNumber(num);
        updateDisplay(true);
      } else if (action !== undefined) {
        handleAction(action);
      } else if (sci !== undefined) {
        handleScientific(sci, btn);
      } else if (hex !== undefined) {
        audio.playDigit();
        engine.appendNumber(hex);
        updateDisplay(true);
        updateBaseConversions();
      }
    });
  });

  function handleAction(action) {
    switch (action) {
      case 'clear':
        audio.playClear();
        engine.clearAll();
        updateDisplay(true);
        break;
      case 'toggle-sign':
        audio.playOperator();
        engine.toggleSign();
        updateDisplay();
        break;
      case 'percent':
        audio.playOperator();
        engine.percent();
        updateDisplay(true);
        break;
      case 'decimal':
        audio.playDigit();
        engine.appendDecimal();
        updateDisplay();
        break;
      case 'backspace':
        audio.playDigit();
        engine.backspace();
        updateDisplay();
        break;
      case '+':
      case '-':
      case '*':
      case '/':
      case '^':
        audio.playOperator();
        engine.chooseOperation(action);
        updateDisplay();
        break;
      case 'equals':
        if (engine.currentValue === 'Error') {
          audio.playError();
          motion.animateError();
        } else {
          audio.playEquals();
          engine.compute(true);
          updateDisplay(true);
          if (engine.currentValue === 'Error') {
            audio.playError();
            motion.animateError();
          }
        }
        break;
    }
  }

  function handleScientific(sci, btn) {
    if (sci === '2nd') {
      audio.playDigit();
      engine.isSecond = !engine.isSecond;
      if (btn2nd) btn2nd.classList.toggle('active', engine.isSecond);
      updateSecondLabels();
      updateDisplay();
      return;
    }

    if (sci === 'hyp') {
      audio.playDigit();
      engine.isHyp = !engine.isHyp;
      if (btnHyp) btnHyp.classList.toggle('active', engine.isHyp);
      updateDisplay();
      return;
    }

    if (sci === '(' || sci === ')') {
      audio.playOperator();
      if (engine.shouldResetScreen) {
        engine.currentValue = sci;
        engine.shouldResetScreen = false;
      } else {
        if (engine.currentValue === '0' && sci === '(') {
          engine.currentValue = '(';
        } else {
          engine.currentValue += sci;
        }
      }
      updateDisplay();
      return;
    }

    if (sci === 'exp') {
      audio.playOperator();
      engine.appendExp();
      updateDisplay();
      return;
    }

    if (sci === 'nroot') {
      audio.playOperator();
      engine.chooseOperation('nroot');
      updateDisplay();
      return;
    }

    // Secondary actions mapping when 2nd is active
    let effectiveOp = sci;
    if (engine.isSecond && btn && btn.dataset.second) {
      effectiveOp = btn.dataset.second;
    }

    audio.playOperator();
    engine.scientificOp(effectiveOp);
    updateDisplay(true);

    if (engine.currentValue === 'Error') {
      audio.playError();
      motion.animateError();
    }
  }

  // Update button labels when 2nd is toggled
  function updateSecondLabels() {
    document.querySelectorAll('.key-btn[data-second]').forEach((btn) => {
      const baseLabel = btn.dataset.sci;
      const secondLabel = btn.dataset.second;
      if (engine.isSecond) {
        if (secondLabel === 'asin') btn.textContent = 'sin⁻¹';
        else if (secondLabel === 'acos') btn.textContent = 'cos⁻¹';
        else if (secondLabel === 'atan') btn.textContent = 'tan⁻¹';
        else if (secondLabel === 'exp10') btn.textContent = '10ˣ';
        else if (secondLabel === 'expe') btn.textContent = 'eˣ';
        else if (secondLabel === 'cube') btn.textContent = 'x³';
        else if (secondLabel === 'cbrt') btn.textContent = '∛x';
        else btn.textContent = secondLabel;
      } else {
        if (baseLabel === 'sin') btn.textContent = 'sin';
        else if (baseLabel === 'cos') btn.textContent = 'cos';
        else if (baseLabel === 'tan') btn.textContent = 'tan';
        else if (baseLabel === 'log') btn.textContent = 'log';
        else if (baseLabel === 'ln') btn.textContent = 'ln';
        else if (baseLabel === 'sqr') btn.textContent = 'x²';
        else if (baseLabel === 'sqrt') btn.textContent = '√x';
        else btn.textContent = baseLabel;
      }
    });
  }

  // Cycle angle mode directly on DEG button tap
  if (degRadBtn) {
    degRadBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playDigit();
      engine.cycleAngleMode();
      updateDisplay();
    });
  }

  // Copy Display Value to Clipboard
  if (calcDisplay) {
    calcDisplay.addEventListener('click', async () => {
      const textToCopy = engine.currentValue;
      if (textToCopy === 'Error') return;

      try {
        await navigator.clipboard.writeText(textToCopy);
        audio.playDigit();
        motion.showCopiedToast();
      } catch (err) {
        const temp = document.createElement('textarea');
        temp.value = textToCopy;
        document.body.appendChild(temp);
        temp.select();
        document.execCommand('copy');
        document.body.removeChild(temp);
        audio.playDigit();
        motion.showCopiedToast();
      }
    });
  }

  // Toggle Scientific Mode Drawer
  if (toggleSciBtn) {
    toggleSciBtn.addEventListener('click', () => {
      audio.playDigit();
      isScientific = !isScientific;
      scene.classList.toggle('scientific-mode', isScientific);
      toggleSciBtn.classList.toggle('active', isScientific);
      motion.animateScientificToggle(isScientific);
    });
  }

  // Sound Toggle
  if (toggleSoundBtn) {
    toggleSoundBtn.addEventListener('click', () => {
      const muted = audio.toggleMute();
      updateSoundUI(muted);
    });
  }

  function updateSoundUI() {
    const muted = audio.isMuted();
    if (toggleSoundBtn) {
      toggleSoundBtn.classList.toggle('active', !muted);
      toggleSoundBtn.title = muted ? 'Unmute Audio' : 'Mute Audio';
      toggleSoundBtn.innerHTML = muted ? `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M11 5L6 9H2v6h4l5 4V5z"/>
          <line x1="23" y1="9" x2="17" y2="15"/>
          <line x1="17" y1="9" x2="23" y2="15"/>
        </svg>
      ` : `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
        </svg>
      `;
    }
  }

  // 3D Tilt Toggle
  if (toggleTiltBtn) {
    toggleTiltBtn.addEventListener('click', () => {
      audio.playDigit();
      const enabled = motion.toggleTilt();
      toggleTiltBtn.classList.toggle('active', enabled);
      toggleTiltBtn.title = enabled ? '3D Tilt Active' : '3D Tilt Disabled';
    });
  }

  // Theme Picker Popover Toggle
  if (toggleThemeBtn && themePicker) {
    toggleThemeBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playDigit();
      if (modePicker) modePicker.classList.remove('visible');
      themePicker.classList.toggle('visible');
    });

    document.querySelectorAll('.theme-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const theme = opt.dataset.theme;
        applyTheme(theme);
        audio.playDigit();
        themePicker.classList.remove('visible');
      });
    });
  }

  function applyTheme(theme) {
    document.body.setAttribute('data-theme', theme);
    localStorage.setItem('calc_theme', theme);
    bg.setTheme(theme);

    document.querySelectorAll('.theme-option').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.theme === theme);
    });
  }

  // Mode Menu Popover Toggle
  if (btnModeMenu && modePicker) {
    btnModeMenu.addEventListener('click', (e) => {
      e.stopPropagation();
      audio.playDigit();
      if (themePicker) themePicker.classList.remove('visible');
      modePicker.classList.toggle('visible');
    });

    document.querySelectorAll('.mode-option').forEach((opt) => {
      opt.addEventListener('click', () => {
        const mode = opt.dataset.mode;
        selectMode(mode);
        audio.playDigit();
        modePicker.classList.remove('visible');
      });
    });
  }

  // Quick Mode Switcher Bar Clicks
  document.querySelectorAll('.quick-mode-tab').forEach((tab) => {
    tab.addEventListener('click', () => {
      const mode = tab.dataset.mode;
      selectMode(mode);
      audio.playDigit();
    });
  });

  // Close modals on outside click
  document.addEventListener('click', (e) => {
    if (themePicker && themePicker.classList.contains('visible') && !themePicker.contains(e.target) && e.target !== toggleThemeBtn) {
      themePicker.classList.remove('visible');
    }
    if (modePicker && modePicker.classList.contains('visible') && !modePicker.contains(e.target) && !btnModeMenu.contains(e.target)) {
      modePicker.classList.remove('visible');
    }
  });

  // Switch Calculator Modes & Open Corresponding Sheets
  function selectMode(mode) {
    engine.mode = mode;
    closeAllSheets();

    document.querySelectorAll('.mode-option').forEach((opt) => {
      opt.classList.toggle('active', opt.dataset.mode === mode);
    });

    document.querySelectorAll('.quick-mode-tab').forEach((tab) => {
      tab.classList.toggle('active', tab.dataset.mode === mode);
    });

    if (mode === 'COMP') {
      updateDisplay();
    } else if (mode === 'BASE') {
      openSheet('sheet-base');
      updateBaseConversions();
    } else if (mode === 'EQN') {
      openSheet('sheet-eqn');
    } else if (mode === 'MATRIX') {
      openSheet('sheet-matrix');
    } else if (mode === 'STAT') {
      openSheet('sheet-stat');
    } else if (mode === 'MEM') {
      openSheet('sheet-mem');
      renderMemoryValues();
    }
    updateDisplay();
  }

  function openSheet(sheetId) {
    closeAllSheets();
    const sheet = document.getElementById(sheetId);
    if (sheet) {
      sheet.classList.add('open');
      audio.playClear();
    }
  }

  function closeAllSheets() {
    document.querySelectorAll('.glass-sheet').forEach(s => s.classList.remove('open'));
  }

  // Close Sheet Buttons
  document.querySelectorAll('.btn-close-sheet').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playDigit();
      closeAllSheets();
      engine.mode = 'COMP';
      updateDisplay();
    });
  });

  // Tab switching in sheets
  document.querySelectorAll('.sheet-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      audio.playDigit();
      const parent = tab.closest('.glass-sheet');
      if (!parent) return;

      parent.querySelectorAll('.sheet-tab').forEach(t => t.classList.remove('active'));
      parent.querySelectorAll('.tab-pane').forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const paneId = `pane-${tab.dataset.tab}`;
      const pane = document.getElementById(paneId);
      if (pane) pane.classList.add('active');
    });
  });

  // ==========================================
  // 1. BASE-N ENGINE CONTROLLER
  // ==========================================
  const valDec = document.getElementById('val-dec');
  const valHex = document.getElementById('val-hex');
  const valBin = document.getElementById('val-bin');
  const valOct = document.getElementById('val-oct');

  function updateBaseConversions() {
    const res = BaseNEngine.convert(engine.currentValue, engine.baseMode);
    if (valDec) valDec.textContent = res.dec;
    if (valHex) valHex.textContent = res.hex;
    if (valBin) valBin.textContent = res.bin;
    if (valOct) valOct.textContent = res.oct;
  }

  document.querySelectorAll('.base-row').forEach(row => {
    row.addEventListener('click', () => {
      audio.playDigit();
      document.querySelectorAll('.base-row').forEach(r => r.classList.remove('active'));
      row.classList.add('active');
      engine.baseMode = parseInt(row.dataset.base, 10);
      updateBaseConversions();
    });
  });

  document.querySelectorAll('.btn-bitwise').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playOperator();
      const op = btn.dataset.op;
      const val = parseInt(engine.currentValue, engine.baseMode);
      if (op === 'NOT') {
        const res = (~val) >>> 0;
        engine.currentValue = res.toString(engine.baseMode);
      } else {
        engine.chooseOperation(op);
      }
      updateDisplay();
      updateBaseConversions();
    });
  });

  // ==========================================
  // 2. EQUATION SOLVER CONTROLLER
  // ==========================================
  const btnSolveQuad = document.getElementById('btn-solve-quad');
  const btnSolveLin = document.getElementById('btn-solve-lin');
  const btnSolveSys = document.getElementById('btn-solve-sys');

  if (btnSolveQuad) {
    btnSolveQuad.addEventListener('click', () => {
      audio.playEquals();
      const a = parseFloat(document.getElementById('quad-a').value) || 0;
      const b = parseFloat(document.getElementById('quad-b').value) || 0;
      const c = parseFloat(document.getElementById('quad-c').value) || 0;
      const res = EquationSolver.solveQuadratic(a, b, c);
      document.getElementById('res-quad').textContent = res;
    });
  }

  if (btnSolveLin) {
    btnSolveLin.addEventListener('click', () => {
      audio.playEquals();
      const a = parseFloat(document.getElementById('lin-a').value) || 0;
      const b = parseFloat(document.getElementById('lin-b').value) || 0;
      const res = EquationSolver.solveLinear(a, b);
      document.getElementById('res-lin').textContent = res;
    });
  }

  if (btnSolveSys) {
    btnSolveSys.addEventListener('click', () => {
      audio.playEquals();
      const a1 = parseFloat(document.getElementById('sys-a1').value) || 0;
      const b1 = parseFloat(document.getElementById('sys-b1').value) || 0;
      const c1 = parseFloat(document.getElementById('sys-c1').value) || 0;
      const a2 = parseFloat(document.getElementById('sys-a2').value) || 0;
      const b2 = parseFloat(document.getElementById('sys-b2').value) || 0;
      const c2 = parseFloat(document.getElementById('sys-c2').value) || 0;
      const res = EquationSolver.solve2x2(a1, b1, c1, a2, b2, c2);
      document.getElementById('res-sys').textContent = res;
    });
  }

  // ==========================================
  // 3. MATRIX & VECTOR CONTROLLER
  // ==========================================
  const btnMatDet2 = document.getElementById('btn-mat-det2');
  const btnMatInv2 = document.getElementById('btn-mat-inv2');
  const btnMatTrans2 = document.getElementById('btn-mat-trans2');

  function getMat2x2() {
    return [
      [parseFloat(document.getElementById('m2-00').value) || 0, parseFloat(document.getElementById('m2-01').value) || 0],
      [parseFloat(document.getElementById('m2-10').value) || 0, parseFloat(document.getElementById('m2-11').value) || 0]
    ];
  }

  if (btnMatDet2) {
    btnMatDet2.addEventListener('click', () => {
      audio.playEquals();
      const det = MatrixEngine.det2x2(getMat2x2());
      document.getElementById('res-mat-2x2').textContent = `det(A) = ${det}`;
    });
  }

  if (btnMatInv2) {
    btnMatInv2.addEventListener('click', () => {
      audio.playEquals();
      try {
        const inv = MatrixEngine.inverse2x2(getMat2x2());
        document.getElementById('res-mat-2x2').textContent = `A⁻¹ =\n[ ${inv[0][0]}, ${inv[0][1]} ]\n[ ${inv[1][0]}, ${inv[1][1]} ]`;
      } catch(e) {
        document.getElementById('res-mat-2x2').textContent = e.message;
      }
    });
  }

  if (btnMatTrans2) {
    btnMatTrans2.addEventListener('click', () => {
      audio.playEquals();
      const tr = MatrixEngine.transpose(getMat2x2());
      document.getElementById('res-mat-2x2').textContent = `Aᵀ =\n[ ${tr[0][0]}, ${tr[0][1]} ]\n[ ${tr[1][0]}, ${tr[1][1]} ]`;
    });
  }

  const btnMatDet3 = document.getElementById('btn-mat-det3');
  const btnMatTrans3 = document.getElementById('btn-mat-trans3');

  function getMat3x3() {
    return [
      [parseFloat(document.getElementById('m3-00').value) || 0, parseFloat(document.getElementById('m3-01').value) || 0, parseFloat(document.getElementById('m3-02').value) || 0],
      [parseFloat(document.getElementById('m3-10').value) || 0, parseFloat(document.getElementById('m3-11').value) || 0, parseFloat(document.getElementById('m3-12').value) || 0],
      [parseFloat(document.getElementById('m3-20').value) || 0, parseFloat(document.getElementById('m3-21').value) || 0, parseFloat(document.getElementById('m3-22').value) || 0]
    ];
  }

  if (btnMatDet3) {
    btnMatDet3.addEventListener('click', () => {
      audio.playEquals();
      const det = MatrixEngine.det3x3(getMat3x3());
      document.getElementById('res-mat-3x3').textContent = `det(A) = ${det}`;
    });
  }

  if (btnMatTrans3) {
    btnMatTrans3.addEventListener('click', () => {
      audio.playEquals();
      const tr = MatrixEngine.transpose(getMat3x3());
      document.getElementById('res-mat-3x3').textContent = `Aᵀ =\n[ ${tr[0].join(', ')} ]\n[ ${tr[1].join(', ')} ]\n[ ${tr[2].join(', ')} ]`;
    });
  }

  // Vector Ops
  const btnVecDot = document.getElementById('btn-vec-dot');
  const btnVecCross = document.getElementById('btn-vec-cross');
  const btnVecMag = document.getElementById('btn-vec-mag');

  function getVectors() {
    const u = [
      parseFloat(document.getElementById('vec-u0').value) || 0,
      parseFloat(document.getElementById('vec-u1').value) || 0,
      parseFloat(document.getElementById('vec-u2').value) || 0
    ];
    const v = [
      parseFloat(document.getElementById('vec-v0').value) || 0,
      parseFloat(document.getElementById('vec-v1').value) || 0,
      parseFloat(document.getElementById('vec-v2').value) || 0
    ];
    return { u, v };
  }

  if (btnVecDot) {
    btnVecDot.addEventListener('click', () => {
      audio.playEquals();
      const { u, v } = getVectors();
      const dot = MatrixEngine.dot(u, v);
      document.getElementById('res-vec').textContent = `u · v = ${dot}`;
    });
  }

  if (btnVecCross) {
    btnVecCross.addEventListener('click', () => {
      audio.playEquals();
      const { u, v } = getVectors();
      const cross = MatrixEngine.cross(u, v);
      document.getElementById('res-vec').textContent = `u × v = [ ${cross.join(', ')} ]`;
    });
  }

  if (btnVecMag) {
    btnVecMag.addEventListener('click', () => {
      audio.playEquals();
      const { u } = getVectors();
      const mag = MatrixEngine.magnitude(u);
      document.getElementById('res-vec').textContent = `|u| = ${mag.toFixed(6)}`;
    });
  }

  // ==========================================
  // 4. STATISTICS & REGRESSION CONTROLLER
  // ==========================================
  const btnCalcStat1 = document.getElementById('btn-calc-stat1');
  const btnCalcStat2 = document.getElementById('btn-calc-stat2');

  if (btnCalcStat1) {
    btnCalcStat1.addEventListener('click', () => {
      audio.playEquals();
      const text = document.getElementById('stat-data-1').value;
      const nums = text.split(/[\s,]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
      try {
        const stats = StatisticsSuite.analyze(nums);
        document.getElementById('st-n').textContent = stats.n;
        document.getElementById('st-mean').textContent = stats.mean;
        document.getElementById('st-sum').textContent = stats.sum;
        document.getElementById('st-sd-s').textContent = stats.stdSample;
        document.getElementById('st-sd-p').textContent = stats.stdPop;
        document.getElementById('st-med').textContent = stats.median;
        document.getElementById('st-min').textContent = stats.min;
        document.getElementById('st-max').textContent = stats.max;
      } catch(e) {
        alert(e.message);
      }
    });
  }

  if (btnCalcStat2) {
    btnCalcStat2.addEventListener('click', () => {
      audio.playEquals();
      const textX = document.getElementById('stat-data-x').value;
      const textY = document.getElementById('stat-data-y').value;
      const xs = textX.split(/[\s,]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
      const ys = textY.split(/[\s,]+/).map(s => parseFloat(s)).filter(n => !isNaN(n));
      try {
        const reg = StatisticsSuite.linearRegression(xs, ys);
        document.getElementById('res-stat2').innerHTML = `
          <strong>Equation:</strong> ${reg.equation}<br>
          <strong>Pearson r:</strong> ${reg.r}<br>
          <strong>r²:</strong> ${reg.r2}
        `;
      } catch(e) {
        document.getElementById('res-stat2').textContent = e.message;
      }
    });
  }

  // ==========================================
  // 5. MEMORY REGISTERS CONTROLLER
  // ==========================================
  function renderMemoryValues() {
    ['M', 'Ans', 'A', 'B', 'C', 'D', 'X', 'Y'].forEach(reg => {
      const el = document.getElementById(`mem-val-${reg}`);
      if (el) el.textContent = engine.memory[reg] !== undefined ? engine.memory[reg] : '0';
    });
  }

  document.querySelectorAll('.btn-mem-recall').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playDigit();
      const reg = btn.dataset.reg;
      engine.memoryRecall(reg);
      updateDisplay(true);
      closeAllSheets();
      engine.mode = 'COMP';
    });
  });

  document.querySelectorAll('.btn-mem-store').forEach(btn => {
    btn.addEventListener('click', () => {
      audio.playOperator();
      const reg = btn.dataset.reg;
      engine.memoryStore(reg);
      renderMemoryValues();
      updateDisplay();
    });
  });

  const btnClearAllMem = document.getElementById('btn-clear-all-mem');
  if (btnClearAllMem) {
    btnClearAllMem.addEventListener('click', () => {
      audio.playClear();
      ['M', 'A', 'B', 'C', 'D', 'X', 'Y'].forEach(reg => engine.memory[reg] = 0);
      renderMemoryValues();
      updateDisplay();
    });
  }

  // ==========================================
  // HISTORY DRAWER HANDLING
  // ==========================================
  function renderHistory() {
    if (!historyList) return;
    historyList.innerHTML = '';

    if (engine.history.length === 0) {
      historyList.innerHTML = `
        <div class="history-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="opacity: 0.4;">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 14 14"/>
          </svg>
          <span>No calculations yet</span>
        </div>
      `;
      return;
    }

    engine.history.forEach((item) => {
      const card = document.createElement('div');
      card.className = 'history-item';
      card.innerHTML = `
        <div class="hist-expr">${item.expression}</div>
        <div class="hist-res">${item.result}</div>
      `;

      card.addEventListener('click', () => {
        audio.playDigit();
        engine.currentValue = item.result;
        engine.shouldResetScreen = true;
        updateDisplay(true);
        toggleHistory(false);
      });

      historyList.appendChild(card);
    });
  }

  function toggleHistory(open) {
    isHistoryOpen = open !== undefined ? open : !isHistoryOpen;
    if (isHistoryOpen) {
      renderHistory();
      motion.animateHistoryDrawer(true);
    } else {
      motion.animateHistoryDrawer(false);
    }
  }

  if (toggleHistoryBtn) {
    toggleHistoryBtn.addEventListener('click', () => {
      audio.playDigit();
      toggleHistory(true);
    });
  }

  if (closeHistoryBtn) {
    closeHistoryBtn.addEventListener('click', () => {
      audio.playDigit();
      toggleHistory(false);
    });
  }

  if (clearHistoryBtn) {
    clearHistoryBtn.addEventListener('click', () => {
      audio.playClear();
      engine.clearHistory();
      renderHistory();
    });
  }

  // ==========================================
  // KEYBOARD SUPPORT
  // ==========================================
  window.addEventListener('keydown', (e) => {
    // If user is typing in an input field inside a sheet, ignore global hotkeys
    if (['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
      return;
    }

    if (['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'].includes(e.key)) {
      const btn = document.querySelector(`.key-btn[data-num="${e.key}"]`);
      if (btn) btn.click();
    } else if (e.key === '.') {
      const btn = document.querySelector(`.key-btn[data-action="decimal"]`);
      if (btn) btn.click();
    } else if (e.key === '+' || e.key === '-' || e.key === '*' || e.key === '/') {
      const btn = document.querySelector(`.key-btn[data-action="${e.key}"]`);
      if (btn) btn.click();
    } else if (e.key === '(' || e.key === ')') {
      const btn = document.querySelector(`.key-btn[data-sci="${e.key}"]`);
      if (btn) btn.click();
    } else if (e.key === 'Enter' || e.key === '=') {
      e.preventDefault();
      const btn = document.querySelector(`.key-btn[data-action="equals"]`);
      if (btn) btn.click();
    } else if (e.key === 'Backspace') {
      const btn = document.querySelector(`.key-btn[data-action="backspace"]`);
      if (btn) btn.click();
      else handleAction('backspace');
    } else if (e.key === 'Escape') {
      if (isHistoryOpen) {
        toggleHistory(false);
      } else {
        closeAllSheets();
        const btn = document.getElementById('btn-clear');
        if (btn) btn.click();
      }
    } else if (e.key === '%') {
      const btn = document.querySelector(`.key-btn[data-action="percent"]`);
      if (btn) btn.click();
    } else if (e.key === 's' || e.key === 'S') {
      if (isScientific) {
        const btn = document.querySelector('[data-sci="sin"]');
        if (btn) btn.click();
      }
    } else if (e.key === 'c' || e.key === 'C') {
      if (isScientific && !e.metaKey && !e.ctrlKey) {
        const btn = document.querySelector('[data-sci="cos"]');
        if (btn) btn.click();
      }
    }
  });

  // Initial draw
  updateDisplay(false);
});
