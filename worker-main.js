/** 
 * АНАЛОГ ТАБЛИЦЫ "СГрафик_работы" 
 * Поля: name (название схемы), brigade (номер), startDate (дата начала), cycle (часы по дням)
 */
const SETTINGS = [
    { name: " ", brigade: 1, startDate: "2021-12-31", cycle: ["У", "У", "", "Н", "Н", "", "", ""] },
    { name: " ", brigade: 2, startDate: "2022-01-02", cycle: ["У", "У", "", "Н", "Н", "", "", ""] },
    { name: " ", brigade: 3, startDate: "2021-12-27", cycle: ["У", "У", "", "Н", "Н", "", "", ""] },
    { name: " ", brigade: 4, startDate: "2021-12-29", cycle: ["У", "У", "", "Н", "Н", "", "", ""] }
];

/**
 * ЛОГИКА VBA ФУНКЦИИ
 */
function getHours(schemaName, brigadeNum, targetDate) {
    // Ищем настройки для пары Схема + Бригада
    const cfg = SETTINGS.find(s => s.name === schemaName && s.brigade === brigadeNum);
    if (!cfg) return "";

    const start = new Date(cfg.startDate);
    const cycleLen = cfg.cycle.length;

    // Считаем разницу в днях (datadelta)
    const diffInMs = targetDate.setHours(0,0,0,0) - start.setHours(0,0,0,0);
    const dataDelta = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    // Находим позицию в цикле (Mod)
    let cyclePos = dataDelta % cycleLen;
    if (cyclePos < 0) cyclePos += cycleLen; // Коррекция для дат до startDate

    return cfg.cycle[cyclePos];
}

// Функция для установки текущей даты при загрузке
function setCurrentDate() {
    const now = new Date();
    
    // Month возвращает 0-11, поэтому прибавляем 1
    document.getElementById('month').value = now.getMonth() + 1; 
    document.getElementById('year').value = now.getFullYear();
}

function render() 
{
    const startMonth = parseInt(document.getElementById('month').value);
    const startYear = parseInt(document.getElementById('year').value);
    const monthsCount = parseInt(document.getElementById('monthsCount').value);
    
    // Читаем фильтр: разбиваем строку по запятой, превращаем в числа и фильтруем мусор
    const filterInput = document.getElementById('daysFilter').value;
    const selectedDays = filterInput ? filterInput.split(',').map(d => parseInt(d.trim())).filter(d => !isNaN(d)) : [];

    const container = document.getElementById('tables-container');
    container.innerHTML = ""; 

    for (let i = 0; i < monthsCount; i++) {
        let currentPeriod = new Date(startYear, (startMonth - 1) + i, 1);
        let m = currentPeriod.getMonth() + 1;
        let y = currentPeriod.getFullYear();

        // Определяем, какие дни рисовать
        const daysInMonth = new Date(y, m, 0).getDate();
        let daysToRender = [];
        
        if (selectedDays.length > 0) {
            // Если фильтр есть — берем только те дни, что существуют в этом месяце
            daysToRender = selectedDays.filter(d => d >= 1 && d <= daysInMonth);
        } else {
            // Если фильтра нет — рисуем стандартно 1..31
            for (let d = 1; d <= daysInMonth; d++) daysToRender.push(d);
        }

        const tableWrapper = document.createElement('div');
        tableWrapper.className = "month-wrapper";
        tableWrapper.innerHTML = `
            <h3>${currentPeriod.toLocaleString('ru-ru', {month: 'long', year: 'numeric'})}</h3>
            <table>
                <thead><tr class="days-header"></tr></thead>
                <tbody class="tabel-body"></tbody>
            </table>
        `;
        container.appendChild(tableWrapper);
        
        // Передаем список дней в функцию заполнения
        fillTable(tableWrapper, m, y, daysToRender);
    }
		
}

// Вспомогательная функция для классов (чтобы не дублировать код)
function getClasses(date, isCurrentMonth, todayDay, isHeader = false) 
	{
			let classes = [];
		
		// Проверка выходного
		if (date.getDay() === 0 || date.getDay() === 6) {
			// Если это заголовок — яркий, если тело — приглушенный
			classes.push(isHeader ? 'holiday_header' : 'holiday_body');
		}
		
		// Проверка текущего дня
		if (isCurrentMonth && date.getDate() === todayDay) {
			classes.push('today-cell');
		}
		
		return classes.join(' ');
	}
	
function fillTable(wrapper, month, year, daysToRender) 
	{
		const headerRow = wrapper.querySelector('.days-header');
		const tbody = wrapper.querySelector('.tabel-body');
		const today = new Date();
		const isCurrentMonth = (today.getMonth() + 1 === month && today.getFullYear() === year);

		headerRow.innerHTML = '<th class="brigade-col">Бригада</th>';
		
		// Рисуем заголовки только для выбранных дней
		daysToRender.forEach(d => {
			const date = new Date(year, month - 1, d);
			const classes = getClasses(date, isCurrentMonth, today.getDate(), true);
			headerRow.innerHTML += `<th class="${classes}">${d}</th>`;
		});
		
		 // Добавляем заголовок Итого
		headerRow.innerHTML += `<th class="brigade-col" style="width:60px">Итого</th>`;

		SETTINGS.forEach(s => {
			let tr = document.createElement('tr');
			tr.innerHTML = `<td class="brigade-col">${s.name} Бриг. № ${s.brigade}</td>`;
			
			let stats = {}; // Объект для подсчета: { "У": 5, "Н": 3 }
			
			// Рисуем ячейки только для выбранных дней
			daysToRender.forEach(d => {
				const date = new Date(year, month - 1, d);
				const val = getHours(s.name, s.brigade, date);
				const classes = getClasses(date, isCurrentMonth, today.getDate());
				// Считаем только непустые значения
				if (val) {
					stats[val] = (stats[val] || 0) + 1;
				}							
				
				tr.innerHTML += `<td class="${classes}"><input type="text" value="${val}"></td>`;				
			});
			
		 // Формируем строку итогов (например: "У:5 Н:4")
				let totalText = Object.entries(stats)
					.map(([key, count]) => `${key}:${count}`)
					.join(' ');

				tr.innerHTML += `<td class="brigade-col" style="font-size:13px; text-align:center;">${totalText}</td>`;			
			
			tbody.appendChild(tr);
		});
	}

document.addEventListener('DOMContentLoaded', function() {
    const listContainer = document.getElementById('list-items');

    // Тестовые данные (позже они будут приходить из базы данных)
    const shifts = [
        { date: '2023-10-25', brigade: '№1', shift: 'Дневная', note: 'Склад А' },
        { date: '2023-10-25', brigade: '№2', shift: 'Ночная', note: 'Склад Б' },
        { date: '2023-10-26', brigade: '№1', shift: 'Дневная', note: 'Пересменка' }
    ];

    // Рисуем строки списка
    shifts.forEach(item => {
        const row = document.createElement('div');
        row.className = 'shift-row'; // Добавь этот класс в CSS для красоты
        row.style.cursor = 'pointer';
        row.style.padding = '10px';
        row.style.borderBottom = '1px solid #ccc';
        
        // Формируем текст строки
        row.innerHTML = `<strong>${item.date}</strong>; БРИГАДА ${item.brigade}; ${item.shift}; <em>${item.note}</em>`;

        // Тот самый клик для бронирования
        row.onclick = function() {
            if (confirm(`Забронировать смену на ${item.date}?`)) {
                reserveShift(item);
            }
        };

        listContainer.appendChild(row);
    });
});

function reserveShift(data) {
    console.log('Отправляем на сервер:', data);
    // Сюда мы впишем Fetch запрос к Nextcloud, когда настроим PHP-контроллер
}

// Запуск при загрузке
window.onload = function() 
{
    setCurrentDate(); // Сначала ставим дату
    render();         // Потом рисуем таблицу
};
