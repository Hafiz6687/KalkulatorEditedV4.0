// =====================================================
// KALKULATOR AKTA KERJA 1955
// SCRIPT.JS - MASTER KARYA AGUNG (FINAL BULLETPROOF - UPGRADED)
// =====================================================

// =====================================================
// 1. HELPER & GET-ELEMENT ADAPTER (SELAMAT & ISOLATED)
// =====================================================
let activeCardContext = null;
const originalGetElement = document.getElementById.bind(document);

// UPGRADE: Global Context Manager (Capture Phase)
// Ini adalah "mata-mata" yang memastikan setiap kali user menaip, klik, 
// atau tukar dropdown (onchange), konteks SENTIASA disetkan kepada kad klon  
// yang sedang disentuh SEBELUM sebarang fungsi dijalankan. Isu ghaib selesai!
['click', 'input', 'change', 'focusin'].forEach(eventType => {
    document.addEventListener(eventType, function(e) {
        if (e && e.target && typeof e.target.closest === 'function') {
            let card = e.target.closest('.calculator-card');
            if (card) { activeCardContext = card; }
        }
    }, true); // true = capture phase
});

function setContext(e) {
    if (e && e.target && typeof e.target.closest === 'function') {
        let card = e.target.closest('.calculator-card');
        if (card) activeCardContext = card;
    }
}

window.getElement = function(id) {
    // Cari dalam konteks aktif dahulu (Kad Klon)
    if (activeCardContext) {
        let el = activeCardContext.querySelector(`[data-original-id="${id}"], [id="${id}"]`);
        if (el) return el;
    }
    // Fallback kepada pencarian global
    return originalGetElement(id);
};

function setText(id, value) { let el = getElement(id); if (el) el.innerHTML = value; }
function setValue(id, value) { let el = getElement(id); if (el) el.value = value; }
function formatRM(value) { value = Number(value) || 0; return "RM " + value.toLocaleString("en-MY", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }

function toggleResult(prefix, showData) {
    let pending = getElement(prefix + "Pending");
    let data = getElement(prefix + "Data");
    if (pending && data) {
        pending.style.display = showData ? "none" : "block";
        data.style.display = showData ? "block" : "none";
    }
}

function getLocalStartOfDay(dateStr) {
    if (!dateStr) return new Date();
    let parts = dateStr.split('-');
    if (parts.length === 3) { return new Date(parts[0], parts[1] - 1, parts[2]); }
    return new Date(dateStr); 
}

// =====================================================
// 2. ENJIN INPUT, FORMAT RM & MATEMATIK
// =====================================================
const salaryMap = {
    "orpBasicSalary": ["orpAllowance", "orpTotalSalary"],
    "otBasicSalary": ["otAllowance", "otTotalSalary"],
    "otRHBasicSalary": ["otRHAllowance", "otRHTotalSalary"],
    "section18ABasicSalary": ["section18AAllowance", "section18ATotalSalary"],
    "ggnUniBasic": ["ggnUniAllowance", "ggnUniTotal"],
    "rhBasicSalary": ["rhAllowance", "rhTotalSalary"],
    "rhMoreBasicSalary": ["rhMoreAllowance", "rhMoreTotalSalary"],
    "phBasicSalary": ["phAllowance", "phTotalSalary"],
    "otPHBasicSalary": ["otPHAllowance", "otPHTotalSalary"],
    "tbbBasicSalary": ["tbbAllowance", "tbbTotalSalary"]
};

function evaluateSmartMath(inputStr) {
    if (!inputStr) return 0;
    let cleanStr = inputStr.toString().toLowerCase().replace(/rm/g, '').replace(/bulan/g, '').replace(/x/g, '*').replace(/\[/g, '(').replace(/\]/g, ')').replace(/[^\d\.\+\-\*\/\(\)]/g, ''); 
    if (cleanStr === "") return 0; 
    try { return new Function('return ' + cleanStr)() || 0; } catch (e) { return 0; }
}

function getInputNumber(id) {
    let el = getElement(id); return el ? evaluateSmartMath(el.value) : 0;
}

function formatSafeRM(val) {
    let num = evaluateSmartMath(val);
    if (num === 0 && !val.toString().includes("0")) return "";
    return "RM " + num.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function updateSalaryTotal(basicID, allowanceID, totalID) {
    let basic = getInputNumber(basicID); let allowance = getInputNumber(allowanceID);
    let total = basic + allowance; let tEl = getElement(totalID);
    if(tEl) tEl.value = "RM " + total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); 
    return total;
}

document.addEventListener("DOMContentLoaded", function() {
    let semuaInput = document.querySelectorAll('input');
    semuaInput.forEach(input => { if (input.type === "number") input.setAttribute("type", "text"); });
});

document.addEventListener("focusin", function(e) {
    if (e.target.tagName !== "INPUT" || e.target.type === "date") return;
    let label = e.target.parentElement.querySelector("label");
    let isCurrency = e.target.classList.contains("salary-input") || e.target.classList.contains("salary-total") || (label && label.innerText.includes("(RM)"));
    if (isCurrency && (e.target.value.includes("RM") || e.target.value.includes(","))) {
        let oldVal = e.target.value; let cleanVal = evaluateSmartMath(oldVal);
        let newVal = cleanVal === 0 && !oldVal.includes("0") ? "" : cleanVal;
        if (newVal.toString() !== oldVal.toString()) {
            e.target.value = newVal; e.target.dispatchEvent(new Event('input', { bubbles: true }));
        }
    }
});

document.addEventListener("focusout", function(e) {
    if (e.target.tagName !== "INPUT" || e.target.type === "date") return;
    let label = e.target.parentElement.querySelector("label");
    let isCurrency = e.target.classList.contains("salary-input") || e.target.classList.contains("salary-total") || (label && label.innerText.includes("(RM)"));
    if (isCurrency && e.target.value.trim() !== "") {
        let oldVal = e.target.value; let newVal = formatSafeRM(oldVal);
        if (newVal !== oldVal) { e.target.value = newVal; e.target.dispatchEvent(new Event('input', { bubbles: true })); }
    }
});

document.addEventListener("change", function(e) {
    if (e.target.tagName !== "INPUT") return;
    let isMathInput = e.target.classList.contains("salary-input") || e.target.classList.contains("number-input") || e.target.classList.contains("tbb-monthly-input");
    if (!isMathInput) return;
    try {
        let nilai = e.target.value.trim();
        if (/^\d{1,4}-\d{1,2}-\d{1,4}$/.test(nilai) || /^\d{1,2}\/\d{1,2}\/\d{4}$/.test(nilai)) return; 
        if (/[+\-*/()]/.test(nilai) && !nilai.includes("RM")) {
            let hasil = evaluateSmartMath(nilai);
            if (hasil !== undefined && !isNaN(hasil)) { e.target.value = hasil; e.target.dispatchEvent(new Event('input', { bubbles: true })); }
        }
    } catch (err) {}
});

document.addEventListener("input", function(e) {
    if (e.target.tagName !== "INPUT") return;
    let originalId = e.target.getAttribute('data-original-id') || e.target.id;
    activeCardContext = e.target.closest('.calculator-card');
    try {
        if (originalId === "orpBasicSalary" || originalId === "orpAllowance") {
            let rawValue = e.target.value; 
            let tempContext = activeCardContext;
            activeCardContext = null; 
            Object.keys(salaryMap).forEach(key => {
                let bID = key, aID = salaryMap[key][0], tID = salaryMap[key][1];
                let sasaranB = document.querySelectorAll(`[id="${bID}"], [data-original-id="${bID}"]`);
                let sasaranA = document.querySelectorAll(`[id="${aID}"], [data-original-id="${aID}"]`);
                if (originalId === "orpBasicSalary") sasaranB.forEach(el => { if (el !== e.target) el.value = rawValue; });
                if (originalId === "orpAllowance") sasaranA.forEach(el => { if (el !== e.target) el.value = rawValue; });
                sasaranB.forEach(bEl => {
                    let kad = bEl.closest('.calculator-card');
                    if (kad) {
                        let aEl = kad.querySelector(`[id="${aID}"], [data-original-id="${aID}"]`);
                        let tEl = kad.querySelector(`[id="${tID}"], [data-original-id="${tID}"]`);
                        let basicVal = evaluateSmartMath(bEl.value); let allowVal = aEl ? evaluateSmartMath(aEl.value) : 0;
                        if (tEl) tEl.value = "RM " + (basicVal + allowVal).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    }
                });
            });
            activeCardContext = tempContext; 
        }
        Object.keys(salaryMap).forEach(key => {
            let data = salaryMap[key]; if (originalId === key || originalId === data[0]) updateSalaryTotal(key, data[0], data[1]);
        });
    } finally { activeCardContext = null; }
});

// =====================================================
// 3. KALKULATOR TERAS (FORMULA ASAL DIKEKALKAN)
// =====================================================

function getORP() { return updateSalaryTotal("orpBasicSalary", "orpAllowance", "orpTotalSalary") / 26; }

function calculateORP(e) {
    setContext(e); let totalSalary = updateSalaryTotal("orpBasicSalary", "orpAllowance", "orpTotalSalary"); let ORP = totalSalary / 26;
    setText("orpResultTotal", formatRM(totalSalary)); setText("orpResult", formatRM(ORP)); toggleResult("orp", true);
}
function resetORP() {
    ["orpBasicSalary", "orpAllowance"].forEach(id => setValue(id, "")); setValue("orpTotalSalary", "RM 0.00");
    ["orpResultTotal", "orpResult"].forEach(id => setText(id, "RM 0.00")); toggleResult("orp", false);
}

function calculateBakiUpah(e) {
    setContext(e); let patutTerima = getInputNumber("orpPatutTerima"); let telahTerima = getInputNumber("orpTelahTerima");
    if (patutTerima === 0) return; 
    let baki = telahTerima - patutTerima; let bakiEl = getElement("orpBakiAmount");
    if(bakiEl) {
        if (baki < 0) { bakiEl.innerText = "-" + formatRM(Math.abs(baki)); bakiEl.style.color = "#d9534f"; } 
        else if (baki > 0) { bakiEl.innerText = "+" + formatRM(baki); bakiEl.style.color = "#28a745"; } 
        else { bakiEl.innerText = formatRM(0); bakiEl.style.color = "#1f4e79"; }
    }
    toggleResult("baki", true); autoMasukRumusan('orpBakiAmount', activeCardContext);
}
function resetBakiUpah() {
    ["orpPatutTerima", "orpTelahTerima"].forEach(id => setValue(id, "")); 
    let el = getElement("orpBakiAmount"); if(el) { el.innerText = "RM 0.00"; el.style.color = ""; } toggleResult("baki", false);
}

function calculateOTBiasa(e) {
    setContext(e); let totalSalary = updateSalaryTotal("otBasicSalary", "otAllowance", "otTotalSalary");
    let hours = Number(getElement("otHours").value); let workingHours = Number(getElement("normalWorkingHours").value);
    if (!workingHours) { alert("Sila pilih jam kerja normal sehari."); return; }
    let ORP = totalSalary / 26; let hourly = (ORP / workingHours) * 1.5; let amount = hourly * hours;
    setText("otResultTotal", formatRM(totalSalary)); setText("otORP", formatRM(ORP));
    setText("otHourly", formatRM(hourly)); setText("otAmount", formatRM(amount)); toggleResult("ot", true); autoMasukRumusan('otAmount', activeCardContext);
}
function resetOTBiasa() {
    ["otBasicSalary", "otAllowance", "otHours"].forEach(id => setValue(id, "")); setValue("otTotalSalary", "RM 0.00"); setValue("normalWorkingHours", "");
    ["otResultTotal", "otORP", "otHourly", "otAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("ot", false);
}

function calculateOTRH(e) {
    setContext(e); let totalSalary = updateSalaryTotal("otRHBasicSalary", "otRHAllowance", "otRHTotalSalary");
    let hours = Number(getElement("otRHHours").value); let workingHours = Number(getElement("otRHNormalWorkingHours").value);
    if (!workingHours) { alert("Sila pilih jam kerja normal sehari."); return; }
    let ORP = totalSalary / 26; let hourly = (ORP / workingHours) * 2.0; let amount = hourly * hours;
    setText("otRHResultTotal", formatRM(totalSalary)); setText("otRHORP", formatRM(ORP));
    setText("otRHHourly", formatRM(hourly)); setText("otRHAmount", formatRM(amount)); toggleResult("otRH", true); autoMasukRumusan('otRHAmount', activeCardContext);
}
function resetOTRH() {
    ["otRHBasicSalary", "otRHAllowance", "otRHHours"].forEach(id => setValue(id, "")); setValue("otRHTotalSalary", "RM 0.00"); setValue("otRHNormalWorkingHours", "");
    ["otRHResultTotal", "otRHORP", "otRHHourly", "otRHAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("otRH", false);
}

function calculateOTPH(e) {
    setContext(e); let totalSalary = updateSalaryTotal("otPHBasicSalary", "otPHAllowance", "otPHTotalSalary");
    let hours = Number(getElement("otPHHours").value); let workingHours = Number(getElement("otPHWorkingHours").value);
    if (!workingHours) { alert("Sila pilih jam kerja normal sehari."); return; }
    let ORP = totalSalary / 26; let hourly = (ORP / workingHours) * 3.0; let amount = hourly * hours;
    setText("otPHResultTotal", formatRM(totalSalary)); setText("otPHORP", formatRM(ORP));
    setText("otPHHourly", formatRM(hourly)); setText("otPHAmount", formatRM(amount)); toggleResult("otPH", true); autoMasukRumusan('otPHAmount', activeCardContext);
}
function resetOTPH() {
    ["otPHBasicSalary", "otPHAllowance", "otPHHours"].forEach(id => setValue(id, "")); setValue("otPHTotalSalary", "RM 0.00"); setValue("otPHWorkingHours", "");
    ["otPHResultTotal", "otPHORP", "otPHHourly", "otPHAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("otPH", false);
}

function calculateHariRehat(e) {
    setContext(e); let totalSalary = updateSalaryTotal("rhBasicSalary", "rhAllowance", "rhTotalSalary");
    let days = Number(getElement("rhDays").value); let ORP = totalSalary / 26; let daily = ORP * 0.5; let amount = daily * days;
    setText("rhResultTotal", formatRM(totalSalary)); setText("rhORP", formatRM(ORP));
    setText("rhDaily", formatRM(daily)); setText("rhAmount", formatRM(amount)); toggleResult("rh", true); autoMasukRumusan('rhAmount', activeCardContext);
}
function resetHariRehat() {
    ["rhBasicSalary", "rhAllowance", "rhDays"].forEach(id => setValue(id, "")); setValue("rhTotalSalary", "RM 0.00");
    ["rhResultTotal", "rhORP", "rhDaily", "rhAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("rh", false);
}

function calculateHariRehatLebih(e) {
    setContext(e); let totalSalary = updateSalaryTotal("rhMoreBasicSalary", "rhMoreAllowance", "rhMoreTotalSalary");
    let days = Number(getElement("rhMoreDays").value); let ORP = totalSalary / 26; let daily = ORP; let amount = daily * days;
    setText("rhMoreResultTotal", formatRM(totalSalary)); setText("rhMoreORP", formatRM(ORP));
    setText("rhMoreDaily", formatRM(daily)); setText("rhMoreAmount", formatRM(amount)); toggleResult("rhMore", true); autoMasukRumusan('rhMoreAmount', activeCardContext);
}
function resetHariRehatLebih() {
    ["rhMoreBasicSalary", "rhMoreAllowance", "rhMoreDays"].forEach(id => setValue(id, "")); setValue("rhMoreTotalSalary", "RM 0.00");
    ["rhMoreResultTotal", "rhMoreORP", "rhMoreDaily", "rhMoreAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("rhMore", false);
}

function calculatePH(e) {
    setContext(e); let totalSalary = updateSalaryTotal("phBasicSalary", "phAllowance", "phTotalSalary");
    let days = Number(getElement("phDays").value); let ORP = totalSalary / 26; let daily = ORP * 2; let amount = daily * days;
    setText("phResultTotal", formatRM(totalSalary)); setText("phORP", formatRM(ORP));
    setText("phDaily", formatRM(daily)); setText("phAmount", formatRM(amount)); toggleResult("ph", true); autoMasukRumusan('phAmount', activeCardContext);
}
function resetPH() {
    ["phBasicSalary", "phAllowance", "phDays"].forEach(id => setValue(id, "")); setValue("phTotalSalary", "RM 0.00");
    ["phResultTotal", "phORP", "phDaily", "phAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("ph", false);
}

function getDaysInMonth(year, month) { return new Date(year, month + 1, 0).getDate(); }
function getMonthlyBreakdown(salary, startDate, endDate) {
    let result = []; let current = new Date(startDate);
    while (current <= endDate) {
        let year = current.getFullYear(); let month = current.getMonth();
        let daysInMonth = getDaysInMonth(year, month); let firstDay = current.getDate(); let lastDay = daysInMonth;
        if (year === endDate.getFullYear() && month === endDate.getMonth()) lastDay = endDate.getDate();
        let days = lastDay - firstDay + 1; let dailyRate = salary / daysInMonth; let amount = dailyRate * days;
        result.push({ year: year, month: month, daysInMonth: daysInMonth, days: days, dailyRate: dailyRate, amount: amount });
        current = new Date(year, month + 1, 1);
    }
    return result;
}

function calculate18ANew(e) {
    setContext(e); let totalSalary = updateSalaryTotal("section18ABasicSalary", "section18AAllowance", "section18ATotalSalary");
    let startDate = getElement("section18AStartDate").value; let endDate = getElement("section18AEndDate").value;
    if (!startDate || !endDate) { alert("Sila masukkan tarikh mula dan tarikh akhir."); return; }
    let start = getLocalStartOfDay(startDate); let end = getLocalStartOfDay(endDate);
    if (end < start) { alert("Tarikh akhir tidak boleh lebih awal daripada tarikh mula."); return; }
    let breakdown = getMonthlyBreakdown(totalSalary, start, end); let totalAmount = 0; breakdown.forEach(item => { totalAmount += item.amount; });
    setText("resultTotalSalary", formatRM(totalSalary));
    if (breakdown.length > 0) {
        let first = breakdown[0]; let firstDate = new Date(first.year, first.month, 1);
        setText("month1Title", firstDate.toLocaleString("ms-MY", {month:"long", year:"numeric"}));
        setText("month1Days", first.days + " Hari"); setText("month1Daily", formatRM(first.dailyRate)); setText("month1Amount", formatRM(first.amount));
    }
    if (breakdown.length > 1) {
        let second = breakdown[1]; let secondDate = new Date(second.year, second.month, 1);
        setText("month2Title", secondDate.toLocaleString("ms-MY", {month:"long", year:"numeric"}));
        setText("month2Days", second.days + " Hari"); setText("month2Daily", formatRM(second.dailyRate)); setText("month2Amount", formatRM(second.amount));
    } else { setText("month2Title", "-"); setText("month2Days", "-"); setText("month2Daily", "-"); setText("month2Amount", "-"); }
    setText("amount18A", formatRM(totalAmount)); toggleResult("sec18A", true); autoMasukRumusan('amount18A', activeCardContext);
}
function resetSeksyen18A() {
    ["section18ABasicSalary", "section18AAllowance", "section18AStartDate", "section18AEndDate"].forEach(id => setValue(id, ""));
    setValue("section18ATotalSalary", "RM 0.00"); ["resultTotalSalary", "month1Daily", "month2Daily", "month1Amount", "month2Amount", "amount18A"].forEach(id => setText(id, "RM 0.00"));
    ["month1Title", "month2Title", "month1Days", "month2Days"].forEach(id => setText(id, "-")); toggleResult("sec18A", false);
}

function calculateCutiTahunan(e) {
    setContext(e); let ORP = getORP(); let days = Number(getElement("annualLeaveDays").value); let amount = ORP * days;
    setText("annualLeaveORP", formatRM(ORP)); setText("annualLeaveAmount", formatRM(amount)); toggleResult("annualLeave", true); autoMasukRumusan('annualLeaveAmount', activeCardContext);
}
function resetCutiTahunan() {
    setValue("cutiLayak", ""); setValue("cutiGuna", ""); setValue("annualLeaveDays", "");
    setText("annualLeaveORP", "RM 0.00"); setText("annualLeaveAmount", "RM 0.00"); toggleResult("annualLeave", false);
}
function autoKiraBakiCuti() {
    const layakInput = getElement('cutiLayak').value; const gunaInput = getElement('cutiGuna').value;
    if (layakInput === "" && gunaInput === "") { getElement('annualLeaveDays').value = ""; return; }
    let baki = (parseFloat(layakInput) || 0) - (parseFloat(gunaInput) || 0);
    getElement('annualLeaveDays').value = baki < 0 ? 0 : baki;
}

function calculateCutiSakit(e) {
    setContext(e); let ORP = getORP(); let days = Number(getElement("sickLeaveDays").value); let amount = ORP * days;
    setText("sickLeaveORP", formatRM(ORP)); setText("sickLeaveAmount", formatRM(amount)); toggleResult("sickLeave", true); autoMasukRumusan('sickLeaveAmount', activeCardContext);
}
function resetCutiSakit() {
    setValue("sickLeaveDays", ""); setText("sickLeaveORP", "RM 0.00"); setText("sickLeaveAmount", "RM 0.00"); toggleResult("sickLeave", false);
}

function calculateKelayakanCuti(e) {
    setContext(e); const startVal = getElement('kelayakanCutiMula').value; const endVal = getElement('kelayakanCutiAkhir').value;
    if (!startVal || !endVal) { alert("Sila masukkan Tarikh Mula Kerja dan Tarikh Kiraan / Akhir."); return; }
    const startDate = getLocalStartOfDay(startVal); const endDate = getLocalStartOfDay(endVal);
    if (endDate < startDate) { alert("Tarikh Kiraan tidak boleh lebih awal daripada Tarikh Mula Kerja."); return; }
    let totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 - startDate.getMonth() + endDate.getMonth();
    if (endDate.getDate() < startDate.getDate()) totalMonths--; if (totalMonths < 0) totalMonths = 0;
    const yearsCompleted = Math.floor(totalMonths / 12); const remainingMonths = totalMonths % 12;
    let currentTier = (yearsCompleted >= 5) ? 16 : (yearsCompleted >= 2) ? 12 : 8;
    let prorataDays = remainingMonths > 0 ? Math.round((remainingMonths / 12) * currentTier) : 0;
    let totalTerkumpul = 0; for (let i = 1; i <= yearsCompleted; i++) { totalTerkumpul += (i <= 2) ? 8 : (i <= 5) ? 12 : 16; }
    let tempohText = (yearsCompleted > 0 ? `${yearsCompleted} Tahun ` : "") + (remainingMonths > 0 ? `${remainingMonths} Bulan` : "");
    if (totalMonths === 0) tempohText = "Kurang 1 Bulan";
    setText('kelayakanCutiTempoh', tempohText.trim()); setText('kelayakanCutiKategori', yearsCompleted === 0 ? "Tidak Layak (< 12 Bulan)" : `${currentTier} Hari / Tahun`);
    setText('kelayakanCutiTerkumpul', `${totalTerkumpul} Hari`); setText('kelayakanCutiHari', `${prorataDays} Hari`); toggleResult("kelayakanCuti", true);
}
function resetKelayakanCuti() {
    ['kelayakanCutiMula', 'kelayakanCutiAkhir'].forEach(id => setValue(id, ""));
    ['kelayakanCutiTempoh', 'kelayakanCutiKategori', 'kelayakanCutiTerkumpul'].forEach(id => setText(id, "-"));
    setText('kelayakanCutiHari', '0 Hari'); toggleResult("kelayakanCuti", false);
}

function calculateKelayakanCutiSakit(e) {
    setContext(e); const startVal = getElement('kelayakanCutiSakitMula').value; const endVal = getElement('kelayakanCutiSakitAkhir').value;
    if (!startVal || !endVal) { alert("Sila masukkan Tarikh Mula Kerja dan Tarikh Kiraan / Akhir."); return; }
    const startDate = getLocalStartOfDay(startVal); const endDate = getLocalStartOfDay(endVal);
    if (endDate < startDate) { alert("Tarikh Kiraan tidak boleh lebih awal."); return; }
    let totalMonths = (endDate.getFullYear() - startDate.getFullYear()) * 12 - startDate.getMonth() + endDate.getMonth();
    if (endDate.getDate() < startDate.getDate()) totalMonths--; if (totalMonths < 0) totalMonths = 0;
    const yearsCompleted = Math.floor(totalMonths / 12); const remainingMonths = totalMonths % 12;
    let kelayakanBiasa = (yearsCompleted >= 5) ? 22 : (yearsCompleted >= 2) ? 18 : 14;
    let tempohText = (yearsCompleted > 0 ? `${yearsCompleted} Tahun ` : "") + (remainingMonths > 0 ? `${remainingMonths} Bulan` : "");
    if (totalMonths === 0) tempohText = "Kurang 1 Bulan";
    setText('kelayakanCutiSakitTempoh', tempohText.trim()); setText('kelayakanCutiSakitBiasa', `${kelayakanBiasa} Hari`); setText('kelayakanCutiSakitHospital', `60 Hari`);
    setValue('sakitLayak', kelayakanBiasa); setValue('hospLayak', 60); autoKiraBakiSakit(); toggleResult("kelayakanSakit", true);
}
function resetKelayakanCutiSakit() {
    ['kelayakanCutiSakitMula', 'kelayakanCutiSakitAkhir'].forEach(id => setValue(id, ""));
    setText('kelayakanCutiSakitTempoh', "-"); setText('kelayakanCutiSakitBiasa', '0 Hari'); setText('kelayakanCutiSakitHospital', '60 Hari');
    resetBakiCutiSakit(); toggleResult("kelayakanSakit", false);
}
function autoKiraBakiSakit() {
    let bBiasa = (parseFloat(getElement('sakitLayak').value) || 0) - (parseFloat(getElement('sakitGuna').value) || 0);
    let bHosp = (parseFloat(getElement('hospLayak').value) || 0) - (parseFloat(getElement('hospGuna').value) || 0);
    setValue('bakiSakitBiasa', bBiasa < 0 ? 0 : bBiasa); setValue('bakiHosp', bHosp < 0 ? 0 : bHosp);
}
function resetBakiCutiSakit() { ['sakitLayak', 'sakitGuna', 'bakiSakitBiasa', 'hospLayak', 'hospGuna', 'bakiHosp'].forEach(id => setValue(id, "")); }

function toggleNotisStatus() {
    let statusEl = getElement("ggnStatusNotis"); if (!statusEl) return; let status = statusEl.value;
    let elsStart = ["ggnUniWeekStart", "ggnUniDayStart"], elsEnd = ["ggnUniWeekEnd", "ggnUniDayEnd"];
    elsStart.forEach(id => {
        let el = getElement(id);
        if (el && el.parentElement) { let lbl = el.parentElement.querySelector("label"); if (lbl) lbl.innerText = (status === "tiada") ? "Tarikh Penamatan (Serta-merta)" : "Tarikh Mula Notis"; }
    });
    elsEnd.forEach(id => { let el = getElement(id); if (el && el.parentElement) el.parentElement.style.display = (status === "tiada") ? "none" : "block"; });
}

function toggleGGNMode() {
    let mode = getElement("ggnUniType").value;
    getElement("ggnGroupBulan").style.display = "none"; getElement("ggnGroupMinggu").style.display = "none"; getElement("ggnGroupHari").style.display = "none";
    let statusGroup = getElement("ggnStatusGroup"); if (statusGroup) statusGroup.style.display = (mode === "minggu" || mode === "hari") ? "block" : "none";
    if (mode === "bulan") getElement("ggnGroupBulan").style.display = "block";
    else if (mode === "minggu") { getElement("ggnGroupMinggu").style.display = "block"; toggleNotisStatus(); } 
    else if (mode === "hari") { getElement("ggnGroupHari").style.display = "block"; toggleNotisStatus(); }
    getElement("ggnResBulan").style.display = "none"; getElement("ggnRes18A").style.display = "none"; getElement("ggnResPending").style.display = "block";
}

function formatDateInput(date) {
    let year = date.getFullYear(); let month = String(date.getMonth() + 1).padStart(2, "0"); let day = String(date.getDate()).padStart(2, "0");
    return year + "-" + month + "-" + day;
}

function autoGGNEndDate(type) {
    let startId = type === 'minggu' ? 'ggnUniWeekStart' : 'ggnUniDayStart';
    let valId = type === 'minggu' ? 'ggnUniWeekVal' : 'ggnUniDayVal';
    let endId = type === 'minggu' ? 'ggnUniWeekEnd' : 'ggnUniDayEnd';
    let start = getElement(startId); let val = getElement(valId); let end = getElement(endId);
    if (!start || !val || !end) return;
    let multiplier = type === 'minggu' ? 7 : 1; let daysToAdd = Number(val.value) * multiplier;
    if (!start.value || daysToAdd <= 0) { end.value = ""; return; }
    let date = getLocalStartOfDay(start.value); date.setDate(date.getDate() + daysToAdd - 1); end.value = formatDateInput(date);
}

function calculateGGNUnified(e) {
    setContext(e); let mode = getElement("ggnUniType").value; if (!mode) { alert("Sila pilih Jenis Notis terlebih dahulu."); return; }
    let totalSalary = updateSalaryTotal("ggnUniBasic", "ggnUniAllowance", "ggnUniTotal"); let statusNotisEl = getElement("ggnStatusNotis"); let isTanpaNotis = statusNotisEl && statusNotisEl.value === "tiada";
    if (mode === "bulan") {
        let months = Number(getElement("ggnUniMonthVal").value);
        if (months <= 0) { alert("Sila masukkan bilangan bulan notis."); return; }
        let amount = totalSalary * months;
        setText("resUniMonthCount", months + " Bulan"); setText("resUniMonthAmount", formatRM(amount));
        getElement("ggnResPending").style.display = "none"; getElement("ggnRes18A").style.display = "none"; getElement("ggnResBulan").style.display = "block";
        autoMasukRumusan('resUniMonthAmount', activeCardContext);
    } else {
        let valId = mode === 'minggu' ? 'ggnUniWeekVal' : 'ggnUniDayVal'; let startId = mode === 'minggu' ? 'ggnUniWeekStart' : 'ggnUniDayStart'; let endId = mode === 'minggu' ? 'ggnUniWeekEnd' : 'ggnUniDayEnd';
        let val = Number(getElement(valId).value); let startDate = getElement(startId).value;
        if (val <= 0 || !startDate) { let msg = isTanpaNotis ? "Tarikh Penamatan" : "Tarikh Mula Notis"; alert(`Sila masukkan bilangan ${mode} dan ${msg}.`); return; }
        let multiplier = mode === 'minggu' ? 7 : 1; let totalDays = val * multiplier;
        let start = getLocalStartOfDay(startDate); let end = new Date(start); end.setDate(end.getDate() + totalDays - 1);
        let breakdown = getMonthlyBreakdown(totalSalary, start, end); let totalAmount = 0; breakdown.forEach(item => { totalAmount += item.amount; });
        setValue(endId, formatDateInput(end)); setText("resUni18ATotal", formatRM(totalSalary)); setText("resUni18AEnd", `${end.getDate()}-${end.getMonth() + 1}-${end.getFullYear()}`);
        let endResultEl = getElement("resUni18AEnd"); if(endResultEl && endResultEl.parentElement) { let lbl = endResultEl.parentElement.querySelector("span"); if(lbl) lbl.innerText = isTanpaNotis ? "Tamat Tempoh Indemniti" : "Tarikh Akhir Notis"; }
        if (breakdown.length > 0) { let f = breakdown[0]; let fD = new Date(f.year, f.month, 1); setText("resUniM1Title", fD.toLocaleString("ms-MY", {month:"long", year:"numeric"})); setText("resUniM1Days", f.days + " Hari"); setText("resUniM1Daily", formatRM(f.dailyRate)); setText("resUniM1Amount", formatRM(f.amount)); }
        if (breakdown.length > 1) { let s = breakdown[1]; let sD = new Date(s.year, s.month, 1); setText("resUniM2Title", sD.toLocaleString("ms-MY", {month:"long", year:"numeric"})); setText("resUniM2Days", s.days + " Hari"); setText("resUniM2Daily", formatRM(s.dailyRate)); setText("resUniM2Amount", formatRM(s.amount)); } 
        else { setText("resUniM2Title", "-"); setText("resUniM2Days", "-"); setText("resUniM2Daily", "-"); setText("resUniM2Amount", "-"); }
        setText("resUni18AAmount", formatRM(totalAmount)); getElement("ggnResPending").style.display = "none"; getElement("ggnResBulan").style.display = "none"; getElement("ggnRes18A").style.display = "block";
        autoMasukRumusan('resUni18AAmount', activeCardContext);
    }
}

function resetGGNUnified() {
    ["ggnUniBasic", "ggnUniAllowance", "ggnUniType", "ggnUniMonthVal", "ggnUniWeekVal", "ggnUniWeekStart", "ggnUniWeekEnd", "ggnUniDayVal", "ggnUniDayStart", "ggnUniDayEnd", "ggnStatusNotis"].forEach(id => { if (getElement(id)) setValue(id, ""); });
    if(getElement("ggnStatusNotis")) setValue("ggnStatusNotis", "ada"); setValue("ggnUniTotal", "RM 0.00"); toggleGGNMode(); 
}

const monthNames = ["Jan", "Feb", "Mac", "Apr", "Mei", "Jun", "Jul", "Ogo", "Sep", "Okt", "Nov", "Dis"];

function toggleTBBSalaryMode() {
    let mode = getElement("tbbSalaryMode").value;
    getElement("tbbFixedSalaryGroup").style.display = (mode === "tetap") ? "block" : "none";
    getElement("tbbVariableSalaryGroup").style.display = (mode === "berubah") ? "block" : "none";
    getElement("tbbFormulaSalaryGroup").style.display = (mode === "formula") ? "block" : "none";
    if (mode === "berubah") generate12MonthsTable();
}

function generate12MonthsTable() {
    let endDateVal = getElement("tbbEndDate").value; let container = getElement("tbb12MonthsContainer");
    if (!endDateVal) { container.innerHTML = '<span style="color:#1f4e79; font-weight:bold;">Menunggu Tarikh Penamatan dipilih...</span>'; return; }
    let end = getLocalStartOfDay(endDateVal); let currentMonth = end.getMonth(); let currentYear = end.getFullYear();
    let lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    if (end.getDate() < lastDayOfMonth) { currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; } }
    let html = '<label style="margin-bottom:12px; display:block; color:#1f4e79; font-weight:bold; border-bottom: 1px solid #ccc; padding-bottom: 5px;">Upah 12 Bulan Terakhir (RM)</label>';
    for (let i = 0; i < 12; i++) {
        html += `<div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
            <span style="font-size:14px; font-weight:bold; color:#555;">${monthNames[currentMonth]} ${currentYear}</span>
            <input type="text" class="number-input tbb-monthly-input" style="width: 55%; padding: 6px; margin-bottom: 0;" placeholder="Contoh: 1800+200" onfocus="this.select()" onchange="autoKiraKotakBulan(this)"></div>`;
        currentMonth--; if (currentMonth < 0) { currentMonth = 11; currentYear--; }
    }
    container.innerHTML = html;
}

function autoKira12Bulan() { setValue("tbb12MonthsTotalReadonly", formatRM(evaluateSmartMath(getElement("tbbMonthlyTotal").value) * 12)); }
function autoKiraKotakBulan(element) { if (element.value.trim() === "") return; let total = evaluateSmartMath(element.value); if (total > 0) element.value = formatRM(total); }

function calculateTBB(e) {
    setContext(e); let startVal = getElement("tbbStartDate").value; let endVal = getElement("tbbEndDate").value;
    if (!startVal || !endVal) { alert("Sila masukkan Tarikh Mula Kerja dan Tarikh Penamatan."); return; }
    let start = getLocalStartOfDay(startVal); let end = getLocalStartOfDay(endVal);
    if (end < start) { alert("Tarikh Penamatan tidak boleh lebih awal daripada Tarikh Mula."); return; }
    let mode = getElement("tbbSalaryMode").value; let total12Months = 0;
    
    if (mode === "tetap") {
        let monthly = evaluateSmartMath(getElement("tbbMonthlyTotal").value);
        if (monthly <= 0) { alert("Sila masukkan Jumlah Upah Sebulan."); return; }
        total12Months = monthly * 12;
    } else if (mode === "berubah") {
        let parentCard = getElement("tbbEndDate").closest('.calculator-card');
        let inputs = parentCard ? parentCard.querySelectorAll(".tbb-monthly-input") : document.querySelectorAll(".tbb-monthly-input");
        if (inputs.length === 0) { alert("Sila masukkan Tarikh Penamatan untuk menjana jadual."); return; }
        inputs.forEach(input => { total12Months += evaluateSmartMath(input.value); });
        if (total12Months <= 0) { alert("Sila isi upah bulanan pada jadual."); return; }
    } else if (mode === "formula") {
        total12Months = evaluateSmartMath(getElement("tbbFormulaInput").value);
        if (total12Months <= 0) { alert("Sila semak semula format formula anda."); return; }
    }
    
    let ORP = total12Months / 365; let totalMonths = (end.getFullYear() - start.getFullYear()) * 12 - start.getMonth() + end.getMonth();
    let dStart = start.getDate(); let dEnd = end.getDate(); let extraDays = 0;
    if (dEnd >= dStart) { extraDays = dEnd - dStart + 1; } else {
        totalMonths--; let prevMonth = new Date(end.getFullYear(), end.getMonth(), 0); extraDays = prevMonth.getDate() - dStart + 1 + dEnd;
    }
    if (extraDays >= 15) { totalMonths++; } if (totalMonths < 0) totalMonths = 0;
    let years = Math.floor(totalMonths / 12); let remMonths = totalMonths % 12;
    let tempohText = (years > 0 ? `${years} Tahun ` : "") + (remMonths > 0 ? `${remMonths} Bulan` : "");
    if (totalMonths === 0) tempohText = "Kurang 1 Bulan";
    let rate = (totalMonths < 24) ? 10 : (totalMonths < 60) ? 15 : 20; let entitledDays = (totalMonths / 12) * rate; let amount = entitledDays * ORP;
    
    setText("tbbTempoh", tempohText.trim()); setText("tbbKadar", `${rate} Hari / Tahun`); setText("tbbHari", `${entitledDays.toFixed(2)} Hari`); 
    setText("tbbTotal12M", formatRM(total12Months)); setText("tbbORP", formatRM(ORP)); setText("tbbAmount", formatRM(amount)); toggleResult("tbb", true);
    autoMasukRumusan('tbbAmount', activeCardContext);
}

function resetTBB() {
    ["tbbStartDate", "tbbEndDate", "tbbMonthlyTotal", "tbb12MonthsTotalReadonly", "tbbFormulaInput"].forEach(id => setValue(id, ""));
    setValue("tbbSalaryMode", "tetap"); toggleTBBSalaryMode(); getElement("tbb12MonthsContainer").innerHTML = '<span style="color:#1f4e79; font-weight:bold;">Menunggu Tarikh Penamatan dipilih...</span>';
    ["tbbTempoh", "tbbKadar", "tbbHari"].forEach(id => setText(id, "-")); ["tbbTotal12M", "tbbORP", "tbbAmount"].forEach(id => setText(id, "RM 0.00")); toggleResult("tbb", false);
}

// =====================================================
// 4. ENJIN KALKULATOR RUMUSAN AKHIR
// =====================================================
const senaraiKalkulatorRumusan = [
    { nilai: "", teks: "- Sila Pilih Jenis Bayaran -" }, { nilai: "orpBakiAmount", teks: "Baki Upah / Gaji (ORP)" }, { nilai: "resUniMonthAmount", teks: "Gaji Ganti Notis (Bulan)" }, { nilai: "resUni18AAmount", teks: "Gaji Ganti Notis (Hari / Minggu)" }, { nilai: "tbbAmount", teks: "Faedah Penamatan" }, { nilai: "otAmount", teks: "OT Hari Biasa" }, { nilai: "otRHAmount", teks: "OT Hari Rehat" }, { nilai: "otPHAmount", teks: "OT Hari Kelepasan" }, { nilai: "rhAmount", teks: "Kerja Hari Rehat (½ Hari @ Kurang)" }, { nilai: "rhMoreAmount", teks: "Kerja Hari Rehat (Lebih ½ Hari)" }, { nilai: "phAmount", teks: "Kerja Pada Hari Kelepasan" }, { nilai: "amount18A", teks: "Seksyen 18A (Jumlah Bayaran Upah)" }, { nilai: "annualLeaveAmount", teks: "Bayaran Cuti Tahunan" }, { nilai: "sickLeaveAmount", teks: "Bayaran Cuti Sakit" }
];

function formatRMRumusan(amount) { if (isNaN(amount) || amount === "") return "RM0.00"; return "RM " + parseFloat(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }); }
function unformatRMRumusan(str) { if (!str) return 0; return parseFloat(str.toString().replace(/[^0-9.-]+/g, "")) || 0; }

function tambahBarisRumusan() {
    const tbody = document.getElementById('badanJadualRumusan'); const tr = document.createElement('tr'); tr.style.borderBottom = "1px dashed #ddd";
    let pilihanHTML = ''; senaraiKalkulatorRumusan.forEach(item => { pilihanHTML += `<option value="${item.nilai}">${item.teks}</option>`; });
    tr.innerHTML = `
        <td style="padding: 10px;"><select class="select-input" style="width: 100%; border-color: #1f4e79;" onchange="kemaskiniPatutBayar(this)">${pilihanHTML}</select></td>
        <td style="padding: 10px;"><input type="text" class="number-input keterangan-baris" placeholder="-" style="background: #fff; text-align: center; width: 100%;"></td>
        <td style="padding: 10px;"><input type="text" class="number-input patut-bayar" value="RM 0.00" style="background: #fff; font-weight: bold; width: 100%; text-align: center;" onblur="formatPatutBayar(this)" onfocus="unformatPatutBayar(this)"></td>
        <td style="padding: 10px;"><input type="text" class="number-input telah-bayar" placeholder="Contoh: 599.00" style="width: 100%; text-align: center;" onblur="formatTelahBayar(this)" onfocus="unformatTelahBayar(this)"></td>
        <td style="padding: 10px;"><input type="text" class="number-input baki-baris" value="RM 0.00" readonly style="background: #fff; font-weight: bold; width: 100%; border: none; text-align: center;"></td>
        <td style="padding: 10px; text-align: center;"><button onclick="buangBarisRumusan(this)" style="background: #dc3545; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; font-weight: bold;">X</button></td>
    `;
    tbody.appendChild(tr);
}

function unformatTelahBayar(input) { let val = unformatRMRumusan(input.value); input.value = val === 0 ? "" : val; }
function formatTelahBayar(input) { let val = unformatRMRumusan(input.value); input.value = formatRMRumusan(val); kiraBakiBaris(input); }

// --- TAMBAH DUA BARIS KOD INI ---
function unformatPatutBayar(input) { let val = unformatRMRumusan(input.value); input.value = val === 0 ? "" : val; }
function formatPatutBayar(input) { let val = unformatRMRumusan(input.value); input.value = formatRMRumusan(val); kiraBakiBaris(input); }
// --------------------------------

function kemaskiniPatutBayar(selectElement) {
    const baris = selectElement.closest('tr');
    const idSasaran = selectElement.value;
    const inputKeterangan = baris.querySelector('.keterangan-baris');
    const inputPatutBayar = baris.querySelector('.patut-bayar');
    const inputTelahBayar = baris.querySelector('.telah-bayar');
    
    let nilaiDiambil = 0;
    let senaraiKeterangan = []; // Array untuk simpan keterangan (contoh: 4 jam, 2 jam)

    inputTelahBayar.removeAttribute('readonly');
    inputTelahBayar.style.background = "#fff";
    
    if (idSasaran !== "") {
        let semuaKadAktif = document.querySelectorAll('.calculator-card:not(.hidden-template)');
        
        if (idSasaran === "orpBakiAmount") {
            let jumlahPatut = 0, jumlahTelah = 0;
            for(let kad of semuaKadAktif) {
                let patutEl = kad.querySelector('[id="orpPatutTerima"], [data-original-id="orpPatutTerima"]');
                let telahEl = kad.querySelector('[id="orpTelahTerima"], [data-original-id="orpTelahTerima"]');
                if (patutEl || telahEl) { 
                    jumlahPatut += unformatRMRumusan(patutEl ? patutEl.value : "0");
                    jumlahTelah += unformatRMRumusan(telahEl ? telahEl.value : "0");
                }
            }
            nilaiDiambil = jumlahPatut;
            inputTelahBayar.value = formatRMRumusan(jumlahTelah);
            inputTelahBayar.setAttribute('readonly', true);
            inputTelahBayar.style.background = "#f4f4f4";
            senaraiKeterangan.push("Dari Kalkulator ORP");
            
        } else {
            // Untuk kalkulator lain
            for(let kad of semuaKadAktif) {
                let elemenKeputusan = kad.querySelector(`[id="${idSasaran}"], [data-original-id="${idSasaran}"]`);
                if (elemenKeputusan && elemenKeputusan.innerText && unformatRMRumusan(elemenKeputusan.innerText) !== 0) {
                    nilaiDiambil += unformatRMRumusan(elemenKeputusan.innerText);
                    
                    // --- LOGIK EKSTRAK KETERANGAN ---
                    let detail = "";
                    let getVal = (id) => { let e = kad.querySelector(`[id="${id}"], [data-original-id="${id}"]`); return e ? e.value : ""; };
                    let getTxt = (id) => { let e = kad.querySelector(`[id="${id}"], [data-original-id="${id}"]`); return e ? e.innerText : ""; };

                    if (idSasaran.includes("otAmount")) { let jam = getVal("otHours"); if(jam) detail = `${jam} jam`; }
                    else if (idSasaran.includes("otRHAmount")) { let jam = getVal("otRHHours"); if(jam) detail = `${jam} jam`; }
                    else if (idSasaran.includes("otPHAmount")) { let jam = getVal("otPHHours"); if(jam) detail = `${jam} jam`; }
                    else if (idSasaran.includes("rhAmount") && !idSasaran.includes("rhMoreAmount")) { let hari = getVal("rhDays"); if(hari) detail = `${hari} hari`; }
                    else if (idSasaran.includes("rhMoreAmount")) { let hari = getVal("rhMoreDays"); if(hari) detail = `${hari} hari`; }
                    else if (idSasaran.includes("phAmount")) { let hari = getVal("phDays"); if(hari) detail = `${hari} hari`; }
                    else if (idSasaran.includes("annualLeaveAmount")) { let hari = getVal("annualLeaveDays"); if(hari) detail = `${hari} hari`; }
                    else if (idSasaran.includes("sickLeaveAmount")) { let hari = getVal("sickLeaveDays"); if(hari) detail = `${hari} hari`; }
                    else if (idSasaran.includes("resUniMonthAmount")) { let bulan = getVal("ggnUniMonthVal"); if(bulan) detail = `${bulan} bulan`; }
                    else if (idSasaran.includes("resUni18AAmount")) { 
                        let m = getVal("ggnUniWeekVal"), h = getVal("ggnUniDayVal"); 
                        if(m) detail = `${m} minggu`; else if(h) detail = `${h} hari`;
                    }
                    else if (idSasaran.includes("tbbAmount")) { let hari = getTxt("tbbHari"); if(hari && hari !== "-") detail = hari; }
                    else if (idSasaran.includes("amount18A")) { detail = "Kiraan Berjadual"; }

                    if (detail) senaraiKeterangan.push(detail);
                }
            }
            inputTelahBayar.value = ""; 
        }
    } else { 
        inputTelahBayar.value = ""; 
    }
    
    // Paparkan keterangan di jadual rumusan (gabungkan jika ada lebih dari 1)
    if (inputKeterangan) {
        inputKeterangan.value = senaraiKeterangan.length > 0 ? senaraiKeterangan.join(" + ") : "-";
    }
    inputPatutBayar.value = formatRMRumusan(nilaiDiambil);
    kiraBakiBaris(selectElement);
}

function kiraBakiBaris(elemenDalamBaris) {
    const baris = elemenDalamBaris.closest('tr'); const patutBayar = unformatRMRumusan(baris.querySelector('.patut-bayar').value); const telahBayar = unformatRMRumusan(baris.querySelector('.telah-bayar').value);
    const inputBaki = baris.querySelector('.baki-baris'); const baki = telahBayar - patutBayar; inputBaki.setAttribute('data-value', baki);
    if (baki > 0) { inputBaki.value = formatRMRumusan(baki); inputBaki.style.color = "#28a745"; } 
    else if (baki < 0) { inputBaki.value = formatRMRumusan(Math.abs(baki)); inputBaki.style.color = "#d9534f"; } 
    else { inputBaki.value = formatRMRumusan(0); inputBaki.style.color = "#333"; }
    kiraJumlahKeseluruhanRumusan();
}

function buangBarisRumusan(butangPadam) { butangPadam.closest('tr').remove(); kiraJumlahKeseluruhanRumusan(); }
function resetRumusan() { document.getElementById('badanJadualRumusan').innerHTML = ''; kiraJumlahKeseluruhanRumusan(); }

function kiraJumlahKeseluruhanRumusan() {
    const semuaBaki = document.querySelectorAll('.baki-baris'); let jumlahBesar = 0;
    semuaBaki.forEach(input => { let nilaiSebenar = input.getAttribute('data-value'); if (nilaiSebenar !== null) jumlahBesar += parseFloat(nilaiSebenar); else jumlahBesar += unformatRMRumusan(input.value); });
    const teksJumlah = document.getElementById('jumlahKeseluruhanRumusan');
    if (jumlahBesar > 0) { teksJumlah.innerText = formatRMRumusan(jumlahBesar); teksJumlah.style.color = "#28a745"; } 
    else if (jumlahBesar < 0) { teksJumlah.innerText = formatRMRumusan(Math.abs(jumlahBesar)); teksJumlah.style.color = "#d9534f"; } 
    else { teksJumlah.innerText = formatRMRumusan(0); teksJumlah.style.color = "#1f4e79"; }
}

function autoMasukRumusan(idSasaran, contextCard) {
    const jadual = document.getElementById('badanJadualRumusan'); const senaraiSelect = jadual.querySelectorAll('select'); let barisWujud = null;
    senaraiSelect.forEach(select => { if (select.value === idSasaran) barisWujud = select; });
    let tempContext = activeCardContext; if (contextCard) activeCardContext = contextCard;
    if (barisWujud) { kemaskiniPatutBayar(barisWujud); } else {
        tambahBarisRumusan(); let semuaSelectBaru = jadual.querySelectorAll('select'); let selectTerbaru = semuaSelectBaru[semuaSelectBaru.length - 1];
        selectTerbaru.value = idSasaran; kemaskiniPatutBayar(selectTerbaru);
    }
    activeCardContext = tempContext;
}

// =====================================================
// 5. LAPORAN PENUH & PENYATA GAJI (PDF)
// =====================================================
function formatTitleCase(str) { return str.toLowerCase().split(' ').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' '); }
function formatIC(str) {
    let val = str.replace(/\D/g, ''); if (val.length <= 6) return val; if (val.length <= 8) return val.slice(0,6) + '-' + val.slice(6); 
    return val.slice(0,6) + '-' + val.slice(6,8) + '-' + val.slice(8,12);
}

// Butang 1: Jana Laporan Penuh (Tanpa Majikan)
function janaLaporanPenuh() {
    paparModalLaporan('penuh');
}

// Butang 2: Jana Penyata Gaji (Dengan Majikan)
function janaPenyataGaji() {
    paparModalLaporan('penyata');
}

// Enjin Utama Pop-Up
function paparModalLaporan(jenis) {
    let existingModal = document.getElementById('modalLaporanPenuh'); if(existingModal) existingModal.remove();
    
let htmlMajikan = "";
    // HANYA PAPARKAN JIKA JENIS ADALAH 'penyata'
    if (jenis === 'penyata') {
        htmlMajikan = `
        <h3 style="margin-top: 0; color: #1f4e79; border-bottom: 1px dashed #ccc; padding-bottom: 10px; font-size: 16px;">Maklumat Majikan / Syarikat / Organisasi</h3>
        <div style="margin-bottom: 15px; margin-top: 15px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #333;">Nama Majikan/Syarikat/Organisasi:</label>
            <input type="text" id="inputNamaMajikan" placeholder="Contoh: SYARIKAT ABC SDN BHD" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px;" oninput="this.value = this.value.toUpperCase()">
        </div>
        <div style="margin-bottom: 15px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #333;">No. Pendaftaran:</label>
            <input type="text" id="inputNoDaftarMajikan" placeholder="Contoh: 202301234567" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px;" oninput="this.value = this.value.toUpperCase()">
        </div>
        <div style="margin-bottom: 25px;">
            <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #333;">Tempoh Upah:</label>
            <input type="text" id="inputTempohUpah" placeholder="Contoh: Mei 2026 / 1 Mei - 31 Mei 2026" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px;" oninput="this.value = formatTitleCase(this.value)">
        </div>`;
    }

    let modalHtml = `
    <div id="modalLaporanPenuh" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); z-index: 999999; display: flex; justify-content: center; align-items: center; backdrop-filter: blur(2px);">
        <div style="background: white; padding: 25px 30px; border-radius: 10px; width: 90%; max-width: 450px; max-height: 90vh; overflow-y: auto; box-shadow: 0 10px 25px rgba(0,0,0,0.2); text-align: left; border-top: 5px solid #1f4e79;">
            
            ${htmlMajikan}

            <h3 style="margin-top: 0; color: #1f4e79; border-bottom: 1px dashed #ccc; padding-bottom: 10px; font-size: 16px;">Maklumat Pekerja</h3>
            <div style="margin-bottom: 15px; margin-top: 15px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #333;">Nama Pekerja:</label>
                <input type="text" id="inputNamaLaporan" placeholder="Contoh: Ahmad Bin Abu" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px;" oninput="this.value = formatTitleCase(this.value)">
            </div>
            <div style="margin-bottom: 25px;">
                <label style="display: block; font-weight: bold; margin-bottom: 5px; font-size: 13px; color: #333;">No. Kad Pengenalan:</label>
                <input type="text" id="inputICLaporan" placeholder="Contoh: 900101-01-1234" maxlength="14" style="width: 100%; padding: 10px; border: 1px solid #ccc; border-radius: 5px; box-sizing: border-box; font-size: 14px;" oninput="this.value = formatIC(this.value)">
            </div>

            <div style="display: flex; justify-content: flex-end; gap: 10px;">
                <button onclick="document.getElementById('modalLaporanPenuh').remove()" style="background: #6c757d; color: white; border: none; padding: 10px 15px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 13px;">Batal</button>
                <button onclick="teruskanJanaLaporan('${jenis}')" style="background: #1f4e79; color: white; border: none; padding: 10px 20px; border-radius: 5px; cursor: pointer; font-weight: bold; font-size: 13px;">Jana Cetakan</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalHtml);
}

// Tindakan Selepas Butang 'Jana Cetakan' (dalam pop-up) Ditekan
function teruskanJanaLaporan(jenis) {
    let namaMajikan = "";
    let noDaftarMajikan = "";
    let tempohUpah = ""; // Pembolehubah baharu
    
    // Tarik nilai majikan HANYA jika ia wujud (jenis = penyata)
    if (jenis === 'penyata') {
        namaMajikan = document.getElementById('inputNamaMajikan') ? document.getElementById('inputNamaMajikan').value.trim() : "";
        noDaftarMajikan = document.getElementById('inputNoDaftarMajikan') ? document.getElementById('inputNoDaftarMajikan').value.trim() : "";
        tempohUpah = document.getElementById('inputTempohUpah') ? document.getElementById('inputTempohUpah').value.trim() : ""; // Tangkap nilai Tempoh Upah
    }

    let namaPekerja = document.getElementById('inputNamaLaporan') ? document.getElementById('inputNamaLaporan').value.trim() : ""; 
    let icPekerja = document.getElementById('inputICLaporan') ? document.getElementById('inputICLaporan').value.trim() : "";
    
    document.getElementById('modalLaporanPenuh').remove(); 
    prosesJanaLaporanPenuh(namaMajikan, noDaftarMajikan, tempohUpah, namaPekerja, icPekerja); // Hantar ke enjin cetak
}

function prosesJanaLaporanPenuh(namaMajikan, noDaftarMajikan, tempohUpah, namaPekerja, icPekerja) { // Terima parameter baharu
    const senaraiKalkulator = [
        { id: "orpData", tajuk: "Kadar Upah Biasa (ORP)" }, { id: "bakiData", tajuk: "Baki Upah / Gaji" }, 
        { id: "otData", tajuk: "OT Hari Biasa" }, { id: "rhData", tajuk: "Kerja Hari Rehat (½ Hari @ Kurang)" }, 
        { id: "rhMoreData", tajuk: "Kerja Hari Rehat (Lebih ½ Hari)" }, { id: "sec18AData", tajuk: "Pengiraan Seksyen 18A" }, 
        { id: "otRHData", tajuk: "OT Hari Rehat" }, { id: "phData", tajuk: "Kerja Pada Hari Kelepasan" }, 
        { id: "otPHData", tajuk: "OT Hari Kelepasan" }, { id: "sickLeaveData", tajuk: "Bayaran Cuti Sakit" }, 
        { id: "kelayakanCutiData", tajuk: "Kelayakan Cuti Tahunan" }, { id: "annualLeaveData", tajuk: "Bayaran Cuti Tahunan" }, 
        { id: "ggnResBulan", tajuk: "Gaji Ganti Notis (Kiraan Bulan)" }, { id: "ggnRes18A", tajuk: "Gaji Ganti Notis (Kiraan Hari/Minggu)" }, 
        { id: "kelayakanSakitData", tajuk: "Kelayakan Cuti Sakit & Hospitalisasi" }, { id: "tbbData", tajuk: "Faedah Penamatan" }
    ];

    function getJalanKira(id, kadAsal) {
        let d = (el) => { let e = kadAsal.querySelector(`[id="${el}"], [data-original-id="${el}"]`); return e ? e.innerText.trim() : ""; };
        let v = (el) => { let e = kadAsal.querySelector(`[id="${el}"], [data-original-id="${el}"]`); return e ? e.value.trim() : ""; };
        let s = (el) => { let e = kadAsal.querySelector(`[id="${el}"], [data-original-id="${el}"]`); return e && e.options[e.selectedIndex] ? e.options[e.selectedIndex].text : ""; };
        function getDaysInMonthStr(monthYearStr) {
            if (!monthYearStr || monthYearStr === "-") return 30; let parts = monthYearStr.trim().split(/\s+/); if (parts.length < 2) return 30;
            let mNames = ["Januari","Februari","Mac","April","Mei","Jun","Julai","Ogos","September","Oktober","November","Disember"];
            let m = mNames.findIndex(n => n.toLowerCase() === parts[0].toLowerCase()); let y = parseInt(parts[1]); if (m > -1 && y) return new Date(y, m + 1, 0).getDate(); return 30; 
        }
        let html = ""; let globalUpah = v("orpTotalSalary") || formatRM((parseFloat(d("annualLeaveORP").replace(/[^0-9.]/g, '')) || 0) * 26) || "RM 0.00";

        switch(id) {
            case "orpData": html = `Formula:<br>Jumlah Upah ÷ 26<br>${d("orpResultTotal")} ÷ 26<br>= <b>${d("orpResult")}</b>`; break;
            case "bakiData": html = `Formula:<br>Telah Terima - Patut Terima<br>${v("orpTelahTerima")} - ${v("orpPatutTerima")}<br>= <b>${d("orpBakiAmount")}</b>`; break;
            case "otData": html = `Formula:<br>[(Jumlah Upah / 26) ÷ Jam Kerja] x 1.5 x Jam OT<br>[(${d("otResultTotal")} / 26) ÷ ${s("normalWorkingHours")}] x 1.5 x ${v("otHours")} jam<br>= <b>${d("otAmount")}</b>`; break;
            case "rhData": html = `Formula:<br>[(Jumlah Upah / 26) x 0.5] x Bilangan Hari<br>[(${d("rhResultTotal")} / 26) x 0.5] x ${v("rhDays")} hari<br>= <b>${d("rhAmount")}</b>`; break;
            case "rhMoreData": html = `Formula:<br>(Jumlah Upah / 26) x Bilangan Hari<br>(${d("rhMoreResultTotal")} / 26) x ${v("rhMoreDays")} hari<br>= <b>${d("rhMoreAmount")}</b>`; break;
            case "otRHData": html = `Formula:<br>[(Jumlah Upah / 26) ÷ Jam Kerja] x 2.0 x Jam OT<br>[(${d("otRHResultTotal")} / 26) ÷ ${s("otRHNormalWorkingHours")}] x 2.0 x ${v("otRHHours")} jam<br>= <b>${d("otRHAmount")}</b>`; break;
            case "phData": html = `Formula:<br>[(Jumlah Upah / 26) x 2.0] x Bilangan Hari<br>[(${d("phResultTotal")} / 26) x 2.0] x ${v("phDays")} hari<br>= <b>${d("phAmount")}</b>`; break;
            case "otPHData": html = `Formula:<br>[(Jumlah Upah / 26) ÷ Jam Kerja] x 3.0 x Jam OT<br>[(${d("otPHResultTotal")} / 26) ÷ ${s("otPHWorkingHours")}] x 3.0 x ${v("otPHHours")} jam<br>= <b>${d("otPHAmount")}</b>`; break;
            case "sickLeaveData": html = `Formula:<br>(Jumlah Upah / 26) x Hari Cuti Sakit<br>(${globalUpah} / 26) x ${v("sickLeaveDays")} hari<br>= <b>${d("sickLeaveAmount")}</b>`; break;
            case "annualLeaveData": html = `Formula:<br>(Jumlah Upah / 26) x Hari Cuti Tahunan<br>(${globalUpah} / 26) x ${v("annualLeaveDays")} hari<br>= <b>${d("annualLeaveAmount")}</b>`; break;
            case "sec18AData":
                let upah18 = d("resultTotalSalary"); let mm1 = d("month1Title"); let mm2 = d("month2Title");
                let amt1 = d("month1Amount"); let amt2 = d("month2Amount"); let d1 = getDaysInMonthStr(mm1); let d2 = getDaysInMonthStr(mm2);
                html = `Formula:<br>(Jumlah Upah / Bil. Hari Dalam Bulan) x Hari Bekerja<br><table class="clean-table">`;
                if (mm1 && mm1 !== "-") html += `<tr><td style="width:70%;">${mm1}: (${upah18} / ${d1}) x Hari Bekerja</td><td style="width:5%; text-align:center;">=</td><td style="font-weight:bold;">${amt1}</td></tr>`;
                if (mm2 && mm2 !== "-") html += `<tr><td style="width:70%;">${mm2}: (${upah18} / ${d2}) x Hari Bekerja</td><td style="width:5%; text-align:center;">=</td><td style="font-weight:bold;">${amt2}</td></tr>`;
                html += `</table>`; break;
            case "ggnRes18A":
                let gUpah = d("resUni18ATotal"); let gM1 = d("resUniM1Title"); let gM2 = d("resUniM2Title"); let gD1 = getDaysInMonthStr(gM1); let gD2 = getDaysInMonthStr(gM2); let gRate1 = d("resUniM1Daily"); let gRate2 = d("resUniM2Daily"); let gDays1 = d("resUniM1Days"); let gDays2 = d("resUniM2Days"); let gAmt1 = d("resUniM1Amount"); let gAmt2 = d("resUniM2Amount"); let gTotal = d("resUni18AAmount");
                html = `Formula:<br>(Jumlah Upah / Bil. Hari Dalam Bulan) x Hari Bekerja<br><br>`;
                if (gM1 && gM1 !== "-") html += `(A) ${gM1}:<br>(${gUpah} / ${gD1}) x Hari Bekerja<br>= ${gRate1} x ${gDays1}<br>= <b>${gAmt1}</b><br><br>`;
                if (gM2 && gM2 !== "-") { html += `(B) ${gM2}:<br>(${gUpah} / ${gD2}) x Hari Bekerja<br>= ${gRate2} x ${gDays2}<br>= <b>${gAmt2}</b><br><br><b>(A) + (B) = ${gTotal}</b>`; } else { html += `<b>Jumlah = ${gTotal}</b>`; } break;
            case "ggnResBulan": html = `Formula:<br>Jumlah Upah x Bil. Bulan Notis<br>${v("ggnUniTotal")} x ${v("ggnUniMonthVal")} bulan<br>= <b>${d("resUniMonthAmount")}</b>`; break;
            case "tbbData":
                let tempoh = d("tbbTempoh"); let yMatch = tempoh.match(/(\d+)\s*Tahun/i); let mMatch = tempoh.match(/(\d+)\s*Bulan/i);
                let years = yMatch ? parseInt(yMatch[1]) : 0; let months = mMatch ? parseInt(mMatch[1]) : 0;
                let kadarStr = d("tbbKadar"); let kadar = parseInt(kadarStr.replace(/[^0-9.]/g, '')) || 0; 
                let yDays = years * kadar; let mDays = parseFloat(((months / 12) * kadar).toFixed(2)); let totalHariLengkap = d("tbbHari");
                html = `(A) Formula Kadar Sehari (ORP):<br>Jumlah Upah 12 Bulan ÷ 365 hari<br>= ${d("tbbTotal12M")} ÷ 365<br>= <b>${d("tbbORP")}</b><br><br>
                (B) Formula Kelayakan Hari:<br>Tempoh perkhidmatan x Bil. hari layak setahun<br>[(${years} tahun x ${kadar} hari setahun)] + [(${months} bulan / 12 bulan setahun) x ${kadar}]<br>= ${yDays} hari + ${mDays} hari<br>= <b>${totalHariLengkap}</b><br><br>
                Formula Faedah:<br>ORP (A) x Kelayakan Hari (B)<br>= ${d("tbbORP")} x ${totalHariLengkap}<br>= <b>${d("tbbAmount")}</b>`; break;
        }
        if (html) return `<div class="formula-box"><div class="formula-title">JALAN KIRA & FORMULA:</div>${html}</div>`; return "";
    }

    let adaData = false; let htmlLaporan = "";
    let semuaKadAktif = document.querySelectorAll('.calculator-card:not(.hidden-template)');

    senaraiKalkulator.forEach(kalkulator => {
        semuaKadAktif.forEach(kadUtama => {
            try {
                let elemenKeputusan = kadUtama.querySelector(`[id="${kalkulator.id}"], [data-original-id="${kalkulator.id}"]`);
                if (elemenKeputusan && window.getComputedStyle(elemenKeputusan).display !== "none") {
                    adaData = true; 
                    let kadAsal = elemenKeputusan.closest('.pdf-module') || kadUtama;
                    let tajukKalkulator = kalkulator.tajuk; 
                    let mainH2 = kadUtama.querySelector('h2');
                    if (mainH2) {
                        tajukKalkulator = mainH2.innerText.replace(/\n/g, ' ').replace(/Kalkulator\s*/i, '').replace(/Bersepadu:\s*/i, '');
                        if (kadAsal.classList.contains('pdf-module')) {
                            let subH3 = kadAsal.querySelector('h3');
                            if (subH3) tajukKalkulator += " - " + subH3.innerText.split(':')[0]; 
                        }
                    }
                    if (kalkulator.id === "orpData") tajukKalkulator = "Kadar Upah Biasa (ORP)";
                    if (kalkulator.id === "bakiData") tajukKalkulator = "Baki Upah / Gaji";

                    let paramHtml = `<table class="param-table">`; 
                    let barisInput = kadAsal.querySelectorAll('.form-group');
                    barisInput.forEach(fg => {
                        if (window.getComputedStyle(fg).display === 'none') return; 
                        let labelEl = fg.querySelector('label'); let inputEl = fg.querySelector('input, select');
                        if (labelEl && inputEl) {
                            let namaLabel = labelEl.innerText.split('\n')[0]; 
                            if (kalkulator.id === "orpData" && (namaLabel.includes("Patut Terima") || namaLabel.includes("Telah Terima"))) return;
                            if (kalkulator.id === "bakiData" && (namaLabel.includes("Gaji Pokok") || namaLabel.includes("Elaun") || namaLabel.includes("Jumlah Upah"))) return;

                            let nilai = (inputEl.tagName.toLowerCase() === 'select' && inputEl.selectedIndex >= 0) ? inputEl.options[inputEl.selectedIndex].text : inputEl.value || "";
                            if (nilai && nilai.trim() !== "" && !nilai.includes("- Sila Pilih -")) {
                                if (kalkulator.id === "tbbData" && (namaLabel.includes("Jenis Upah (12 Bulan Terakhir)") || namaLabel.includes("Jumlah Upah Sebulan"))) return;
                                if (inputEl.type === 'date' || /^\d{4}-\d{2}-\d{2}$/.test(nilai)) { let p = nilai.split('-'); if (p.length === 3) nilai = `${p[2]}-${p[1]}-${p[0]}`; }
                                if (namaLabel.includes("(RM)") && !nilai.includes("RM")) {
                                    try { let calcVal = new Function('return ' + nilai.replace(/[^\d\.\+\-\*\/\(\)]/g, ''))(); if (calcVal > 0) nilai = /[+\-*/]/.test(nilai) ? `${nilai} = ${formatRM(calcVal)}` : formatRM(calcVal); } catch (err) {}
                                }
                                paramHtml += `<tr><td class="param-label">${namaLabel}</td><td class="param-value">${nilai}</td></tr>`;
                            }
                        }
                    });
                    paramHtml += `</table>`;

                    let jalanKiraHtml = getJalanKira(kalkulator.id, kadAsal); 
                    let salinanKeputusan = elemenKeputusan.cloneNode(true);
                    salinanKeputusan.querySelectorAll('button, h4, hr').forEach(b => b.remove()); 
                    
                    salinanKeputusan.querySelectorAll('.result-row, .section18a-header, .section18a-row').forEach(row => {
                        if (row.innerHTML.match(/\d{1,2}\/\d{1,2}\/\d{4}/)) row.innerHTML = row.innerHTML.replace(/(\d{1,2})\/(\d{1,2})\/(\d{4})/g, "$1-$2-$3");
                        row.querySelectorAll('[data-pdf-label]').forEach(el => { el.innerText = el.getAttribute('data-pdf-label'); });

                        let text = row.innerText || "";
                        if (text.includes("Jumlah Upah") && !text.includes("Jumlah Upah 12 Bulan") && !text.includes("Jumlah Bayaran Upah")) row.remove();
                        if (kalkulator.id === "tbbData" && (text.includes("Keseluruhan Upah (12 Bulan)") || text.includes("Kadar Upah Biasa (ORP)"))) row.remove();
                    });

                    if (kalkulator.id === "orpData" || kalkulator.id === "bakiData") {
                        let semuaBarisKeputusan = salinanKeputusan.querySelectorAll('.result-row');
                        if (semuaBarisKeputusan.length > 0) semuaBarisKeputusan[semuaBarisKeputusan.length - 1].classList.add('highlight-row');
                    }

                    if (kalkulator.id === "ggnRes18A") {
                        let getD = (el) => { let e = kadAsal.querySelector(`[id="${el}"], [data-original-id="${el}"]`); return e ? e.innerText.trim() : ""; };
                        let m1 = getD("resUniM1Title"); let m2 = getD("resUniM2Title"); let h1 = getD("resUniM1Days"); let h2 = getD("resUniM2Days"); let r1 = getD("resUniM1Daily"); let r2 = getD("resUniM2Daily"); let a1 = getD("resUniM1Amount"); let a2 = getD("resUniM2Amount");
                        let stEl = kadAsal.querySelector("#ggnStatusNotis, [data-original-id='ggnStatusNotis']"); let lblTamat = (stEl && stEl.value === "tiada") ? "Tamat Tempoh Indemniti" : "Tarikh Akhir Notis";
                        let tDateStr = getD("resUni18AEnd"); let tDate = tDateStr ? tDateStr.replace(/\//g, "-") : "";  let tTotal = getD("resUni18AAmount");
                        salinanKeputusan.innerHTML = `<div class="result-row" style="margin-bottom:8px;"><span>${lblTamat}</span><strong>${tDate}</strong></div><table class="clean-table"><tr><td></td><td style="font-weight:bold;">${m1}</td><td style="font-weight:bold;">${m2}</td></tr><tr><td>Hari Bekerja</td><td>${h1}</td><td>${h2}</td></tr><tr><td>Kadar Sehari</td><td>${r1}</td><td>${r2}</td></tr><tr><td>Bayaran</td><td>${a1}</td><td>${a2}</td></tr></table><div class="result-row highlight-row" style="margin-top:10px;"><span>Bayaran Gaji Ganti Notis</span><strong>${tTotal}</strong></div>`;
                    }
                    if (kalkulator.id === "sec18AData") {
                        let getD = (el) => { let e = kadAsal.querySelector(`[id="${el}"], [data-original-id="${el}"]`); return e ? e.innerText.trim() : ""; };
                        let m1 = getD("month1Title"); let m2 = getD("month2Title"); let h1 = getD("month1Days"); let h2 = getD("month2Days"); let r1 = getD("month1Daily"); let r2 = getD("month2Daily"); let a1 = getD("month1Amount"); let a2 = getD("month2Amount"); let tTotal = getD("amount18A");
                        salinanKeputusan.innerHTML = `<table class="clean-table" style="margin-top:5px;"><tr><td></td><td style="font-weight:bold;">${m1}</td><td style="font-weight:bold;">${m2}</td></tr><tr><td>Hari Bekerja</td><td>${h1}</td><td>${h2}</td></tr><tr><td>Kadar Sehari</td><td>${r1}</td><td>${r2}</td></tr><tr><td>Bayaran</td><td>${a1}</td><td>${a2}</td></tr></table><div class="result-row highlight-row" style="margin-top:10px;"><span>Jumlah Bayaran Upah</span><strong>${tTotal}</strong></div>`;
                    }
                    htmlLaporan += `<div class="report-box"><div class="report-header">${tajukKalkulator}</div><div class="report-section-title">PARAMETER / INPUT:</div>${paramHtml}${jalanKiraHtml}<div class="report-section-title" style="margin-top:10px;">KEPUTUSAN:</div><div class="compact-result">${salinanKeputusan.innerHTML}</div></div>`;
                }
            } catch (error) { console.error("Ralat pada kalkulator:", kalkulator.id, error); }
        });
    });

let rumusanTbody = document.getElementById('badanJadualRumusan');
    if (rumusanTbody && rumusanTbody.children.length > 0) {
        adaData = true; 
        let rumusanHTML = `<table style="width: 100%; border-collapse: collapse; font-size: 11px; margin-bottom: 12px; border: 1px solid #ccc;"><thead><tr style="background: #1f4e79; color: white;"><th style="padding: 8px; text-align: left; border: 1px solid #ccc; width:28%;">Jenis Bayaran</th><th style="padding: 8px; text-align: center; border: 1px solid #ccc; width:17%;">Keterangan</th><th style="padding: 8px; text-align: right; border: 1px solid #ccc; width:16%;">Patut Bayar</th><th style="padding: 8px; text-align: right; border: 1px solid #ccc; width:16%;">Telah Bayar</th><th style="padding: 8px; text-align: right; border: 1px solid #ccc; width:16%;">Baki (+/-)</th></tr></thead><tbody>`;
        let barisRumusan = rumusanTbody.querySelectorAll('tr');
        barisRumusan.forEach(tr => {
            let select = tr.querySelector('select'); let jenis = select.options[select.selectedIndex].text;
            let inputKeterangan = tr.querySelector('.keterangan-baris'); let ket = inputKeterangan ? inputKeterangan.value : "-";
            let patut = tr.querySelector('.patut-bayar').value; let telah = tr.querySelector('.telah-bayar').value;
            let bakiInput = tr.querySelector('.baki-baris'); let baki = bakiInput.value; let bakiWarna = bakiInput.style.color;
            rumusanHTML += `<tr><td style="padding: 8px; border: 1px solid #ccc;">${jenis}</td><td style="padding: 8px; text-align: center; border: 1px solid #ccc;">${ket}</td><td style="padding: 8px; text-align: right; border: 1px solid #ccc; font-weight: bold;">${patut}</td><td style="padding: 8px; text-align: right; border: 1px solid #ccc;">${telah || "RM 0.00"}</td><td style="padding: 8px; text-align: right; border: 1px solid #ccc; color: ${bakiWarna}; font-weight: bold;">${baki}</td></tr>`;
        });
        let jumlahTeks = document.getElementById('jumlahKeseluruhanRumusan');
        rumusanHTML += `</tbody></table><div style="text-align: right; margin-top: 10px; padding: 12px; background: #f4f6f9; border-radius: 6px; border: 1px solid #ccc;"><span style="font-size: 12px; font-weight: bold; color: #333;">Jumlah Keseluruhan Terlebih / Terkurang Bayar: </span><strong style="font-size: 16px; color: ${jumlahTeks.style.color}; margin-left: 10px;">${jumlahTeks.innerText}</strong></div>`;
        htmlLaporan += `<div class="report-box" style="grid-column: 1 / -1; border-left: 5px solid #1f4e79; margin-top: 10px;"><div class="report-header" style="background:#e8eaed; color:#1a1a1a;">RUMUSAN AKHIR BAYARAN</div>${rumusanHTML}</div>`;
    }

    if (!adaData) { alert("Peringatan: Sila buat sekurang-kurangnya satu pengiraan atau isi Jadual Rumusan terlebih dahulu."); return; }
    
    let tarikhHariIni = new Date().toLocaleDateString('ms-MY', { day: 'numeric', month: 'long', year: 'numeric' }); 
    
    // --- MULA KOD MAKLUMAT MAJIKAN & PEKERJA (PDF) ---
    let maklumatSyarikatPekerjaHTML = "";
    if (namaMajikan !== "" || noDaftarMajikan !== "" || tempohUpah !== "" || namaPekerja !== "" || icPekerja !== "") {
        maklumatSyarikatPekerjaHTML = `<div class="report-box" style="grid-column: 1 / -1; margin-bottom: 15px; border-left: 5px solid #1f4e79;">
            <div class="report-header" style="background:#e8eaed; color:#1a1a1a; text-align: left; padding-left: 10px;">MAKLUMAT MAJIKAN & PEKERJA</div>
            <table class="param-table" style="margin-bottom: 0;">`;
        
        if (namaMajikan !== "" || noDaftarMajikan !== "" || tempohUpah !== "") {
            maklumatSyarikatPekerjaHTML += `<tr><td class="param-label" style="width: 25%; font-weight: bold;">Nama Majikan/Syarikat</td><td class="param-value" style="text-align: left; font-weight: normal; color: #111;">: ${namaMajikan || '-'}</td></tr>
            <tr><td class="param-label" style="width: 25%; font-weight: bold;">No. Pendaftaran</td><td class="param-value" style="text-align: left; font-weight: normal; color: #111;">: ${noDaftarMajikan || '-'}</td></tr>
            <tr><td class="param-label" style="width: 25%; font-weight: bold;">Tempoh Upah</td><td class="param-value" style="text-align: left; font-weight: normal; color: #111;">: ${tempohUpah || '-'}</td></tr>`;
        }

        if ((namaMajikan !== "" || noDaftarMajikan !== "" || tempohUpah !== "") && (namaPekerja !== "" || icPekerja !== "")) {
             maklumatSyarikatPekerjaHTML += `<tr><td colspan="2"><hr style="border-top: 1px dashed #ccc; margin: 8px 0;"></td></tr>`;
        }

        if (namaPekerja !== "" || icPekerja !== "") {
             maklumatSyarikatPekerjaHTML += `<tr><td class="param-label" style="width: 25%; font-weight: bold;">Nama Pekerja</td><td class="param-value" style="text-align: left; font-weight: normal; color: #111;">: ${namaPekerja || '-'}</td></tr>
            <tr><td class="param-label" style="width: 25%; font-weight: bold;">No. Kad Pengenalan</td><td class="param-value" style="text-align: left; font-weight: normal; color: #111;">: ${icPekerja || '-'}</td></tr>`;
        }

        maklumatSyarikatPekerjaHTML += `</table></div>`;
    }
    // --- TAMAT KOD MAKLUMAT MAJIKAN ---

    let cssBaru = `.floating-action-bar { position: fixed; top: 25px; right: 25px; display: flex; z-index: 9999; align-items: center; } .kebab-btn { background: #0d6efd; border: none; border-radius: 50%; width: 45px; height: 45px; font-size: 24px; cursor: pointer; color: white; box-shadow: 0 4px 12px rgba(0,0,0,0.3); transition: 0.2s; display: flex; justify-content: center; align-items: center; line-height: 1; padding-bottom: 5px; } .kebab-btn:hover { background: #0b5ed7; transform: scale(1.05); } .kebab-dropdown { display: none; position: absolute; right: 0; top: 115%; background-color: white; min-width: 170px; box-shadow: 0px 4px 15px rgba(0,0,0,0.2); border-radius: 8px; overflow: hidden; border: 1px solid #ddd; text-align: left; } .kebab-dropdown a { color: #333; padding: 12px 16px; text-decoration: none; display: block; font-size: 13px; font-weight: bold; transition: 0.2s; } .kebab-dropdown a:hover { background-color: #f4f6f9; } .kebab-dropdown a:first-child { border-bottom: 1px solid #eee; } @media print { .floating-action-bar, .print-btn-container { display: none !important; } }`;
    let cetakHTML = `<!DOCTYPE html><html lang="ms"><head><meta charset="UTF-8"><title>Laporan Pengiraan Akta Kerja 1955</title><style>* { font-family: 'Segoe UI', Arial, sans-serif; box-sizing: border-box; } body { color: #111; line-height: 1.35; padding: 20px; font-size: 11px; background: #fdfdfd; margin-bottom: 80px; } .main-title { text-align: center; margin-bottom: 2px; font-size: 18px; font-weight: bold; border-bottom: 2px solid #222; padding-bottom: 6px; text-transform: uppercase; color: #000; letter-spacing: 1px; } .subtitle { text-align: center; color: #555; margin-top: 5px; margin-bottom: 25px; font-size: 11px; } .grid-container { display: grid; grid-template-columns: repeat(2, 1fr); gap: 15px; align-items: start; } .report-box { border: 1px solid #aaa; padding: 12px; border-radius: 6px; page-break-inside: avoid; background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,0.05); } .report-header { font-size: 13px; font-weight: 800; text-align: center; background: #e8eaed; padding: 8px; border-bottom: 1px solid #aaa; margin: -12px -12px 12px -12px; border-radius: 6px 6px 0 0; text-transform: uppercase; color: #1a1a1a; letter-spacing: 0.5px; } .report-section-title { font-size: 10px; font-weight: bold; color: #1f4e79; letter-spacing: 0.5px; border-bottom: 1px dashed #ccc; padding-bottom: 3px; margin-bottom: 6px; text-transform: uppercase; } .param-table { width: 100%; font-size: 11px; border-collapse: collapse; margin-bottom: 12px; } .param-label { padding: 3px 0; color: #444; width: 55%; } .param-value { padding: 3px 0; text-align: right; font-weight: 700; color: #000; } .formula-box { background-color: #f4f6f9; border-left: 3px solid #1f4e79; padding: 10px 12px; margin: 12px 0; font-size: 11px; color: #222; border-radius: 0 4px 4px 0; } .formula-title { font-weight: bold; font-size: 10px; color: #1f4e79; margin-bottom: 6px; letter-spacing: 0.5px; } .compact-result .result-row { display: flex; justify-content: space-between; margin-bottom: 5px; align-items: center; flex-wrap: wrap; } .compact-result .result-row span { font-size: 11px; color: #333; } .compact-result .result-row strong, #orpBakiAmount { font-size: 12px; color: #000; white-space: nowrap; } .compact-result hr { display: none !important; } .clean-table { width: 100%; border-collapse: collapse; font-size: 11px; border: none; margin-bottom: 5px; } .clean-table td { padding: 4px 2px; border: none; color: #222; } .highlight-row, .result-row[style*="background"] { background: transparent !important; border: 1.5px solid #1f4e79; padding: 8px !important; border-radius: 4px; margin-top: 10px; } .highlight-row span, .result-row[style*="background"] span { color: #1f4e79 !important; font-weight: bold; } .highlight-row strong, .result-row[style*="background"] strong { color: #1f4e79 !important; font-size: 14px !important; } @media print { body { padding: 0; background: #fff; margin-bottom: 0; } .report-box { border: 1px solid #aaa; box-shadow: none; } .report-header, .formula-box, .highlight-row, .result-row[style*="background"] { -webkit-print-color-adjust: exact; print-color-adjust: exact; } } ${cssBaru} </style></head><body><div class="floating-action-bar"><div style="position: relative;"><button class="kebab-btn" onclick="var d = document.getElementById('kebabDropdown'); d.style.display = d.style.display === 'block' ? 'none' : 'block';">&#8942;</button><div id="kebabDropdown" class="kebab-dropdown"><a href="#" onclick="window.close(); return false;">✏️ Kemaskini</a><a href="#" onclick="window.print(); window.close(); return false;">🖨️ Cetak Laporan</a></div></div></div><h1 class="main-title">PENGIRAAN DI BAWAH AKTA KERJA 1955</h1><p class="subtitle">Tarikh Janaan: ${tarikhHariIni}</p><div class="grid-container">${maklumatSyarikatPekerjaHTML}${htmlLaporan}</div><div class="print-btn-container" style="text-align: center; margin-top: 30px; grid-column: 1 / -1;"><p style="font-size: 11px; color:#666; font-style: italic;">*Untuk simpan dalam peranti, sila pilih <b>'Save as PDF'</b> pada tetingkap pencetak (Destination).</p></div><script>window.onafterprint = function() { setTimeout(function() { window.close(); }, 500); };<\\/script></body></html>`;
    
    let tetingkapCetak = window.open('', '_blank'); 
    if (!tetingkapCetak) { alert("Pop-up disekat oleh pelayar web (browser) anda. Sila benarkan 'Pop-ups and redirects' untuk laman ini bagi melihat laporan."); return; }
    tetingkapCetak.document.write(cetakHTML); tetingkapCetak.document.close(); tetingkapCetak.focus(); 
}

// =====================================================
// 6. SISTEM LOGIN & RESET 
// =====================================================
function paparLogMasuk() { document.getElementById("loginOverlay").style.display = "flex"; document.getElementById("loginPassword").value = ""; document.getElementById("loginError").style.display = "none"; }
function semakLogin() {
    let inputLaluan = document.getElementById("loginPassword").value; let ralatMesej = document.getElementById("loginError"); let kataLaluanSebenar = "kerja1955"; 
    if (inputLaluan === kataLaluanSebenar) {
        document.getElementById("loginOverlay").style.display = "none"; let btn = document.getElementById("butangAuth");
        if (btn) { btn.innerHTML = "⏻ Log Keluar"; btn.style.background = "#dc3545"; btn.style.borderColor = "#dc3545"; btn.setAttribute("onclick", "logKeluar()"); }
    } else { ralatMesej.style.display = "block"; }
}
document.addEventListener("DOMContentLoaded", function() { let kotakPassword = document.getElementById("loginPassword"); if (kotakPassword) { kotakPassword.addEventListener("keypress", function(event) { if (event.key === "Enter") semakLogin(); }); } });
function logKeluar() { let btn = document.getElementById("butangAuth"); if (btn) { btn.innerHTML = "⏻ Log Masuk"; btn.style.background = "#1f4e79"; btn.style.borderColor = "#1f4e79"; btn.setAttribute("onclick", "paparLogMasuk()"); } alert("Anda telah berjaya log keluar dari sistem."); }
function resetSemua() {
    let sah = confirm("Adakah anda pasti mahu memadam KESEMUA data pengiraan? Tindakan ini tidak boleh diundur.");
    if (sah) {
        // 1. Buang semua kad klon
        let semuaKadAktif = document.querySelectorAll('.calculator-card:not(.hidden-template):not(.rumusan-card)');
        semuaKadAktif.forEach(kad => kad.remove());
        
        // 2. Kosongkan jadual rumusan
        resetRumusan();
        
        // 3. SEMBUNYIKAN SEMULA kad rumusan (Fungsi Baharu)
        let kadRumusan = document.querySelector('.rumusan-card');
        if (kadRumusan) {
            kadRumusan.style.display = "none";
        }
        
        // 4. Scroll kembali ke atas
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
}

// =====================================================
// 7. ENGINE 2026: CLONE & MULTI-INSTANCE
// =====================================================
window.tambahKalkulator = function(templateId) {
    document.querySelectorAll('.menu-btn').forEach(btn => btn.classList.remove('active'));
    let activeBtn = document.querySelector(`.menu-btn[onclick*="${templateId}"]`);
    if(activeBtn) activeBtn.classList.add('active');

    let templateCard = document.getElementById('card-' + templateId);
    if (!templateCard) return alert('Kalkulator tidak ditemui!');

    let grid = document.getElementById('active-calculators-grid');
    let rumusanCard = document.querySelector('.rumusan-card');
    
    let clone = templateCard.cloneNode(true);
    clone.classList.remove('hidden-template');
    
    let uniqueSuffix = '_' + Math.random().toString(36).substr(2, 9);
    clone.id = clone.id + uniqueSuffix;
    clone.style.position = "relative";

    let closeBtn = document.createElement('button');
    closeBtn.className = "close-card-btn";
    closeBtn.innerHTML = "X";
    closeBtn.onclick = function() { 
        clone.remove(); // 1. Padam kad yang dipangkah
        
        // 2. Semak jika masih ada kad kalkulator lain yang aktif di skrin
        let kadTinggal = document.querySelectorAll('.calculator-card:not(.hidden-template):not(.rumusan-card)');
        
        // 3. Jika sudah tiada langsung kad kalkulator, sembunyikan Rumusan
        if (kadTinggal.length === 0) {
            let kadRumusan = document.querySelector('.rumusan-card');
            if (kadRumusan) {
                kadRumusan.style.display = "none";
            }
        }
    };
    clone.appendChild(closeBtn);

    let allElementsWithId = clone.querySelectorAll('[id]');
    allElementsWithId.forEach(el => {
        el.setAttribute('data-original-id', el.id);
        el.id = el.id + uniqueSuffix;
        // Kosongkan semua input untuk kad baharu pada peringkat awal
        if(el.tagName === 'INPUT' && el.type !== 'button') el.value = "";
        if(el.tagName === 'STRONG' || el.tagName === 'SPAN') {
            if(el.innerText.includes('RM')) el.innerText = 'RM 0.00';
            else if(el.innerText !== 'Kadar Sehari' && el.innerText !== 'Bayaran' && el.innerText !== 'Hari Bekerja') el.innerText = '-';
        }
    });
    
    let allElementsWithName = clone.querySelectorAll('[name]');
    allElementsWithName.forEach(el => {
        el.setAttribute('name', el.getAttribute('name') + uniqueSuffix);
    });

    // ==============================================================
    // PENAMBAHBAIKAN UX: WARISI GAJI & ELAUN DARI KALKULATOR TERDAHULU
    // ==============================================================
    let currentBasic = "";
    let currentAllowance = "";
    
    // Fungsi kecil (helper) untuk ekstrak gaji dari mana-mana kad
    function extractSalaryFromCard(kad) {
        for (let mapKey of Object.keys(salaryMap)) {
            let sourceBasic = kad.querySelector(`[data-original-id="${mapKey}"]`);
            if (sourceBasic && sourceBasic.value) {
                let semakNilai = evaluateSmartMath(sourceBasic.value);
                if (semakNilai > 0) {
                    let allowVal = "";
                    let sourceAllowId = salaryMap[mapKey][0];
                    let sourceAllow = kad.querySelector(`[data-original-id="${sourceAllowId}"]`);
                    if (sourceAllow) allowVal = sourceAllow.value;
                    return { basic: sourceBasic.value, allow: allowVal };
                }
            }
        }
        return null;
    }

    // 1. SASARAN UTAMA: Cari dari kad yang paling akhir disentuh/ditaip oleh user (activeCardContext)
    if (activeCardContext && !activeCardContext.classList.contains('hidden-template') && !activeCardContext.classList.contains('rumusan-card')) {
        let extracted = extractSalaryFromCard(activeCardContext);
        if (extracted) {
            currentBasic = extracted.basic;
            currentAllowance = extracted.allow;
        }
    }

    // 2. SANDARAN: Jika tak jumpa di kad terakhir, cari dari semua kad aktif (dari Bawah ke Atas / Terkini ke Lama)
    if (currentBasic === "") {
        let kadAktifLain = Array.from(document.querySelectorAll('.calculator-card:not(.hidden-template):not(.rumusan-card)'));
        for (let i = kadAktifLain.length - 1; i >= 0; i--) {
            let extracted = extractSalaryFromCard(kadAktifLain[i]);
            if (extracted) {
                currentBasic = extracted.basic;
                currentAllowance = extracted.allow;
                break; // Berhenti mencari sebaik sahaja jumpa
            }
        }
    }

    // 3. Jika gaji berjaya ditemui, suntik terus ke dalam kalkulator klon baharu
    if (currentBasic !== "") {
        for (let targetKey of Object.keys(salaryMap)) {
            let targetBasic = clone.querySelector(`[data-original-id="${targetKey}"]`);
            let targetAllowId = salaryMap[targetKey][0];
            let targetAllow = clone.querySelector(`[data-original-id="${targetAllowId}"]`);
            let targetTotalId = salaryMap[targetKey][1];
            let targetTotal = clone.querySelector(`[data-original-id="${targetTotalId}"]`);

            if (targetBasic) {
                targetBasic.value = currentBasic;
                if (targetAllow && currentAllowance !== "") {
                    targetAllow.value = currentAllowance;
                }
                if (targetTotal) {
                    let calcBasic = evaluateSmartMath(currentBasic);
                    let calcAllow = currentAllowance !== "" ? evaluateSmartMath(currentAllowance) : 0;
                    targetTotal.value = "RM " + (calcBasic + calcAllow).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                }
            }
        }
    }
    // ==============================================================

    let allButtons = clone.querySelectorAll('button');
    allButtons.forEach(btn => {
        let oriClick = btn.getAttribute('onclick');
        if (oriClick && !oriClick.includes('clone.remove')) {
            let funcName = oriClick.replace(/\(.*?\)/, '').trim(); 
            btn.removeAttribute('onclick');
            btn.setAttribute('data-action-func', oriClick);
            btn.addEventListener('click', function(e) {
                activeCardContext = clone; 
                try { if (typeof window[funcName] === 'function') window[funcName](e); } finally { activeCardContext = null; }
            });
        }
    });

    if (rumusanCard) grid.insertBefore(clone, rumusanCard); else grid.appendChild(clone);
    
    // Munculkan kad rumusan apabila kalkulator dipilih
    if (rumusanCard) {
        rumusanCard.style.display = "block";
    }

    // ------------------------------------------------------------------------

    clone.scrollIntoView({ behavior: 'smooth', block: 'center' });
};
