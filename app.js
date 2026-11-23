const DERIV_APP_ID = "34ZfveN7Be9dqW8mOCJAe";
const AFFILIATE_TOKEN = "3A2CFHPG722B";

const DEFAULT_MINUTE_TIMEFRAMES = ['1', '2', '3', '5', '10', '15', '30'];
const DEFAULT_SHIFT_SECONDS = 8;
const MAX_RUNS_CAP = 6;

// Strictly synthetic indices only: Volatility, Volatility 1s, and Jump
const exhaustiveAssets = [
    { symbol: 'R_10',     name: 'Volatility 10',      market: 'volatility',    pip: 3, base: 6321.450, tv: 'FX:EURUSD', initialAdx: 26.8, initialWick: 0.18, evenPct: 56, smcZone: 'Bullish OB+FVG' },
    { symbol: 'R_25',     name: 'Volatility 25',      market: 'volatility',    pip: 3, base: 3120.100, tv: 'FX:GBPUSD', initialAdx: 24.9, initialWick: 0.21, evenPct: 44, smcZone: 'Bearish OB+FVG' },
    { symbol: 'R_50',     name: 'Volatility 50',      market: 'volatility',    pip: 3, base: 2450.750, tv: 'FX:USDJPY', initialAdx: 22.6, initialWick: 0.25, evenPct: 55, smcZone: 'Sweep + 50% CE' },
    { symbol: 'R_75',     name: 'Volatility 75',      market: 'volatility',    pip: 3, base: 8940.200, tv: 'FX:AUDUSD', initialAdx: 25.4, initialWick: 0.19, evenPct: 43, smcZone: 'Bearish Breaker' },
    { symbol: 'R_100',    name: 'Volatility 100',     market: 'volatility',    pip: 3, base: 4120.900, tv: 'FX:USDCAD', initialAdx: 21.8, initialWick: 0.27, evenPct: 54, smcZone: 'Bullish OB' },
    { symbol: '1HZ10V',   name: 'Volatility 10 (1s)', market: 'volatility_1s', pip: 2, base: 9452.18,  tv: 'FX:EURUSD', initialAdx: 27.3, initialWick: 0.17, evenPct: 44, smcZone: 'Bearish FVG' },
    { symbol: '1HZ25V',   name: 'Volatility 25 (1s)', market: 'volatility_1s', pip: 2, base: 5320.45,  tv: 'FX:GBPUSD', initialAdx: 23.7, initialWick: 0.23, evenPct: 56, smcZone: 'Bullish Sweep' },
    { symbol: '1HZ50V',   name: 'Volatility 50 (1s)', market: 'volatility_1s', pip: 2, base: 48912.34, tv: 'FX:USDJPY', initialAdx: 20.9, initialWick: 0.29, evenPct: 45, smcZone: 'Bearish Inducement' },
    { symbol: '1HZ75V',   name: 'Volatility 75 (1s)', market: 'volatility_1s', pip: 2, base: 12450.80, tv: 'FX:AUDUSD', initialAdx: 25.9, initialWick: 0.18, evenPct: 55, smcZone: 'Bullish FVG+OB' },
    { symbol: '1HZ100V',  name: 'Volatility 100 (1s)',market: 'volatility_1s', pip: 2, base: 1428.64,  tv: 'FX:USDCHF', initialAdx: 22.0, initialWick: 0.24, evenPct: 44, smcZone: 'Bearish OB' },
    { symbol: 'JD10',     name: 'Jump 10 Index',      market: 'jump',          pip: 2, base: 1240.50,  tv: 'FX:EURGBP', initialAdx: 24.6, initialWick: 0.20, evenPct: 55, smcZone: 'Bullish OB+CE' },
    { symbol: 'JD25',     name: 'Jump 25 Index',      market: 'jump',          pip: 2, base: 2150.80,  tv: 'FX:NZDUSD', initialAdx: 19.2, initialWick: 0.34, evenPct: 50, smcZone: 'Choppy Range' },
    { symbol: 'JD50',     name: 'Jump 50 Index',      market: 'jump',          pip: 2, base: 3420.10,  tv: 'FX:AUDJPY', initialAdx: 23.4, initialWick: 0.22, evenPct: 44, smcZone: 'Bearish FVG+CE' },
    { symbol: 'JD75',     name: 'Jump 75 Index',      market: 'jump',          pip: 2, base: 5120.40,  tv: 'FX:GBPJPY', initialAdx: 18.8, initialWick: 0.37, evenPct: 50, smcZone: 'High Wick Noise' },
    { symbol: 'JD100',    name: 'Jump 100 Index',     market: 'jump',          pip: 2, base: 8940.20,  tv: 'FX:EURUSD', initialAdx: 22.2, initialWick: 0.26, evenPct: 54, smcZone: 'Bullish BOS+OB' }
];

// Rise / Fall contracts only (CALL / PUT) with Time Hold (minutes) & Tick Hold (ticks)
const RISE_FALL_SETUPS = [
    { direction: 'rise', name: 'RISE (CALL)', shortName: 'CALL', api: 'CALL', ticks: 4, holdMinutes: 2, runs: 6, payoutMult: 0.92, boatId: 1, smcTag: 'Bullish OB + FVG' },
    { direction: 'fall', name: 'FALL (PUT)',  shortName: 'PUT',  api: 'PUT',  ticks: 4, holdMinutes: 2, runs: 6, payoutMult: 0.92, boatId: 2, smcTag: 'Bearish OB + FVG' }
];

let currentCategory = 'all';
let currentParityFilter = 'all';
let rotationCursor = 0;
let signalCycleCursor = 0;
let currentSymbol = exhaustiveAssets[0].symbol;
let activeCandleTf = '5';
let rotationIntervalSec = DEFAULT_SHIFT_SECONDS;
let shiftTimer = null;
let shiftCountdown = DEFAULT_SHIFT_SECONDS;
let cooldownUntil = 0;
let marketDataStore = {};
let activeAccountMode = 'demo';
let simulatedBalance = 1000.00;
let sessionNetPnl = 0;
let sessionWins = 0;
let sessionLosses = 0;
let consecutiveLosses = 0;
let lastExecutionTimestamp = 0;
let activeAutomationMode = null;

function getSelectedRunsTarget(defaultRuns = MAX_RUNS_CAP) {
    const val = parseInt(document.getElementById('runs-target-input')?.value, 10);
    if (!isNaN(val) && val >= 1 && val <= MAX_RUNS_CAP) return val;
    return defaultRuns;
}

function getSelectedHoldMode() {
    return document.getElementById('hold-mode-select')?.value || 'ticks';
}

function updateRunsTargetOverride() {
    const st = marketDataStore[currentSymbol];
    if (st) {
        st.runsTarget = getSelectedRunsTarget(MAX_RUNS_CAP);
        st.runsCompleted = 0;
        updateSignalUI(currentSymbol);
    }
}

function updateRotationIntervalFromInput() {
    const val = parseInt(document.getElementById('loss-cooldown-sec')?.value, 10);
    rotationIntervalSec = (!isNaN(val) && val >= 4 && val <= 30) ? val : DEFAULT_SHIFT_SECONDS;
    shiftCountdown = Math.min(shiftCountdown, rotationIntervalSec);
    const pill = document.getElementById('shift-countdown-pill');
    if (pill) pill.innerText = `${shiftCountdown}s`;
}

function computeIndicatorsFromHistory(prices, fallbackAdx = 25) {
    if (!prices || prices.length < 8) {
        return { adx: fallbackAdx, rsi: 56.0, emaBias: 'BULLISH', entryPoint: prices && prices.length ? prices[prices.length - 1] : 0 };
    }
    const recent = prices.slice(-25);
    let gains = 0;
    let losses = 0;
    for (let i = 1; i < recent.length; i++) {
        const diff = recent[i] - recent[i - 1];
        if (diff > 0) gains += diff;
        else if (diff < 0) losses += Math.abs(diff);
    }
    const rs = losses === 0 ? 10 : gains / losses;
    const rsi = Number((100 - (100 / (1 + rs))).toFixed(1));
    const trendStrength = Math.abs(rsi - 50);
    const adx = Number(Math.min(45, Math.max(16, 18 + trendStrength * 0.9)).toFixed(1));

    const k = 2 / (20 + 1);
    let ema = recent[0];
    for (let i = 1; i < recent.length; i++) {
        ema = recent[i] * k + ema * (1 - k);
    }
    const latest = recent[recent.length - 1];
    const emaBias = latest >= ema ? 'BULLISH' : 'BEARISH';
    const swingLow = Math.min(...recent.slice(-8));
    const swingHigh = Math.max(...recent.slice(-8));
    const entryPoint = emaBias === 'BULLISH'
        ? Number(((latest + swingLow) / 2).toFixed(4))
        : Number(((latest + swingHigh) / 2).toFixed(4));
    return { adx, rsi, emaBias, entryPoint };
}

function computeParityMetrics(st) {
    if (!st.recentDigits || st.recentDigits.length === 0) {
        const evenPct = st.seedEvenPct ?? 55;
        const oddPct = 100 - evenPct;
        return { evenPct, oddPct, dominantParity: evenPct >= oddPct ? 'even' : 'odd', dominantPct: Math.max(evenPct, oddPct) };
    }
    let evenCount = 0;
    for (let i = 0; i < st.recentDigits.length; i++) {
        if (st.recentDigits[i] % 2 === 0) evenCount++;
    }
    const evenPct = Math.round((evenCount / st.recentDigits.length) * 100);
    const oddPct = 100 - evenPct;
    const dominantParity = evenPct >= oddPct ? 'even' : 'odd';
    const dominantPct = Math.max(evenPct, oddPct);
    return { evenPct, oddPct, dominantParity, dominantPct };
}

exhaustiveAssets.forEach((a, idx) => {
    const tf = DEFAULT_MINUTE_TIMEFRAMES[idx % DEFAULT_MINUTE_TIMEFRAMES.length];
    const startDir = a.evenPct >= 50 ? 'rise' : 'fall';
    const strat = RISE_FALL_SETUPS.find(s => s.direction === startDir) || RISE_FALL_SETUPS[0];
    const firmDigit = startDir === 'rise' ? ((idx * 2) % 10) : (((idx * 2) + 1) % 10);
    const counts = new Array(10).fill(10);
    counts[firmDigit] = 6;
    const holdMin = Math.max(1, Math.min(5, parseInt(tf, 10) <= 5 ? 2 : 3));
    const tickHold = strat.ticks + (idx % 2);

    marketDataStore[a.symbol] = {
        name: a.name,
        market: a.market,
        pip: a.pip,
        price: a.base.toFixed(a.pip),
        entryPoint: a.base.toFixed(a.pip),
        priceHistory: [a.base],
        recentDigits: [],
        digitCounts: counts,
        seedEvenPct: a.evenPct,
        timeframe: tf,
        holdMinutes: holdMin,
        ticks: tickHold,
        runsTarget: MAX_RUNS_CAP,
        runsCompleted: 0,
        firmFeederDigit: firmDigit,
        feederPinned: true,
        strategy: { ...strat, ticks: tickHold, holdMinutes: holdMin },
        smcZone: a.smcZone,
        adx: a.initialAdx,
        rsi: startDir === 'rise' ? 58.4 : 41.6,
        emaBias: startDir === 'rise' ? 'BULLISH' : 'BEARISH',
        wickRatio: a.initialWick,
        lastTickDir: 'up'
    };
});

// Strict A+ SMC + Even/Odd Parity + Indicator gate for Rise / Fall contracts
function evaluateRiseFallAPlusAlignment(st) {
    const minAdx = parseFloat(document.getElementById('filter-min-adx')?.value) || 19;
    const maxWick = parseFloat(document.getElementById('filter-max-wick')?.value) || 0.45;
    const minParityPct = parseFloat(document.getElementById('filter-min-parity-pct')?.value) || 52;

    const parity = computeParityMetrics(st);
    const adxPass = st.adx >= minAdx;
    const wickPass = st.wickRatio <= maxWick;
    const parityPass = parity.dominantPct >= minParityPct;
    const dirMatchesTrend = st.strategy.direction === 'rise'
        ? (st.emaBias === 'BULLISH' && st.rsi >= 45)
        : (st.emaBias === 'BEARISH' && st.rsi <= 55);
    const smcPass = !/choppy|high wick noise/i.test(st.smcZone);

    const reasons = [];
    if (!smcPass) reasons.push(`SMC noise (${st.smcZone})`);
    if (!parityPass) reasons.push(`Parity ${parity.dominantPct}% < ${minParityPct}%`);
    if (!adxPass) reasons.push(`ADX ${st.adx} < ${minAdx}`);
    if (!wickPass) reasons.push(`Wick ${st.wickRatio} > ${maxWick}`);
    if (!dirMatchesTrend) reasons.push(`${st.strategy.shortName} vs ${st.emaBias}/RSI ${st.rsi}`);

    const isAPlus = smcPass && parityPass && adxPass && wickPass && dirMatchesTrend;
    const score = (st.adx - minAdx) + parity.dominantPct;

    return {
        isAPlus,
        parity,
        score,
        grade: isAPlus ? `A+ ${st.strategy.shortName}` : 'NULL',
        statusText: isAPlus
            ? `A+ ${st.smcZone} -> ${st.strategy.name} (${parity.dominantParity.toUpperCase()} ${parity.dominantPct}% • ADX ${st.adx})`
            : `NULL MARKET (${reasons.slice(0, 2).join(' | ')})`
    };
}

function refreshAllFilterStatuses() {
    updateSignalUI(currentSymbol);
    renderScanner();
}

function logTransaction(msg, isHighlight = false) {
    const logContainer = document.getElementById('live-transaction-log');
    if (!logContainer) return;
    if (logContainer.querySelector('.italic')) logContainer.innerHTML = '';

    const time = new Date().toLocaleTimeString();
    const row = document.createElement('div');
    row.className = isHighlight
        ? 'p-1.5 rounded bg-emerald-950/80 border border-fxgreen text-fxgreen font-bold'
        : 'p-1 rounded bg-slate-950 border border-slate-800/80 text-slate-300';
    row.innerText = `[${time}] ${msg}`;
    logContainer.prepend(row);
    if (logContainer.children.length > 25) logContainer.lastChild.remove();
}

function dismissSplash() {
    const s = document.getElementById('splash-screen');
    if (s) { s.style.opacity = '0'; setTimeout(() => s.style.display = 'none', 300); }
}

function authDeriv() {
    if (window.derivApiInstance) {
        window.derivApiInstance.startOAuthLogin(AFFILIATE_TOKEN);
    }
}

function openDerivCashier(action) {
    const cashierUrl = action === 'withdraw'
        ? 'https://app.deriv.com/account/cashier/withdrawal'
        : 'https://app.deriv.com/account/cashier/deposit';
    window.open(cashierUrl, '_blank');
}

async function handleAccountSelect(accountId) {
    if (window.derivApiInstance && accountId) {
        const ok = await window.derivApiInstance.connectAuthenticatedWebSocket(accountId);
        if (ok) {
            const acc = window.derivApiInstance.accounts.find(a => a.account === accountId);
            const mode = acc && !acc.isVirtual ? 'real' : 'demo';
            activeAccountMode = mode;
            document.getElementById('btn-demo').className = mode === 'demo' ? "px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
            document.getElementById('btn-real').className = mode === 'real' ? "px-3 py-1 rounded-lg font-bold bg-gold text-slate-950 transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
            document.getElementById('account-id-label').innerText = mode === 'real' ? 'Real Balance' : 'Demo Balance';
            logTransaction(`Connected OTP WebSocket to ${accountId}`, true);
        }
    }
}

async function setMode(mode) {
    activeAccountMode = mode;
    document.getElementById('btn-demo').className = mode === 'demo' ? "px-3 py-1 rounded-lg font-bold bg-emerald-600 text-white transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
    document.getElementById('btn-real').className = mode === 'real' ? "px-3 py-1 rounded-lg font-bold bg-gold text-slate-950 transition" : "px-3 py-1 rounded-lg font-semibold text-slate-400";
    document.getElementById('account-id-label').innerText = mode === 'real' ? 'Real Balance' : 'Demo Balance';

    if (window.derivApiInstance) {
        const switched = await window.derivApiInstance.switchAccountMode(mode);
        if (switched) {
            const sel = document.getElementById('account-selector');
            if (sel) sel.value = switched.account;
            logTransaction(`Switched to ${mode.toUpperCase()} Account (${switched.account})`, true);
        }
    }
}

function switchParityFilter(filterKey) {
    currentParityFilter = filterKey;
    ['all', 'rise', 'fall', 'aplus'].forEach(k => {
        const btn = document.getElementById(`pf-${k}`);
        if (btn) {
            btn.className = k === filterKey
                ? "bg-cyan-600 text-white font-bold py-1 px-1 rounded"
                : "bg-slate-900 text-slate-300 py-1 px-1 rounded border border-slate-800";
        }
    });
    renderScanner();
}

function switchCategory(cat) {
    currentCategory = cat;
    ['all', 'volatility', 'volatility_1s', 'jump'].forEach(c => {
        const btn = document.getElementById(`cat-${c}`);
        if (btn) {
            btn.className = c === cat
                ? "bg-emerald-600 text-white font-bold py-1.5 px-1 rounded-lg transition"
                : "bg-slate-900 text-slate-300 py-1.5 px-1 rounded-lg transition border border-slate-800";
        }
    });
    renderScanner();
}

function changeChartTimeframe(tf, syncState = true) {
    activeCandleTf = String(tf);
    document.querySelectorAll('.tf-btn').forEach(btn => {
        btn.className = btn.dataset.tf === activeCandleTf
            ? "tf-btn px-2 py-1 rounded bg-emerald-600 text-white font-bold"
            : "tf-btn px-2 py-1 rounded bg-slate-900 border border-slate-800 text-slate-300";
    });
    if (syncState && marketDataStore[currentSymbol]) {
        marketDataStore[currentSymbol].timeframe = activeCandleTf;
        updateSignalUI(currentSymbol);
    }
    initTradingView(currentSymbol, activeCandleTf);
}

function toggleChartFullscreen() {
    const w = document.getElementById('chart-card-wrapper');
    w.classList.toggle('fixed'); w.classList.toggle('inset-4'); w.classList.toggle('z-50');
}

function initTradingView(sym, tf = '5') {
    const c = document.getElementById('tradingview_advanced_chart');
    if (!c || typeof TradingView === 'undefined') return;
    c.innerHTML = '';
    const assetObj = exhaustiveAssets.find(a => a.symbol === sym);
    const tvSym = (assetObj && assetObj.tv) ? assetObj.tv : "FX:EURUSD";

    new TradingView.widget({
        width: "100%",
        height: "100%",
        symbol: tvSym,
        interval: tf,
        timezone: "Africa/Nairobi",
        theme: "dark",
        style: "1",
        locale: "en",
        toolbar_bg: "#030712",
        studies: ["STD;EMA", "STD;RSI", "STD;Directional_Movement"],
        container_id: "tradingview_advanced_chart"
    });
}

function buildCommandString(sym, st, gate) {
    const runsCap = getSelectedRunsTarget(MAX_RUNS_CAP);
    const marketLabel = gate.isAPlus ? sym : 'NULL_MARKET';
    return `RF_SMC_SIGNAL(Market=${marketLabel}, Contract=${st.strategy.api}, Entry=${st.entryPoint}, TF=${st.timeframe}m, HoldTime=${st.holdMinutes}m, Ticks=${st.ticks}t, Feeder=${st.firmFeederDigit}, Runs=${runsCap}, Grade=${gate.grade})`;
}

function updatePnlDisplay() {
    const badge = document.getElementById('pnl-summary-badge');
    const scoreEl = document.getElementById('metric-score');
    const streakEl = document.getElementById('noise-readout');
    const maxStreak = parseInt(document.getElementById('max-loss-streak')?.value, 10) || 2;

    if (badge) {
        const sign = sessionNetPnl >= 0 ? '+' : '';
        badge.innerText = `NET P&L: ${sign}$${sessionNetPnl.toFixed(2)}`;
        badge.className = sessionNetPnl >= 0
            ? "text-[10px] font-bold text-slate-950 bg-fxgreen px-2.5 py-1 rounded"
            : "text-[10px] font-bold text-white bg-rose-600 px-2.5 py-1 rounded";
    }
    if (scoreEl) scoreEl.innerText = `${sessionWins}W / ${sessionLosses}L`;
    if (streakEl) streakEl.innerText = `${consecutiveLosses}/${maxStreak}`;
}

function updateSignalUI(sym) {
    const st = marketDataStore[sym];
    if (!st) return;

    const runsCap = getSelectedRunsTarget(MAX_RUNS_CAP);
    const holdMode = getSelectedHoldMode();
    st.runsTarget = runsCap;
    const gate = evaluateRiseFallAPlusAlignment(st);
    const cmdStr = buildCommandString(sym, st, gate);

    if (typeof highlightActiveBoat === 'function') {
        highlightActiveBoat(st.strategy.boatId);
    }

    const filterBadge = document.getElementById('side-signal-live-badge');
    if (filterBadge) {
        filterBadge.innerText = gate.isAPlus ? 'SMC A+' : 'NULL MARKET';
        filterBadge.className = gate.isAPlus
            ? 'text-[9px] font-black bg-fxgreen text-slate-950 px-2 py-0.5 rounded'
            : 'text-[9px] font-black bg-amber-500 text-slate-950 px-2 py-0.5 rounded';
    }

    document.getElementById('chart-title-label').innerText = `${st.name} (${sym}) • ${st.timeframe}m • ${st.strategy.name} • ${st.smcZone}`;
    document.getElementById('live-tick-symbol-tag').innerText = sym;
    document.getElementById('adaptive-shift-status').innerText = gate.isAPlus
        ? `SMC A+ -> ${st.name} | Entry ${st.entryPoint} | ${st.strategy.name} | TF ${st.timeframe}m • Hold ${st.holdMinutes}m / ${st.ticks}t • Max ${runsCap} Runs`
        : `Noisy / Unaligned (${gate.statusText}) — Shifting Timeframes & Synthetic Markets...`;

    document.getElementById('side-sig-asset').innerText = gate.isAPlus ? `${st.name} (${sym})` : 'NULL MARKET';
    document.getElementById('side-sig-contract').innerText = gate.isAPlus ? st.strategy.name : 'AWAITING SMC A+';
    document.getElementById('side-sig-entry').innerText = `${st.entryPoint} (${st.smcZone.split(' ')[0]})`;
    document.getElementById('side-sig-candle').innerText = `${st.timeframe}m TF • Hold ${st.holdMinutes}m`;
    document.getElementById('side-sig-ticks').innerText = `${st.ticks} Ticks Hold`;
    document.getElementById('side-sig-parity').innerText = `EVEN ${gate.parity.evenPct}% / ODD ${gate.parity.oddPct}%`;
    document.getElementById('side-sig-feeder').innerText = `[ ${st.firmFeederDigit} ]`;
    document.getElementById('side-sig-runs').innerText = `${st.runsCompleted} / ${runsCap} Runs`;
    document.getElementById('side-sig-boat').innerText = aiBoatsDirectory[st.strategy.boatId].name;
    document.getElementById('side-sig-command').innerText = cmdStr;

    const expBox = document.getElementById('expectancy-warning-box');
    const expBe = document.getElementById('exp-breakeven-rate');
    const expText = document.getElementById('exp-asymmetry-text');
    const expVerdict = document.getElementById('exp-filter-verdict');

    if (expBe && expText && expVerdict && expBox) {
        expBe.innerText = st.smcZone;
        expText.innerText = gate.statusText;
        expVerdict.innerText = gate.isAPlus
            ? `Entry ${st.entryPoint} • ${holdMode === 'minutes' ? `Time Hold ${st.holdMinutes}m` : `Tick Hold ${st.ticks}t`} • Feeder [${st.firmFeederDigit}] • Max ${runsCap} Runs`
            : `Null Market Guard Active — Shifting TF & Synthetic Markets for SMC A+ Match`;
        expVerdict.className = gate.isAPlus ? 'text-[9px] font-bold text-fxgreen' : 'text-[9px] font-bold text-amber-300';
        expBox.className = gate.isAPlus
            ? 'bg-emerald-950/50 border border-fxgreen/50 rounded-xl p-2.5 space-y-1 text-[10px]'
            : 'bg-amber-950/60 border border-amber-500/60 rounded-xl p-2.5 space-y-1 text-[10px]';
    }

    document.getElementById('man-asset').innerText = gate.isAPlus ? `${sym} @ ${st.entryPoint}` : 'NULL MARKET';
    document.getElementById('man-strat').innerText = `${st.strategy.shortName} [F:${st.firmFeederDigit}]`;
    document.getElementById('man-trigger').innerText = `${st.timeframe}m • ${st.holdMinutes}m/${st.ticks}t • ${runsCap} Runs`;

    document.getElementById('stable-entry-digit-display').innerText = `[ ${st.firmFeederDigit} ]`;
    document.getElementById('momentum-readout').innerText = `${st.timeframe}m (${st.holdMinutes}m/${st.ticks}t)`;
    document.getElementById('streak-lock-badge').innerText = `RUNS: ${st.runsCompleted}/${runsCap}`;

    document.getElementById('metric-adx').innerText = st.smcZone.split(' ').slice(0, 2).join(' ');
    document.getElementById('metric-rsi').innerText = st.rsi;
    const emaEl = document.getElementById('metric-ema');
    if (emaEl) {
        emaEl.innerText = st.emaBias;
        emaEl.className = st.emaBias === 'BULLISH' ? 'text-fxgreen font-bold' : 'text-rose-400 font-bold';
    }
    document.getElementById('metric-wick').innerText = `${gate.parity.evenPct}% / ${gate.parity.oddPct}%`;
    document.getElementById('metric-ou-rate').innerText = gate.grade;

    updatePnlDisplay();
    renderDigitHeatmap(st);
}

function getSetupPool() {
    if (currentParityFilter === 'rise') {
        return RISE_FALL_SETUPS.filter(s => s.direction === 'rise');
    }
    if (currentParityFilter === 'fall') {
        return RISE_FALL_SETUPS.filter(s => s.direction === 'fall');
    }
    return RISE_FALL_SETUPS;
}

function pickNextSetupFromPool(preferredDir = null) {
    const pool = getSetupPool();
    if (preferredDir) {
        const match = RISE_FALL_SETUPS.find(s => s.direction === preferredDir);
        if (match) return match;
    }
    if (pool.length === 0) return RISE_FALL_SETUPS[0];
    signalCycleCursor = (signalCycleCursor + 1) % pool.length;
    return pool[signalCycleCursor];
}

function findNextAPlusMarket(candidates) {
    for (let i = 0; i < candidates.length; i++) {
        const asset = candidates[i];
        const st = marketDataStore[asset.symbol];
        if (!st) continue;
        const preferredDir = st.emaBias === 'BULLISH' ? 'rise' : 'fall';
        const matchingSetup = RISE_FALL_SETUPS.find(s => s.direction === preferredDir) || RISE_FALL_SETUPS[0];

        for (let tIdx = 0; tIdx < DEFAULT_MINUTE_TIMEFRAMES.length; tIdx++) {
            const tf = DEFAULT_MINUTE_TIMEFRAMES[(tIdx + i) % DEFAULT_MINUTE_TIMEFRAMES.length];
            const prevTf = st.timeframe;
            const prevStrat = { ...st.strategy };
            st.timeframe = tf;
            st.strategy = { ...matchingSetup };
            const gate = evaluateRiseFallAPlusAlignment(st);
            if (gate.isAPlus) {
                return { asset, timeframe: tf, strategy: matchingSetup };
            }
            st.timeframe = prevTf;
            st.strategy = prevStrat;
        }
    }
    return null;
}

function selectSymbol(sym, name, rotateStrategy = true) {
    currentSymbol = sym;
    shiftCountdown = rotationIntervalSec;
    const st = marketDataStore[sym];
    if (!st) return;

    st.runsCompleted = 0;
    if (rotateStrategy) {
        const preferredDir = currentParityFilter === 'all' ? (st.emaBias === 'BULLISH' ? 'rise' : 'fall') : null;
        const nextStrat = pickNextSetupFromPool(preferredDir);
        st.strategy = { ...nextStrat, ticks: st.ticks, holdMinutes: st.holdMinutes };
        st.runsTarget = getSelectedRunsTarget(MAX_RUNS_CAP);
    } else {
        st.runsTarget = getSelectedRunsTarget(MAX_RUNS_CAP);
    }

    activeCandleTf = st.timeframe;
    changeChartTimeframe(activeCandleTf, false);
    updateSignalUI(sym);

    const gate = evaluateRiseFallAPlusAlignment(st);
    logTransaction(
        gate.isAPlus
            ? `SMC A+ -> ${name} (${sym}) | Entry ${st.entryPoint} | ${st.strategy.name} | TF ${st.timeframe}m • Hold ${st.holdMinutes}m/${st.ticks}t • Max ${st.runsTarget} Runs`
            : `Shifted -> ${name} (${sym}) [${st.timeframe}m] — ${gate.statusText}`,
        gate.isAPlus
    );

    if (window.derivApiInstance) {
        window.derivApiInstance.subscribeTicks(sym, handleTick);
    }
    renderScanner();
}

function pickNextRotatedAsset() {
    const pool = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);
    if (pool.length === 0) return exhaustiveAssets[0];

    const ordered = [];
    for (let i = 1; i <= pool.length; i++) {
        ordered.push(pool[(rotationCursor + i) % pool.length]);
    }

    const apMatch = findNextAPlusMarket(ordered);
    if (apMatch) {
        rotationCursor = pool.findIndex(a => a.symbol === apMatch.asset.symbol);
        marketDataStore[apMatch.asset.symbol].timeframe = apMatch.timeframe;
        marketDataStore[apMatch.asset.symbol].strategy = { ...apMatch.strategy };
        return apMatch.asset;
    }

    rotationCursor = (rotationCursor + 1) % pool.length;
    const nextAsset = pool[rotationCursor];
    const nextSt = marketDataStore[nextAsset.symbol];
    const tfIdx = DEFAULT_MINUTE_TIMEFRAMES.indexOf(nextSt.timeframe);
    nextSt.timeframe = DEFAULT_MINUTE_TIMEFRAMES[(tfIdx + 1) % DEFAULT_MINUTE_TIMEFRAMES.length];
    return nextAsset;
}

function forceNextMarketShift() {
    const nextAsset = pickNextRotatedAsset();
    if (nextAsset) {
        selectSymbol(nextAsset.symbol, nextAsset.name, true);
    }
}

function startActiveRotationLoop() {
    if (shiftTimer) clearInterval(shiftTimer);
    updateRotationIntervalFromInput();
    shiftCountdown = rotationIntervalSec;

    shiftTimer = setInterval(() => {
        shiftCountdown--;
        const pill = document.getElementById('shift-countdown-pill');
        if (pill) pill.innerText = `${Math.max(1, shiftCountdown)}s`;

        if (shiftCountdown <= 0) {
            shiftCountdown = rotationIntervalSec;
            forceNextMarketShift();
        }
    }, 1000);
}

function renderDigitHeatmap(st) {
    const container = document.getElementById('digit-frequency-bar');
    if (!container) return;
    const total = st.digitCounts.reduce((a, b) => a + b, 0) || 1;
    container.innerHTML = st.digitCounts.map((cnt, d) => {
        const pct = Math.round((cnt / total) * 100);
        const isFirm = d === st.firmFeederDigit;
        const parityLabel = d % 2 === 0 ? 'E' : 'O';
        return `
            <div class="p-1 rounded border ${isFirm ? 'bg-emerald-950 border-fxgreen text-fxgreen font-black' : 'bg-slate-950 border-slate-800 text-slate-400'}">
                <div>${d}${parityLabel}</div>
                <div class="text-[9px]">${pct}%</div>
            </div>
        `;
    }).join('');
}

function renderScanner() {
    const list = document.getElementById('scanner-market-list');
    if (!list) return;
    list.innerHTML = '';

    const aPlusFirst = document.getElementById('high-hit-bias-toggle')?.checked;
    let filtered = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);

    if (currentParityFilter === 'rise') {
        filtered = filtered.filter(a => marketDataStore[a.symbol].strategy.direction === 'rise');
    } else if (currentParityFilter === 'fall') {
        filtered = filtered.filter(a => marketDataStore[a.symbol].strategy.direction === 'fall');
    } else if (currentParityFilter === 'aplus') {
        filtered = filtered.filter(a => evaluateRiseFallAPlusAlignment(marketDataStore[a.symbol]).isAPlus);
    }

    if (filtered.length === 0) {
        list.innerHTML = `<div class="text-amber-300 text-center py-4 bg-amber-950/30 rounded-xl border border-amber-500/40">NULL MARKET — No synthetic index matches this Rise/Fall SMC A+ filter right now.</div>`;
        return;
    }

    const sorted = [...filtered].sort((a, b) => {
        const gateA = evaluateRiseFallAPlusAlignment(marketDataStore[a.symbol]);
        const gateB = evaluateRiseFallAPlusAlignment(marketDataStore[b.symbol]);
        const gradeA = gateA.isAPlus ? 1 : 0;
        const gradeB = gateB.isAPlus ? 1 : 0;
        if (aPlusFirst && gradeB !== gradeA) return gradeB - gradeA;
        return gateB.score - gateA.score;
    });

    sorted.forEach(m => {
        const st = marketDataStore[m.symbol];
        const gate = evaluateRiseFallAPlusAlignment(st);
        const runsCap = getSelectedRunsTarget(MAX_RUNS_CAP);
        const isSel = m.symbol === currentSymbol;
        const tickColor = st.lastTickDir === 'up' ? 'tick-up' : 'tick-down';

        const div = document.createElement('div');
        div.onclick = () => selectSymbol(m.symbol, m.name, true);
        div.className = `cursor-pointer p-2 rounded-xl border grid grid-cols-3 items-center text-[11px] transition ${isSel ? 'bg-emerald-950/70 border-fxgreen shadow-[0_0_10px_rgba(0,255,136,0.3)]' : 'bg-slate-900 border-slate-800 hover:border-emerald-500/50 hover:bg-slate-850'}`;
        div.innerHTML = `
            <div><div class="font-bold text-white truncate">${m.name}</div><div class="text-[9px] text-cyan-400">${st.timeframe}m • ${st.holdMinutes}m/${st.ticks}t • ADX ${st.adx}</div></div>
            <div class="text-right"><div class="font-bold font-mono ${tickColor}" id="price-${m.symbol}">${st.price}</div><div class="text-[9px] text-gold truncate">${st.strategy.shortName} @ ${st.entryPoint}</div></div>
            <div class="text-right font-mono"><div class="${gate.isAPlus ? 'text-fxgreen' : 'text-amber-300'} font-bold text-[10px]">${gate.grade} • ${runsCap}R</div><div class="text-[9px] text-slate-400">${isSel ? 'ACTIVE' : 'QUEUED'}</div></div>
        `;
        list.appendChild(div);
    });
}

function haltWithGuardrail(reason) {
    activeAutomationMode = null;
    document.getElementById('tx-status-pill').innerText = `🛑 Guardrail Halt & Shift: ${reason}`;
    logTransaction(`GUARDRAIL HALT (${reason}) — Shifting to Next Rise/Fall SMC A+ Market — ELHADARTGLOBALFX`, true);
    if (typeof triggerProfitAlert === 'function') {
        triggerProfitAlert(reason, sessionNetPnl);
    }
    forceNextMarketShift();
}

function settleSimulatedOutcome(stake, strategy, isAPlus) {
    const winProb = isAPlus ? 0.62 : 0.46;
    const isWin = Math.random() < winProb;

    if (isWin) {
        const profit = Number((stake * strategy.payoutMult).toFixed(2));
        sessionWins++;
        consecutiveLosses = 0;
        sessionNetPnl = Number((sessionNetPnl + profit).toFixed(2));
        simulatedBalance = Number((simulatedBalance + profit).toFixed(2));
        return { isWin: true, delta: profit };
    } else {
        const loss = Number(stake.toFixed(2));
        sessionLosses++;
        consecutiveLosses++;
        sessionNetPnl = Number((sessionNetPnl - loss).toFixed(2));
        simulatedBalance = Number(Math.max(0, simulatedBalance - loss).toFixed(2));
        return { isWin: false, delta: -loss };
    }
}

function handleTick(tick) {
    const sym = tick.symbol;
    const q = Number(tick.quote);
    if (isNaN(q)) return;

    const st = marketDataStore[sym];
    if (!st) return;

    const prevPrice = parseFloat(st.price);
    const pipSize = tick.pip_size || st.pip || 2;
    st.price = q.toFixed(pipSize);
    st.lastTickDir = q >= prevPrice ? 'up' : 'down';

    st.priceHistory.push(q);
    if (st.priceHistory.length > 35) st.priceHistory.shift();

    const ind = computeIndicatorsFromHistory(st.priceHistory, st.adx);
    st.adx = ind.adx;
    st.rsi = ind.rsi;
    st.emaBias = ind.emaBias;
    st.entryPoint = Number(ind.entryPoint).toFixed(pipSize);

    const liveDigit = parseInt(st.price.slice(-1), 10);
    if (!isNaN(liveDigit)) {
        st.recentDigits.push(liveDigit);
        if (st.recentDigits.length > 100) st.recentDigits.shift();
        if (st.recentDigits.length >= 25) {
            st.digitCounts = new Array(10).fill(0);
            st.recentDigits.forEach(d => st.digitCounts[d]++);
        }
    }

    const priceEl = document.getElementById(`price-${sym}`);
    if (priceEl) {
        priceEl.innerText = st.price;
        priceEl.className = `font-bold font-mono ${st.lastTickDir === 'up' ? 'tick-up' : 'tick-down'}`;
    }

    if (sym === currentSymbol) {
        const bigQuoteEl = document.getElementById('live-big-quote');
        const bigDigitEl = document.getElementById('live-last-digit-badge');
        if (bigQuoteEl) {
            bigQuoteEl.innerText = st.price;
            bigQuoteEl.className = st.lastTickDir === 'up' ? 'text-fxgreen font-black' : 'text-rose-400 font-black';
        }
        if (bigDigitEl && !isNaN(liveDigit)) {
            bigDigitEl.innerText = liveDigit;
        }
        document.getElementById('metric-adx').innerText = st.smcZone.split(' ').slice(0, 2).join(' ');
        document.getElementById('metric-rsi').innerText = st.rsi;
        const emaEl = document.getElementById('metric-ema');
        if (emaEl) {
            emaEl.innerText = st.emaBias;
            emaEl.className = st.emaBias === 'BULLISH' ? 'text-fxgreen font-bold' : 'text-rose-400 font-bold';
        }
        document.getElementById('side-sig-entry').innerText = `${st.entryPoint} (${st.smcZone.split(' ')[0]})`;
        document.getElementById('side-sig-feeder').innerText = `[ ${st.firmFeederDigit} ]`;
        document.getElementById('stable-entry-digit-display').innerText = `[ ${st.firmFeederDigit} ]`;
        document.getElementById('man-asset').innerText = `${sym} @ ${st.entryPoint}`;
        document.getElementById('man-strat').innerText = `${st.strategy.shortName} [F:${st.firmFeederDigit}]`;
        renderDigitHeatmap(st);

        const now = Date.now();
        const maxStreak = parseInt(document.getElementById('max-loss-streak')?.value, 10) || 2;
        const maxStopLoss = parseFloat(document.getElementById('session-stop-loss')?.value) || 5.00;
        const runsCap = getSelectedRunsTarget(MAX_RUNS_CAP);
        const holdMode = getSelectedHoldMode();
        st.runsTarget = runsCap;
        const gate = evaluateRiseFallAPlusAlignment(st);

        if (activeAutomationMode && now >= cooldownUntil && (now - lastExecutionTimestamp > 1000)) {
            if (!gate.isAPlus) {
                logTransaction(`Rise/Fall SMC momentum or alignment faded on ${sym} (${gate.statusText}) — Shifting market & TF...`, true);
                forceNextMarketShift();
                return;
            }

            lastExecutionTimestamp = now;
            st.runsCompleted++;

            const stake = activeAutomationMode === 'BULK'
                ? (parseFloat(document.getElementById('bulk-stake').value) || 1.00)
                : (parseFloat(document.getElementById('manual-stake').value) || 1.00);

            const executorName = activeAutomationMode === 'BOAT'
                ? aiBoatsDirectory[currentActiveBoat].name
                : `${activeAutomationMode} R/F`;

            const durationVal = holdMode === 'minutes' ? st.holdMinutes : st.ticks;
            const durationUnit = holdMode === 'minutes' ? 'm' : 't';

            if (!window.derivApiInstance || !window.derivApiInstance.isAuthorized) {
                const outcome = settleSimulatedOutcome(stake, st.strategy, gate.isAPlus);
                document.getElementById('account-balance').innerText = `$${simulatedBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
                const tag = outcome.isWin ? `WIN +$${outcome.delta.toFixed(2)}` : `LOSS -$${Math.abs(outcome.delta).toFixed(2)}`;
                logTransaction(`Run ${st.runsCompleted}/${runsCap} | ${executorName} | ${sym} ${st.strategy.shortName} @ ${st.entryPoint} (${durationVal}${durationUnit}) | ${tag}`, !outcome.isWin);

                if (!outcome.isWin) {
                    cooldownUntil = now + 2000;
                    if (consecutiveLosses >= maxStreak) {
                        haltWithGuardrail(`Max Loss Streak (${maxStreak}) Hit`);
                        return;
                    }
                    if (sessionNetPnl <= -Math.abs(maxStopLoss)) {
                        haltWithGuardrail(`Session Stop-Loss (-$${Math.abs(maxStopLoss).toFixed(2)}) Hit`);
                        return;
                    }
                }
            } else {
                window.derivApiInstance.buyContract({
                    symbol: sym,
                    contractType: st.strategy.api,
                    stake: stake,
                    duration: durationVal,
                    durationUnit: durationUnit
                });
                logTransaction(`Run ${st.runsCompleted}/${runsCap} | ${executorName} | ${st.strategy.api} sent on ${sym} (${durationVal}${durationUnit}, flat $${stake.toFixed(2)})`);
            }

            updateSignalUI(sym);

            if (activeAutomationMode && st.runsCompleted >= runsCap) {
                const prevMode = activeAutomationMode;
                st.runsCompleted = 0;
                if (prevMode === 'BULK') {
                    logTransaction(`${runsCap}-run cap secured on ${sym} — Shifting to next Rise/Fall SMC setup...`, true);
                    forceNextMarketShift();
                } else {
                    activeAutomationMode = null;
                    document.getElementById('tx-status-pill').innerText = `${runsCap} Runs Completed • Ready for Next Rise/Fall SMC Signal`;
                    logTransaction(`${runsCap}-run cycle completed (${executorName}) on ${sym} — Shifting to next SMC A+ setup...`, true);
                    forceNextMarketShift();
                }
            }
        }
    }
}

function executeAutomatedManualTrade() {
    const st = marketDataStore[currentSymbol];
    st.runsCompleted = 0;
    st.runsTarget = getSelectedRunsTarget(MAX_RUNS_CAP);
    const holdMode = getSelectedHoldMode();
    consecutiveLosses = 0;
    cooldownUntil = 0;
    activeAutomationMode = 'MANUAL';
    document.getElementById('tx-status-pill').innerText = `🟢 Manual (${currentSymbol} • ${st.strategy.shortName} • ${st.runsTarget} Runs)...`;
    logTransaction(`Started ${st.runsTarget}-Run Manual Rise/Fall Setup on ${currentSymbol} | Entry ${st.entryPoint} | ${st.strategy.name} | ${holdMode === 'minutes' ? `Hold ${st.holdMinutes}m` : `Hold ${st.ticks}t`}`, true);
}

function executeAutomatedBulkTrade() {
    const count = parseInt(document.getElementById('bulk-count').value, 10) || 5;
    const pool = currentCategory === 'all'
        ? exhaustiveAssets
        : exhaustiveAssets.filter(a => a.market === currentCategory);
    const basket = pool.slice(0, count);

    if (basket.length === 0) return;

    selectSymbol(basket[0].symbol, basket[0].name, false);
    marketDataStore[currentSymbol].runsCompleted = 0;
    consecutiveLosses = 0;
    cooldownUntil = 0;
    activeAutomationMode = 'BULK';
    document.getElementById('tx-status-pill').innerText = `🟢 Bulk Rise/Fall Rotating (${basket.map(a => a.symbol).join(', ')})...`;
    logTransaction(`Armed Bulk Rise/Fall SMC Basket (${basket.length} markets): ${basket.map(a => a.symbol).join(', ')}`, true);
}

function startBoatAutomation(boatId) {
    const st = marketDataStore[currentSymbol];
    const fallBoats = [2, 4, 6];
    const desiredDir = fallBoats.includes(Number(boatId)) ? 'fall' : 'rise';
    const matchedSetup = RISE_FALL_SETUPS.find(s => s.direction === desiredDir) || RISE_FALL_SETUPS[0];

    st.strategy = { ...matchedSetup, ticks: st.ticks, holdMinutes: st.holdMinutes, boatId: Number(boatId) };
    st.runsTarget = getSelectedRunsTarget(MAX_RUNS_CAP);
    st.runsCompleted = 0;
    consecutiveLosses = 0;
    cooldownUntil = 0;

    activeAutomationMode = 'BOAT';
    updateSignalUI(currentSymbol);
    document.getElementById('tx-status-pill').innerText = `🟢 ${aiBoatsDirectory[boatId].name} (${st.runsTarget} Runs)...`;
    logTransaction(`Running ${aiBoatsDirectory[boatId].name} on ${currentSymbol} | Entry ${st.entryPoint} | ${st.strategy.name} | ${st.runsTarget} Runs`, true);
}

function stopAllAutomation() {
    activeAutomationMode = null;
    if (marketDataStore[currentSymbol]) {
        marketDataStore[currentSymbol].runsCompleted = 0;
        updateSignalUI(currentSymbol);
    }
    document.getElementById('tx-status-pill').innerText = "🛑 Active Runs Stopped • Rise/Fall SMC Scanner Running";
    logTransaction("Active trade runs stopped. Rise/Fall SMC A+ scanner and market rotation remain active.", true);
}

function copySideSignalSettings() {
    const st = marketDataStore[currentSymbol];
    const runsCap = getSelectedRunsTarget(MAX_RUNS_CAP);
    const gate = evaluateRiseFallAPlusAlignment(st);
    const cmd = buildCommandString(currentSymbol, st, gate);
    const summary = `ELHADART RISE / FALL SMC A+ SIGNAL\nMarket: ${gate.isAPlus ? `${st.name} (${currentSymbol})` : 'NULL MARKET'}\nContract: ${st.strategy.name} | Entry Point: ${st.entryPoint}\nSMC Zone: ${st.smcZone} | Candle TF: ${st.timeframe}m | Time Hold: ${st.holdMinutes}m | Tick Hold: ${st.ticks} Ticks\nFirm Feeder Digit: [${st.firmFeederDigit}] | Runs Cap: ${runsCap}\nParity: EVEN ${gate.parity.evenPct}% / ODD ${gate.parity.oddPct}% | ADX ${st.adx} | RSI ${st.rsi} | EMA20 ${st.emaBias}\nGrade: ${gate.statusText}\nCommand: ${cmd}`;
    navigator.clipboard?.writeText(summary);
    alert(`📋 Copied Rise/Fall SMC A+ Signal:\n\n${summary}`);
}

function bootPlatform() {
    let totalSeconds = 90;
    const pBar = document.getElementById('splash-progress-bar');
    const cTxt = document.getElementById('splash-countdown-text');

    const countdownInterval = setInterval(() => {
        totalSeconds--;
        const mins = String(Math.floor(totalSeconds / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        if (cTxt) cTxt.innerText = `Loading Rise/Fall SMC A+ Scanner: ${mins}:${secs} (Live Synthetic Ticks Active)`;
        if (pBar) pBar.style.width = `${((90 - totalSeconds) / 90) * 100}%`;

        if (totalSeconds <= 0) {
            clearInterval(countdownInterval);
            dismissSplash();
        }
    }, 1000);

    document.getElementById('header-asset-count').innerText = `${exhaustiveAssets.length} Synthetic Markets (Vol • Vol 1s • Jump) • CALL/PUT • SMC + Even/Odd Parity • Max 6 Runs`;
    selectSymbol(exhaustiveAssets[0].symbol, exhaustiveAssets[0].name, false);
    renderScanner();
    startActiveRotationLoop();

    if (typeof DerivAPIConnector !== 'undefined') {
        const api = new DerivAPIConnector(DERIV_APP_ID);
        window.derivApiInstance = api;
        api.onAccountsLoaded = (accounts, selectedId) => {
            const sel = document.getElementById('account-selector');
            if (sel && accounts.length > 0) {
                sel.innerHTML = accounts.map(a => `<option value="${a.account}" ${a.account === selectedId ? 'selected' : ''}>${a.account} (${a.isVirtual ? 'Demo' : 'Real'})</option>`).join('');
                sel.classList.remove('hidden');
            }
        };
        api.onBalanceUpdate = (b) => {
            document.getElementById('account-balance').innerText = `$${Number(b.balance).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;
            const badge = document.getElementById('oauth-connection-badge');
            if (badge && b.loginid) {
                badge.innerText = `🟢 Connected (${b.loginid})`;
                badge.className = "text-[10px] font-mono font-bold text-fxgreen bg-emerald-950 px-2.5 py-1 rounded border border-fxgreen/40";
            }
        };
        api.onContractPurchased = (buyData) => {
            logTransaction(`Deriv Rise/Fall #${buyData.contract_id} Executed | Payout: $${buyData.payout}`);
        };
        api.connect(exhaustiveAssets).then(() => {
            api.subscribeTicks(currentSymbol, handleTick);
            api.subscribeMultipleTicks(exhaustiveAssets.map(a => a.symbol), handleTick);
        });
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootPlatform);
} else {
    bootPlatform();
}
