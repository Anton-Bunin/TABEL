/**
 * Данные графиков бригад
 */
const schedules = {
    1: { start: '2024-12-30', pattern: ['Д', 'Д', '', 'Н', 'Н', '', '', ''] },
    2: { start: '2025-01-01', pattern: ['Д', 'Д', '', 'Н', 'Н', '', '', ''] },
    3: { start: '2025-01-03', pattern: ['Д', 'Д', '', 'Н', 'Н', '', '', ''] },
    4: { start: '2024-12-28', pattern: ['Д', 'Д', '', 'Н', 'Н', '', '', ''] }
};

/**
 * Основная функция отрисовки
 */
function render() {
    const monthInput = document.getElementById('month');
    const yearInput = document.getElementById('year');
    const monthsCountInput = document.getElementById('monthsCount');
    const daysFilterInput = document.getElementById('daysFilter');

    if (!monthInput || !yearInput) return;

    const month = parseInt(monthInput.value);
    const year = parseInt(yearInput.value);
    const monthsCount = parseInt(monthsCountInput.value) || 1;
    const daysFilter = daysFilterInput.value;

    const container = document.getElementById('tables-container');
    container.innerHTML = ''; 

    for (let i = 0; i < monthsCount; i++) {
        const currentMonth = ((month + i - 1) % 12) + 1;
        const currentYear = year + Math.floor((month + i - 1) / 12);
        container.appendChild(createTable(currentMonth, currentYear, daysFilter));
    }
}

function createTable(month, year, daysFilter) {
    const table = document.createElement('table');
    const daysInMonth = new Date(year, month, 0).getDate();
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];

    let filteredDays = [];
    if (daysFilter.trim() !== "") {
        filteredDays = daysFilter.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d));
    }

    let html = `<thead><tr><th colspan="${(filteredDays.length > 0 ? filteredDays.length : daysInMonth) + 2}" class="month-title">${monthNames[month - 1]} ${year} Г.</th></tr>`;
    html += `<tr><th class="brigade-col">Бригада</th>`;

    for (let d = 1; d <= daysInMonth; d++) {
        if (filteredDays.length === 0 || filteredDays.includes(d)) {
            const date = new Date(year, month - 1, d);
            const dayOfWeek = date.getDay();
            const isWeekend = (dayOfWeek === 0 || dayOfWeek === 6);
            html += `<th class="${isWeekend ? 'weekend' : ''}">${d}</th>`;
        }
    }
    html += `<th>Итого</th></tr></thead><tbody>`;

    for (let bId in schedules) {
        html += `<tr><td class="brigade-col">Бриг. № ${bId}</td>`;
        let dayCount = 0;
        let nightCount = 0;

        for (let d = 1; d <= daysInMonth; d++) {
            const res = getShift(bId, d, month, year);
            if (res === 'Д') dayCount++;
            if (res === 'Н') nightCount++;

            if (filteredDays.length === 0 || filteredDays.includes(d)) {
                let cellClass = '';
                if (res === 'Д') cellClass = 'day';
                if (res === 'Н') cellClass = 'night';

                if (res === 'Д' || res === 'Н') {
                    cellClass += ' clickable';
                }

                const dStr = String(d).padStart(2, '0');
                const mStr = String(month).padStart(2, '0');
                const dateStr = `${year}-${mStr}-${dStr}`;

                html += '<td class="' + cellClass + '" data-date="' + dateStr + '" data-brigade="' + bId + '" data-type="' + res + '">' + res + '</td>';
            } // конец if filteredDays
        } // конец цикла for d (дни)

        html += `<td class="total">У:${dayCount} Н:${nightCount}</td></tr>`;
    } // конец цикла for bId (бригады)

    html += `</tbody>`;
    table.innerHTML = html;
    return table;
} // конец функции createTable

/**
 * Функция бронирования
 */
function reserveShift(date, brigade, type, element) {
    const typeName = (type === 'Д') ? "ДНЕВНУЮ" : "НОЧНУЮ";
    if (confirm("Забронировать " + typeName + " смену на " + date + "?\n(Бригада №" + brigade + ")")) {
        element.style.backgroundColor = "#fff9c4"; 
        alert("Бронируем: " + date + ", Бригада " + brigade);
    }
}
/**
 * Инициализация и события
 */
function initApp() {
    const ids = ['month', 'year', 'monthsCount', 'daysFilter'];
    ids.forEach(function(id) {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', render);
        }
    });
    // Слушатель кликов по таблице (Делегирование)
    document.addEventListener('click', function(e) {
        if (e.target && e.target.classList.contains('clickable')) {
            const date = e.target.getAttribute('data-date');
            const brigade = e.target.getAttribute('data-brigade');
            const type = e.target.getAttribute('data-type');
            reserveShift(date, brigade, type, e.target);
        }
    });
    render(); // Первый запуск
}
// Запуск при загрузке
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initApp);
} else {
    initApp();
}

// Глобальный доступ
window.render = render;
