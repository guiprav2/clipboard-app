async function fetch(url, opt = {}) {
  let headers = {};
  if (typeof opt.body === 'object') { headers['Content-Type'] = 'application/json' }
  Object.assign(headers, opt.headers || {});
  return await window.fetch(url, { ...opt, headers, body: typeof opt.body === 'object' ? JSON.stringify(opt.body) : opt.body });
}

function makePromise() {
  let res, rej, p = new Promise((resolve, reject) => {
    res = resolve;
    rej = reject;
  });
  return [p, res, rej];
}

async function showModal(x) {
  let [p, res] = makePromise();
  document.body.append(x);
  x.returnValue = '';
  x.addEventListener('click', ev => {
    if (ev.target.tagName !== 'DIALOG') { return }
    let dialog = ev.target.closest('dialog:not([data-closable="false"])');
    let rect = dialog?.getBoundingClientRect?.();
    if (!rect) { return }
    if (ev.clientX < rect.left || ev.clientX > rect.right || ev.clientY < rect.top || ev.clientY > rect.bottom) { dialog.close() }
  });
  x.addEventListener('close', () => {
    x.remove();
    res([x.returnValue, x.returnDetail]);
  });
  x.showModal();
  return p;
}

async function selectFile(accept) {
  let [p, res] = makePromise();
  let input = d.el('input', { type: 'file', accept, class: 'hidden' });
  input.addEventListener('change', ev => res(input.files[0]));
  top.document.body.append(input);
  input.click();
  input.remove();
  return p;
};

export { fetch, makePromise, showModal, selectFile };
