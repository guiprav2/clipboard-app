import LoadingDialog from './dialogs/LoadingDialog.js';
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
    this.wsp.on('status', ev => console.log('wsp:', ev.status));
    this._entries = this.doc.getArray('entries');
    this.doc.on('update', () => { this.entries = this._entries.toArray(); d.update() });
  }

  uploadFile = async () => {
    let file = await selectFile();
    let [xhr, res] = ruploads.upload(file);
    showModal(d.el(LoadingDialog, { promise: res }));
    res = await res;
    this._entries.unshift([{ name: file.name, url: res.url, cat: new Date().toISOString() }]);
  };

  deleteFile = x => { this._entries.delete(this.entries.indexOf(x), 1) };

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
