/**
 * GIG CREDIT BRIDGE AA - APPLICATION CONTROLLER & LOGIC
 * Manages Gig Platform Income Bridges, AA Consent Workflows,
 * Dynamic Underwriting Gauges, and Lender FIU Metrics.
 */

// Application State
const appState = {
    currentView: 'worker',
    gigScore: 740,
    maxLimit: 75000,
    aaConsentActive: true,
    aaHandle: 'rahul.kumar@onemoney',
    linkedFIPs: ['HDFC Bank', 'ICICI Bank'],
    platforms: [
        { id: 'zomato', name: 'Zomato Delivery', iconClass: 'icon-zomato', icon: 'fa-motorcycle', connected: true, monthlyIncome: 24500, tripsCount: 310, rating: '4.9★' },
        { id: 'uber', name: 'Uber Driver', iconClass: 'icon-uber', icon: 'fa-car', connected: true, monthlyIncome: 18000, tripsCount: 195, rating: '4.85★' },
        { id: 'swiggy', name: 'Swiggy Instamart', iconClass: 'icon-swiggy', icon: 'fa-basket-shopping', connected: false, monthlyIncome: 0, tripsCount: 0, rating: '--' },
        { id: 'urban', name: 'Urban Company Partner', iconClass: 'icon-urban', icon: 'fa-screwdriver-wrench', connected: false, monthlyIncome: 0, tripsCount: 0, rating: '--' }
    ],
    selectedLoanProduct: 'Pre-Approved Credit Line',
    selectedLoanAmount: 25000,
    repaymentMode: 'daily'
};

// Initialize Application
document.addEventListener('DOMContentLoaded', () => {
    renderPlatforms();
    updateGigScoreDisplay();
});

// View Switcher (Gig Worker vs Lender FIU Dashboard)
function switchView(viewName) {
    appState.currentView = viewName;
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.switch-btn').forEach(el => el.classList.remove('active'));

    if (viewName === 'worker') {
        document.getElementById('worker-view').classList.add('active');
        document.getElementById('btn-worker-view').classList.add('active');
    } else {
        document.getElementById('lender-view').classList.add('active');
        document.getElementById('btn-lender-view').classList.add('active');
    }
}

// Render Gig Platforms Grid
function renderPlatforms() {
    const grid = document.getElementById('platforms-grid');
    grid.innerHTML = appState.platforms.map(p => `
        <div class="card glass-panel platform-card">
            <div class="platform-header">
                <div class="platform-icon-wrap ${p.iconClass}">
                    <i class="fa-solid ${p.icon}"></i>
                </div>
                <span class="platform-status ${p.connected ? 'connected' : 'not-connected'}">
                    ${p.connected ? '<i class="fa-solid fa-check"></i> Connected' : 'Not Linked'}
                </span>
            </div>
            <div class="platform-body">
                <h4>${p.name}</h4>
                <div class="platform-earning">${p.connected ? '₹' + p.monthlyIncome.toLocaleString() : '₹0'} <span class="subtitle">/ mo</span></div>
                <div class="platform-meta">
                    ${p.connected ? `${p.tripsCount} orders completed • ${p.rating}` : 'Connect account to sync daily cashflow'}
                </div>
            </div>
            <div style="margin-top: 1rem;">
                ${p.connected ? 
                    `<button class="btn btn-sm btn-outline btn-block" onclick="togglePlatform('${p.id}')"><i class="fa-solid fa-sync"></i> Refresh Earnings</button>` :
                    `<button class="btn btn-sm btn-primary btn-block" onclick="togglePlatform('${p.id}')"><i class="fa-solid fa-link"></i> Connect API</button>`
                }
            </div>
        </div>
    `).join('');
}

// Toggle Platform Integration & Recalculate GigScore
function togglePlatform(platformId) {
    const platform = appState.platforms.find(p => p.id === platformId);
    if (!platform) return;

    platform.connected = !platform.connected;
    if (platform.connected) {
        platform.monthlyIncome = platformId === 'swiggy' ? 16500 : 28000;
        platform.tripsCount = platformId === 'swiggy' ? 220 : 140;
        platform.rating = '4.92★';
        appState.gigScore += 35;
        appState.maxLimit += 15000;
        showToast(`Linked ${platform.name}! GigScore increased to ${appState.gigScore}`);
    } else {
        appState.gigScore -= 35;
        appState.maxLimit -= 15000;
        showToast(`Disconnected ${platform.name}`, 'info');
    }

    renderPlatforms();
    updateGigScoreDisplay();
}

// Update GigScore Gauge and Credit Limit UI
function updateGigScoreDisplay() {
    const scoreDisplay = document.getElementById('score-display');
    const scoreTier = document.getElementById('score-tier');
    const gaugeCircle = document.getElementById('gauge-circle');
    const limitDisplay = document.getElementById('limit-amount');

    scoreDisplay.innerText = appState.gigScore;
    limitDisplay.innerText = appState.maxLimit.toLocaleString();

    const scorePct = Math.min(Math.round((appState.gigScore / 900) * 100), 100);
    gaugeCircle.style.setProperty('--score-pct', scorePct);

    if (appState.gigScore >= 750) {
        scoreTier.innerText = 'EXCELLENT';
        scoreTier.style.color = 'var(--emerald)';
    } else if (appState.gigScore >= 680) {
        scoreTier.innerText = 'VERY GOOD';
        scoreTier.style.color = 'var(--cyan)';
    } else {
        scoreTier.innerText = 'AVERAGE';
        scoreTier.style.color = 'var(--gold)';
    }
}

// ACCOUNT AGGREGATOR CONSENT MODAL WORKFLOW
function triggerAAConsentModal() {
    document.getElementById('aa-modal').classList.add('active');
    goToAAStep(1);
}

function closeAAConsentModal() {
    document.getElementById('aa-modal').classList.remove('active');
}

function goToAAStep(stepNum) {
    document.querySelectorAll('.aa-step').forEach(el => el.classList.remove('active'));
    document.getElementById(`aa-step-${stepNum}`).classList.add('active');

    if (stepNum === 3) {
        // Simulate AA Data Fetching
        document.getElementById('aa-loading').classList.remove('hidden');
        document.getElementById('aa-success').classList.add('hidden');

        setTimeout(() => {
            document.getElementById('aa-loading').classList.add('hidden');
            document.getElementById('aa-success').classList.remove('hidden');

            appState.gigScore = Math.min(appState.gigScore + 45, 880);
            appState.maxLimit = 95000;
            updateGigScoreDisplay();
        }, 2200);
    }
}

function finishAAConsent() {
    closeAAConsentModal();
    showToast('AA Financial Data Consent renewed successfully!');
}

// LOAN MODAL & CALCULATOR
function openLoanModal(productName, maxLimit) {
    appState.selectedLoanProduct = productName;
    document.getElementById('modal-loan-title').innerText = productName;
    
    const slider = document.getElementById('loan-amount-slider');
    slider.max = maxLimit;
    slider.value = Math.min(25000, maxLimit);
    
    updateLoanCalc();
    document.getElementById('loan-modal').classList.add('active');
}

function closeLoanModal() {
    document.getElementById('loan-modal').classList.remove('active');
}

function updateLoanCalc() {
    const sliderVal = parseInt(document.getElementById('loan-amount-slider').value);
    appState.selectedLoanAmount = sliderVal;
    
    document.getElementById('calc-amount-val').innerText = sliderVal.toLocaleString();
    document.getElementById('btn-disburse-amt').innerText = sliderVal.toLocaleString();

    let dailyRepay = Math.round((sliderVal * 1.05) / 60);
    if (appState.repaymentMode === 'daily') {
        document.getElementById('calc-daily-repay').innerText = `₹${dailyRepay} / day`;
        document.getElementById('calc-tenure').innerText = '60 Days';
    } else {
        let monthlyEmi = Math.round((sliderVal * 1.08) / 6);
        document.getElementById('calc-daily-repay').innerText = `₹${monthlyEmi} / month`;
        document.getElementById('calc-tenure').innerText = '6 Months';
    }
}

function setRepayMode(mode) {
    appState.repaymentMode = mode;
    document.querySelectorAll('.repay-opt').forEach(btn => btn.classList.remove('active'));
    event.currentTarget.classList.add('active');
    updateLoanCalc();
}

function confirmLoanWithdrawal() {
    closeLoanModal();
    const loanId = 'LN-' + Math.floor(10000 + Math.random() * 90000);
    
    // Add to Active Loans Table
    const tbody = document.getElementById('loans-table-body');
    const newRow = document.createElement('tr');
    newRow.innerHTML = `
        <td><span class="code-font">#${loanId}</span></td>
        <td><strong>${appState.selectedLoanProduct}</strong></td>
        <td>₹${appState.selectedLoanAmount.toLocaleString()}</td>
        <td>₹${appState.selectedLoanAmount.toLocaleString()}</td>
        <td><span class="text-emerald">₹${Math.round(appState.selectedLoanAmount / 60)} / day</span></td>
        <td><span class="badge badge-active">Active</span></td>
        <td><button class="btn btn-sm btn-outline" onclick="triggerPrepay('${loanId}')">Prepay</button></td>
    `;
    tbody.prepend(newRow);

    showToast(`₹${appState.selectedLoanAmount.toLocaleString()} disbursed to HDFC Bank A/C ****4892!`, 'success');
}

function triggerPrepay(loanId) {
    showToast(`Prepayment initiated for ${loanId}`, 'success');
}

function openConnectPlatformModal() {
    showToast('Select a platform card below to link your account via OAuth', 'info');
}

// Toast Notifications Helper
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
        <i class="fa-solid ${type === 'success' ? 'fa-circle-check text-emerald' : 'fa-circle-info text-cyan'}"></i>
        <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(100%)';
        setTimeout(() => toast.remove(), 300);
    }, 3500);
}
