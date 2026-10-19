function safeText(value){return String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));}
function clientInfo(){return {object:$('objectName').value.trim(),country:$('country').value.trim(),task:$('clientTask').value.trim(),kind:$('caseType').value==='project'?'Данные моего объекта (со слов заявителя)':'Учебный пример'};}
function reviewNext(p,r){
 if(r.hold)return 'Нужна расширенная геомеханическая оценка применимости Q-system, механизмов разрушения и возможных схем крепления.';
 if(!p.confirmed)return 'Нужно проверить требования по диаграмме NGI, геометрию блоков и пригодность принятой схемы для свода и стен.';
 if(!r.best)return 'Оба варианта нужно пересмотреть: ни один не соответствует всем введённым размерным требованиям.';
 return 'Нужно проверить нагрузки, несущую способность и закрепление анкеров, работу Sfr и достаточность выбранной схемы для фактического массива.';
}
function costDifference(r){const a=r.options[0],b=r.options[1],gap=Math.abs(a.cost-b.cost),high=Math.max(a.cost,b.cost);return {gap,perMetre:gap/current.p.length,percent:high>0?100*gap/high:0};}
function requestText(){
 const {p,r}=current,c=clientInfo(),d=costDifference(r);
 const num=(v,n=2)=>f(v,n);
 const lines=['Источник обращения: UG-SUPPORT-RU.', 'Эдуард, прошу обсудить проверку крепления горной выработки.',
 'Источник данных: '+c.kind+'.',
 'Объект: '+(c.object||'не указан')+'. Страна / юрисдикция: '+(c.country||'не указана')+'.',
 'Задача: '+(c.task||'проверить достаточность крепи и сравнить варианты')+'.',
 `Геометрия: B=${num(p.span)} м; h прямых стен=${num(p.wall)} м; участок=${num(p.length)} м; свод полукругом.`,
 `Q=${num(r.Q,4)}; De свода=${num(r.De,3)}; De стен=${num(r.Dw,3)}; ESR введён=${num(p.esr)}, использован=${num(r.esr)}.`,
 `RQD=${num(p.rqd)}%; Jn=${num(p.jn)}; Jr=${num(p.jr)}; Ja=${num(p.ja)}; Jw=${num(p.jw)}; SRF=${num(p.srf)}.`,
 `Требования: шаг ≤${num(p.requiredSpace)} м; анкер ≥${num(p.requiredLength)} м; Sfr ≥${num(p.requiredThickness,0)} мм. Проверка диаграммы заявителем: ${p.confirmed?'отмечена':'не подтверждена'}.`,
 `Постоянная горная выработка (C): ${p.permanent?'да':'нет'}; сложные условия: ${p.challenging?'отмечены':'не отмечены'}.`];
 for(const [i,k] of ['a','b'].entries()){const o=r.options[i];lines.push(`Вариант ${o.name}: шаг ${num(p[k+'Space'])} м; анкер ${num(p[k+'Length'])} м; Sfr ${num(p[k+'Thickness'],0)} мм; сетка ${p[k+'Mesh']?'да':'нет'}; ${o.bolts} анкеров; подача Sfr ${num(o.supplied)} м³; стоимость ${num(o.cost)} USD (${num(o.costPerMetre)} USD/м).`);}
 lines.push(`Разница стоимости: ${num(d.gap)} USD. Возможность для проверки; экономия и достаточность крепи не подтверждены.`,
 `Расценки: анкер ${num(p.boltRate)} USD/м; Sfr ${num(p.concreteRate)} USD/м³ подачи; сетка ${num(p.meshRate)} USD/м². Отскок ${num(p.rebound)}%.`,
 'Статус расчёта: '+$('conclusion').textContent,
 'Следующий шаг: '+reviewNext(p,r),
 'Прошу уточнить необходимые материалы, объём работ и стоимость инженерной проверки.',
 'Приложения при наличии: сечение, геологическое картирование, действующий паспорт крепления.',
 'Инструмент: https://gornyak0505-pixel.github.io/geomechanics-demo/underground-support.html');
 return lines.join('\n');
}
function updateContactLinks(){if(!current)return;const text='[UG-SUPPORT-RU]\n'+$('requestText').value,object=clientInfo().object;$('sendCalculation').href='mailto:eduard@ugmineplanner.com?subject='+encodeURIComponent('[UG Support RU] Проверка крепления: '+(object||'горная выработка'))+'&body='+encodeURIComponent(text);$('whatsappCalculation').href='https://wa.me/380675397500?text='+encodeURIComponent(text);$('copyStatus').textContent='';}
function updateClientCard(){if(!current)return;const c=clientInfo();$('caseSummary').textContent=c.kind+' · '+(c.object||'Объект пока не указан')+' · '+(c.country||'Юрисдикция не указана');$('requestText').value=requestText();updateContactLinks();}
function renderClientFlow(){
 if(!current)return;const {p,r}=current,d=costDifference(r);
 $('difference').innerHTML=stat('Разница стоимости',f(d.gap,0),'USD на участок')+stat('Разница на метр',f(d.perMetre,2),'USD/м')+stat('От более дорогого варианта',f(d.percent,1)+'%','разница, а не подтверждённая экономия');
 $('nextStep').textContent=reviewNext(p,r);$('comparisonNote').textContent=d.gap<.005?'При введённых данных стоимость вариантов одинакова. Выбор требует проверки технической достаточности.':'Разница — возможность для инженерной проверки. Дешевле не означает безопаснее: достаточность крепи и возможность снижения затрат пока не подтверждены.';
 updateClientCard();
}
function downloadPreliminaryReport(){
 if(!current)return;const {p,r}=current,c=clientInfo();
 const inputs=table(['Исходный параметр','Введённое значение'],Object.entries(p).map(([k,v])=>[safeText(document.querySelector('label[for="'+k+'"]').textContent),typeof v==='boolean'?(v?'Да':'Нет'):f(v,4)]));
 const body=`<header><p>EDUARD KHARITONOV · MINING ENGINEERING</p><h1>Предварительное сравнение крепления</h1><p>${safeText($('stamp').textContent)}</p></header><main><h2>Карточка объекта</h2><p>${safeText(c.kind)}</p><p><b>Объект:</b> ${safeText(c.object||'Не указан')}<br><b>Страна / юрисдикция:</b> ${safeText(c.country||'Не указана')}<br><b>Задача:</b> ${safeText(c.task||'Проверка крепления и сравнение вариантов')}</p><p><b>Статус:</b> ${safeText($('conclusion').textContent)}</p><p>Юрисдикция указана заявителем. Соответствие национальным нормам и коэффициенты запаса этим инструментом не устанавливаются.</p><h2>Расчётные показатели</h2>${$('stats').outerHTML}<h2>Сравнение вариантов</h2>${$('variants').innerHTML}<h2>Разница стоимости</h2>${$('difference').outerHTML}<p>${safeText($('comparisonNote').textContent)}</p><h2>Сечение, вариант A</h2>${$('section').innerHTML}<h2>Следующий инженерный шаг</h2><p>${safeText(reviewNext(p,r))}</p><h2>Исходные данные</h2>${inputs}<h2>Методика и ограничения</h2>${document.querySelector('#methodDetails').innerHTML.replace(/<summary>[\s\S]*?<\/summary>/,'')}<h2>Подготовленный запрос</h2><pre>${safeText($('requestText').value)}</pre><p>Eduard Kharitonov · Mining Engineer / Geomechanics Specialist<br>Tbilisi, Georgia · доступен для удалённого международного консалтинга и проектной работы<br>Email: eduard@ugmineplanner.com · WhatsApp: +380 67 539 7500</p></main>`;
 const html='<!doctype html><html lang="ru"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Предварительное сравнение крепления</title><style>body{font:15px/1.6 system-ui;color:#203847;max-width:1000px;margin:30px auto;padding:0 22px}h1,h2{color:#123044}h2{margin-top:30px}header{border-bottom:3px solid #147d9c}table{border-collapse:collapse;width:100%;font-size:13px}th,td{border-bottom:1px solid #d7e0e2;padding:9px;text-align:left}.tablewrap{overflow:auto}.stats{display:flex;gap:20px;flex-wrap:wrap}.stat{border:1px solid #d7e0e2;padding:14px}.stat span,.stat b,.stat small{display:block}.stat b{font-size:24px}svg{width:100%;max-height:400px}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:13px/1.6 system-ui}.formula{padding:16px;background:#f3f7f7}a{color:#076a85}@media print{body{margin:0;font-size:10pt}.stats{display:flex}h2{break-after:avoid}tr,svg{break-inside:avoid}@page{size:A4;margin:14mm}}</style></head><body>'+body+'</body></html>';
 download('underground-support-preliminary-report.html',html,'text/html;charset=utf-8');
 $('copyStatus').textContent='Отчёт HTML скачан. Откройте его в браузере; для PDF используйте «Печать → Сохранить в PDF».';
}
for(const id of ['objectName','country','clientTask'])$(id).addEventListener('input',updateClientCard);
$('caseType').addEventListener('change',updateClientCard);
$('requestText').addEventListener('input',updateContactLinks);
$('downloadReport').onclick=downloadPreliminaryReport;
$('copyRequest').onclick=async()=>{if(!current)return;try{await navigator.clipboard.writeText($('requestText').value);$('copyStatus').textContent='Текст запроса скопирован.';}catch{$('requestText').focus();$('requestText').select();$('copyStatus').textContent='Выделен текст запроса. Скопируйте его сочетанием Ctrl+C.';}};
