const updateTimeDiv = document.getElementById('updateTime');
const categorySelect = document.getElementById('categorySelect');
const startBtn = document.getElementById('startBtn');
const showAllBtn = document.getElementById('showAllBtn');
const reel = document.getElementById('reel');
const resultsDiv = document.getElementById('results');

updateTimeDiv.textContent = `資料庫最後更新時間：${data.lastUpdated || ''}`;

startBtn.addEventListener('click', () => {
  const category = categorySelect.value;
  const list = data[category];

  if (!list || list.length === 0) {
    reel.textContent = '沒有該分類資料';
    resultsDiv.style.display = 'none';
    return;
  }

  startBtn.disabled = true;
  resultsDiv.style.display = 'none';

  let count = 0;
  const interval = setInterval(() => {
    reel.textContent = list[count % list.length].name;
    count++;
  }, 100);

  setTimeout(() => {
    clearInterval(interval);
    const selected = list[Math.floor(Math.random() * list.length)];
    reel.textContent = selected.name;

    let phone = selected.phone;
    if (phone && phone !== "nan" && !phone.startsWith('0')) {
      phone = '0' + phone;
    }

    const openHoursHtml = selected.openHours ? formatOpenHours(selected.openHours) : '';

    let html = `
      <div class="result-item">
        <h3><a href="${selected.mapUrl}" target="_blank" rel="noopener noreferrer">${selected.name}</a></h3>
        <p>地址：${selected.address}</p>
        <p>電話：${phone || '無'}</p>
        ${openHoursHtml}
        <p>評價：${selected.rating}</p>
      </div>
    `;
    resultsDiv.innerHTML = html;
    resultsDiv.style.display = 'block';

    startBtn.disabled = false;
  }, 2000);
});

showAllBtn.addEventListener('click', () => {
  const category = categorySelect.value;
  const list = data[category];

  if (!list || list.length === 0) {
    reel.textContent = '此分類無資料';
    resultsDiv.style.display = 'none';
    return;
  }

  let html = '<div class="all-list">';
  html += '<h4>所有店家清單</h4>';
  list.forEach(item => {
    let phone = item.phone;
    if (phone && phone !== "nan" && !phone.startsWith('0')) {
      phone = '0' + phone;
    }

    const openHoursHtml = item.openHours ? formatOpenHours(item.openHours) : '';

    html += `
      <div class="all-item">
        <strong><a href="${item.mapUrl}" target="_blank" rel="noopener noreferrer">${item.name}</a></strong><br>
        地址：${item.address}<br>
        電話：${phone || '無'}<br>
        ${openHoursHtml}
        評價：${item.rating}
      </div>
    `;
  });
  html += '</div>';

  resultsDiv.innerHTML = html;
  resultsDiv.style.display = 'block';
});

// 格式化營業時間，合併連續星期
function formatOpenHours(openHours) {
  if (!openHours || typeof openHours !== 'object') return '';

  const daysMap = {
    "一": "一",
    "二": "二",
    "三": "三",
    "四": "四",
    "五": "五",
    "六": "六",
    "日": "日"
  };

  let timeGroups = {};
  for (const [day, hours] of Object.entries(openHours)) {
    if (!timeGroups[hours]) {
      timeGroups[hours] = [];
    }
    timeGroups[hours].push(day);
  }

  let html = '<table class="open-hours-table"><tr><th>星期</th><th>營業時間</th></tr>';
  for (const [hours, days] of Object.entries(timeGroups)) {
    let dayStr = mergeDays(days);
    html += `<tr><td>${dayStr}</td><td>${hours}</td></tr>`;
  }
  html += '</table>';
  return html;
}

// 合併連續星期，輸出格式如 「一 ~ 五」
function mergeDays(days) {
  const order = ["一", "二", "三", "四", "五", "六", "日"];
  const sortedDays = days.sort((a, b) => order.indexOf(a) - order.indexOf(b));

  let ranges = [];
  let start = sortedDays[0];
  let end = start;

  for (let i = 1; i < sortedDays.length; i++) {
    if (order.indexOf(sortedDays[i]) === order.indexOf(end) + 1) {
      end = sortedDays[i];
    } else {
      ranges.push(start === end ? start : `${start} ~ ${end}`);
      start = end = sortedDays[i];
    }
  }
  ranges.push(start === end ? start : `${start} ~ ${end}`);
  return ranges.join('、');
}
