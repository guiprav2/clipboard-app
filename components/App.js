import LoadingDialog from './dialogs/LoadingDialog.js';
import SyncDeviceDialog from './dialogs/SyncDeviceDialog.js';
import d from '../other/dominant.js';
import moment from 'https://cdn.skypack.dev/moment';
import ruploads from '../repositories/UploadRepository.js';
import { Y, WebsocketProvider } from '../other/y.bundle.js';
import { nanoid } from 'https://cdn.skypack.dev/nanoid';
import { selectFile, showModal } from '../other/util.js';

class App {
  constructor() {
    let pid = new URL(location.href).searchParams.get('id');
    this.id = pid || localStorage.getItem('clipboard.id');
    localStorage.setItem('clipboard.id', this.id ??= nanoid() + nanoid());
    if (pid) { history.pushState(null, '', '/') }
    this.doc = new Y.Doc();
    this.wsp = new WebsocketProvider('wss://protohub.guiprav.com/yjs', `clipboard:${this.id}`, this.doc);
    this.wsp.on('status', ev => { console.log('wsp:', ev.status); this.pushSetup() });
    this._pushEndpoints = this.doc.getArray('pushEndpoints');
    this._entries = this.doc.getArray('entries');
    this.doc.on('update', () => { this.entries = this._entries.toArray(); d.update() });
  }

  pushSetup() {
    if (this.pushSetupDone) { return }
    this.pushSetupDone = true;
    Notification.requestPermission().then(async perm => {
      if (perm !== 'granted') { return }
      let reg = await navigator.serviceWorker.register('sw.js');
      let sub = await reg.pushManager.subscribe({ userVisibleOnly: true });
      console.log('endpoint:', this.ownPushEndpoint = sub.endpoint);
      if (this._pushEndpoints.toArray().includes(sub.endpoint)) { return }
      this._pushEndpoints.push([sub.endpoint]);
    });
  }

  uploadFile = async () => {
    let file = await selectFile();
    let [xhr, res] = ruploads.upload(file);
    showModal(d.el(LoadingDialog, { promise: res }));
    res = await res;
    this._entries.unshift([{ name: file.name, url: res.url, cat: new Date().toISOString() }]);
    for (let x of this._pushEndpoints.toArray()) {
      if (x === this.ownPushEndpoint) { continue }
      let res2 = await fetch(x, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'File received!', body: file.name, url: res.url }),
      });
      alert('Fetch: ' + res2.status + ': ' + JSON.stringify(await res2.json()));
    }
  };

  deleteFile = x => { this._entries.delete(this.entries.indexOf(x), 1) };

  syncDevice = async () => {
    await showModal(d.el(SyncDeviceDialog, { url: `https://clipboard.guiprav.com/?id=${this.id}` }));
  };

  render = () => d.html`
    <div class="max-w-5xl mx-auto p-16 rounded-lg shadow-xl bg-neutral-200 text-neutral-700 flex flex-col gap-8 mb-32">
      <div class="flex justify-center items-center gap-3 not-last:mb-12 text-sm whitespace-nowrap">
        <a href="#" ${{ onClick: this.uploadFile }}>upload file</a>
        <div>|</div>
        <a href="#" ${{ onClick: this.enterNote }}>enter note</a>
        <div>|</div>
        <a href="#" ${{ onClick: this.syncDevice }}>sync device</a>
      </div>
      ${d.map(() => this.entries, x => d.html`
        <div class="flex justify-between items-center group">
          <div class="flex gap-3 items-center">
            <div class="nf nf-fa-file"></div>
            <a target="_blank" ${{ href: () => x.url }}>${d.text(() => x.name)}</a>
          </div>
          <div class="items-center gap-3 hidden group-hover:flex">
            <div class="text-xs">${d.text(() => moment(x.cat).fromNow())}</div>
            <button class="nf nf-oct-x" ${{ onClick: () => this.deleteFile(x) }}></button>
          </div>
        </div>
      `)}
    </div>
  `;
}

export default App;
