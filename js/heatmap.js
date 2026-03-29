(function(){
  'use strict';

  function todayKey(){
    return new Date().toISOString().slice(0, 10);
  }

  function render(container, heatmap){
    if(!container) return;

    const today = new Date();
    const columns = [];

    for(let week = 12; week >= 0; week--){
      const days = [];
      for(let day = 0; day < 7; day++){
        const date = new Date(today);
        date.setDate(date.getDate() - (week * 7) - day);
        const key = date.toISOString().slice(0, 10);
        const count = (heatmap || {})[key] || 0;
        const level = count === 0 ? '' : count === 1 ? 'l1' : count <= 3 ? 'l2' : count <= 6 ? 'l3' : 'l4';
        days.push(`<div class="hmap-cell ${level}" title="${key}: ${count} topics"></div>`);
      }
      columns.push(`<div class="hmap-col">${days.join('')}</div>`);
    }

    container.innerHTML = columns.join('');
  }

  window.HeatmapUtils = {
    render,
    todayKey,
  };
})();
