// end.JS - provides todo list behavior for frontend.HTML
(function(){
  const STORAGE_KEY = 'todo_tasks';

  function genId(){return Date.now().toString(36)+'-'+Math.random().toString(36).slice(2,8)}

  function loadTasks(){
    const raw = localStorage.getItem(STORAGE_KEY);
    try{ return raw ? JSON.parse(raw) : [] }catch(e){ console.error('Failed parsing tasks', e); return [] }
  }

  function saveTasks(tasks){ localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks)) }

  function escapeHtml(s){ return String(s).replace(/[&<>\\\"]/g, c=>({'&':'&amp;','<':'&lt;','>':'&gt;','\\':'\\\\','"':'&quot;'}[c]) ) }

  function render(){
    const list = document.getElementById('tasks');
    if(!list) return;
    const tasks = loadTasks();
    list.innerHTML = '';
    if(tasks.length===0){ list.innerHTML = '<li class="small">No tasks yet</li>'; return }
    tasks.slice().reverse().forEach(t => {
      const li = document.createElement('li'); li.className = 'task' + (t.status==='done' ? ' done' : '');
      const meta = document.createElement('div'); meta.className = 'meta';
      const chk = document.createElement('input'); chk.type='checkbox'; chk.checked = t.status==='done'; chk.addEventListener('change', ()=> toggleDone(t.id));
      const title = document.createElement('div'); title.innerHTML = '<div class="title">'+escapeHtml(t.title)+'</div>' + (t.dueDate?'<div class="small">Due: '+escapeHtml(t.dueDate)+'</div>':'');
      meta.appendChild(chk); meta.appendChild(title);

      const controls = document.createElement('div'); controls.className='controls';
      const editBtn = document.createElement('button'); editBtn.textContent='Edit'; editBtn.addEventListener('click', ()=> editTask(t.id));
      const delBtn = document.createElement('button'); delBtn.textContent='Delete'; delBtn.addEventListener('click', ()=> deleteTask(t.id));
      controls.appendChild(editBtn); controls.appendChild(delBtn);

      li.appendChild(meta); li.appendChild(controls);
      list.appendChild(li);
    });
  }

  function addTask(data){
    const tasks = loadTasks();
    tasks.push(data);
    saveTasks(tasks);
    render();
  }

  function toggleDone(id){
    const tasks = loadTasks().map(t=> t.id===id ? Object.assign({}, t, { status: t.status==='done' ? 'pending' : 'done', updatedAt: new Date().toISOString() }) : t );
    saveTasks(tasks); render();
  }

  function deleteTask(id){ if(!confirm('Delete task?')) return; const tasks = loadTasks().filter(t=>t.id!==id); saveTasks(tasks); render(); }

  function editTask(id){
    const tasks = loadTasks(); const t = tasks.find(x=>x.id===id); if(!t) return;
    const newTitle = prompt('Title', t.title); if(newTitle===null) return; t.title = newTitle;
    const newDesc = prompt('Description', t.description||''); if(newDesc!==null) t.description = newDesc;
    t.updatedAt = new Date().toISOString(); saveTasks(tasks); render();
  }

  // expose functions for reuse/testing
  window.__todo = {
    addTask, toggleDone, deleteTask, editTask, loadTasks, saveTasks
  };

  document.addEventListener('DOMContentLoaded', ()=>{
    const form = document.getElementById('taskForm');
    if(form) form.addEventListener('submit', e=>{
      e.preventDefault();
      const title = document.getElementById('title').value.trim(); if(!title) return;
      const desc = document.getElementById('desc').value.trim();
      const due = document.getElementById('due').value || '';
      const priority = document.getElementById('priority').value;
      const now = new Date().toISOString();
      addTask({ id: genId(), title, description: desc, status: 'pending', priority, dueDate: due, createdAt: now, updatedAt: now, tags: [] });
      form.reset();
    });

    const clearBtn = document.getElementById('clearAll');
    if(clearBtn) clearBtn.addEventListener('click', ()=>{ if(!confirm('Clear all tasks?')) return; localStorage.removeItem(STORAGE_KEY); render(); });

    render();
  });

})();
