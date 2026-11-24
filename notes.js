/* Earthboard mockup notes: a "Leave a note" panel on every page.
   Notes save in this browser and can be emailed or copied to Milana. */
(function(){
  var TO = 'milana@beaivisible.ai';
  var KEY = 'eb-mockup-notes', NKEY = 'eb-mockup-name';
  function load(){ try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch(e){ return mem; } }
  function save(list){ mem = list; try { localStorage.setItem(KEY, JSON.stringify(list)); } catch(e){} }
  var mem = [];
  function getName(){ try { return localStorage.getItem(NKEY) || ''; } catch(e){ return ''; } }
  function setName(v){ try { localStorage.setItem(NKEY, v); } catch(e){} }

  var page = (document.title || 'Page').replace(/^Earthboard\s*/,'').replace(/^[:\-·]\s*/,'') || 'Hub';

  function where(){
    var hs = [].slice.call(document.querySelectorAll('h1,h2,h3')).filter(function(h){
      return h.offsetParent !== null && !h.closest('#ebn');
    });
    var pick = null, line = innerHeight * 0.45;
    hs.forEach(function(h){ if (h.getBoundingClientRect().top < line) pick = h; });
    if (!pick && hs.length) pick = hs[0];
    var view = location.hash ? ' (' + location.hash.slice(1) + ')' : '';
    var t = pick ? pick.textContent.replace(/\s+/g,' ').trim().slice(0,70) : 'Top of page';
    return page + view + ' › ' + t;
  }

  var css = '#ebn-btn{position:fixed;right:18px;bottom:18px;z-index:9999;background:#ffd84d;color:#1a1a1a;border:0;border-radius:999px;padding:12px 18px;font:700 15px/1 Inter,system-ui,sans-serif;box-shadow:0 8px 24px rgba(0,0,0,.35);cursor:pointer}'
  + '#ebn-btn b{display:inline-block;min-width:20px;margin-left:8px;padding:3px 6px;border-radius:999px;background:#1a1a1a;color:#ffd84d;font-size:12px}'
  + '#ebn{position:fixed;right:18px;bottom:76px;z-index:9999;width:min(380px,calc(100vw - 36px));max-height:calc(100vh - 100px);overflow:auto;background:#fffbea;color:#1a1a1a;border-radius:16px;box-shadow:0 20px 50px rgba(0,0,0,.4);padding:18px;font:15px/1.45 Inter,system-ui,sans-serif;display:none}'
  + '#ebn.open{display:block}#ebn h4{margin:0 0 4px;font-size:18px}#ebn p.s{margin:0 0 12px;color:#555;font-size:13px}'
  + '#ebn label{display:block;font-size:13px;font-weight:600;margin:10px 0 4px}'
  + '#ebn input,#ebn textarea{width:100%;box-sizing:border-box;border:1px solid #d8cfa8;border-radius:10px;padding:10px;font:inherit;background:#fff;color:#1a1a1a}'
  + '#ebn textarea{min-height:90px;resize:vertical}'
  + '#ebn .row{display:flex;gap:8px;flex-wrap:wrap;margin-top:12px}'
  + '#ebn button.a{flex:1 1 auto;min-height:42px;border-radius:10px;border:0;font:700 14px Inter,system-ui,sans-serif;cursor:pointer;padding:0 14px}'
  + '#ebn .p{background:#1a1a1a;color:#fff}#ebn .g{background:#efe6bf;color:#1a1a1a}'
  + '#ebn ul{list-style:none;margin:14px 0 0;padding:0;border-top:1px solid #eadfb4}'
  + '#ebn li{padding:10px 0;border-bottom:1px solid #eadfb4;font-size:14px}#ebn li small{display:block;color:#6b6243;font-size:12px;margin-bottom:2px}'
  + '#ebn li button{background:none;border:0;color:#a0402a;font-size:12px;cursor:pointer;padding:4px 0 0}'
  + '#ebn .ok{color:#2c7a3f;font-size:13px;margin-top:8px;min-height:1em}'
  + '.ebn-reply{display:inline-block;margin-top:6px;background:#1a1a1a;color:#ffd84d;border:0;border-radius:999px;padding:4px 10px;font:700 12px Inter,system-ui,sans-serif;cursor:pointer}'
  + '@media print{#ebn,#ebn-btn{display:none}}';
  var st = document.createElement('style'); st.textContent = css; document.head.appendChild(st);

  var btn = document.createElement('button');
  btn.id = 'ebn-btn'; btn.type = 'button'; btn.setAttribute('aria-expanded','false');
  var box = document.createElement('div'); box.id = 'ebn'; box.setAttribute('role','dialog'); box.setAttribute('aria-label','Leave a note');
  box.innerHTML = '<h4>Leave a note</h4><p class="s">Scroll to any part of the page, then type what you would change. Notes save in this browser until you send them.</p>'
   + '<label for="ebn-name">Your name</label><input id="ebn-name" placeholder="Mark or Kym">'
   + '<label for="ebn-where">About this part</label><input id="ebn-where">'
   + '<label for="ebn-text">Your note</label><textarea id="ebn-text" placeholder="What should change, stay or go?"></textarea>'
   + '<div class="row"><button class="a p" type="button" id="ebn-add">Save note</button></div>'
   + '<ul id="ebn-list"></ul>'
   + '<div class="row"><button class="a p" type="button" id="ebn-send">Email notes to Milana</button><button class="a g" type="button" id="ebn-copy">Copy notes</button></div>'
   + '<div class="ok" id="ebn-ok" aria-live="polite"></div>';
  document.body.appendChild(box); document.body.appendChild(btn);

  var $ = function(id){ return document.getElementById(id); };
  $('ebn-name').value = getName();
  $('ebn-name').addEventListener('change', function(){ setName(this.value.trim()); });

  function render(){
    var list = load();
    btn.innerHTML = 'Leave a note' + (list.length ? '<b>' + list.length + '</b>' : '');
    var ul = $('ebn-list'); ul.innerHTML = '';
    list.forEach(function(n, i){
      var li = document.createElement('li');
      li.innerHTML = '<small></small><span></span><br><button type="button">Remove</button>';
      li.querySelector('small').textContent = n.where;
      li.querySelector('span').textContent = n.text;
      li.querySelector('button').addEventListener('click', function(){ var l = load(); l.splice(i,1); save(l); render(); });
      ul.appendChild(li);
    });
  }
  function open(ctx){
    box.classList.add('open'); btn.setAttribute('aria-expanded','true');
    $('ebn-where').value = ctx || where(); $('ebn-ok').textContent = '';
    setTimeout(function(){ $('ebn-text').focus(); }, 30);
  }
  btn.addEventListener('click', function(){ box.classList.contains('open') ? (box.classList.remove('open'), btn.setAttribute('aria-expanded','false')) : open(); });

  $('ebn-add').addEventListener('click', function(){
    var t = $('ebn-text').value.trim(); if (!t) { $('ebn-text').focus(); return; }
    var l = load(); l.push({ where: $('ebn-where').value.trim() || where(), text: t, at: new Date().toISOString() }); save(l);
    $('ebn-text').value = ''; $('ebn-ok').textContent = 'Saved. Add another or send them when you are done.'; render();
  });

  function bodyText(){
    var name = $('ebn-name').value.trim() || getName() || 'Earthboard';
    var l = load();
    return 'Mockup notes from ' + name + '\n\n' + l.map(function(n, i){ return (i+1) + '. ' + n.where + '\n' + n.text; }).join('\n\n');
  }
  function copy(txt, done){
    if (navigator.clipboard && navigator.clipboard.writeText) { navigator.clipboard.writeText(txt).then(done, function(){ fallback(txt); done(); }); }
    else { fallback(txt); done(); }
  }
  function fallback(txt){ var ta = document.createElement('textarea'); ta.value = txt; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); } catch(e){} ta.remove(); }

  $('ebn-copy').addEventListener('click', function(){
    if (!load().length) { $('ebn-ok').textContent = 'No notes yet.'; return; }
    copy(bodyText(), function(){ $('ebn-ok').textContent = 'Copied. Paste them into a text or email to Milana.'; });
  });
  $('ebn-send').addEventListener('click', function(){
    if (!load().length) { $('ebn-ok').textContent = 'No notes yet.'; return; }
    var txt = bodyText(), name = $('ebn-name').value.trim() || 'Earthboard';
    copy(txt, function(){});
    var url = 'mailto:' + TO + '?subject=' + encodeURIComponent('Website mockup notes from ' + name) + '&body=' + encodeURIComponent(txt.length > 1800 ? txt.slice(0,1700) + '\n\n(More notes were copied. Paste them here.)' : txt);
    location.href = url;
    $('ebn-ok').textContent = 'Your email app should open with the notes filled in. They are also copied in case it does not.';
  });

  /* "Add your note" buttons on the yellow call notes */
  [].slice.call(document.querySelectorAll('.cn')).forEach(function(c){
    var b = document.createElement('button'); b.type = 'button'; b.className = 'ebn-reply'; b.textContent = 'Add your note';
    b.addEventListener('click', function(e){
      e.preventDefault(); e.stopPropagation();
      var lab = c.firstElementChild && c.firstElementChild.tagName !== 'BUTTON' ? c.firstElementChild.textContent : c.textContent;
      var t = lab.replace('Add your note','').replace(/\s+/g,' ').trim().slice(0,60);
      open(where() + ' › Call note: ' + t);
    });
    c.appendChild(b);
  });

  render();
})();
