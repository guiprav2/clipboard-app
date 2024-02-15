import QRCode from 'https://cdn.skypack.dev/qrcode';
import d from '../../other/dominant.js';

class SyncDeviceDialog {
  constructor(props) { this.props = props; QRCode.toDataURL(props.url).then(x => this.img.src = x) }
  get url() { return this.props.url }

  copyLink = async () => { await navigator.clipboard.writeText(this.url); this.root.close() };

  render = () => this.root = d.html`
    <dialog class="max-w-xl mx-auto p-16 bg-neutral-200 rounded-lg shadow-xl">
      <form method="dialog" class="flex flex-col gap-4">
        ${this.img = d.html`<img>`}
        <button class="px-4 py-2 w-full rounded text-white bg-blue-500" ${{ onClick: this.copyLink }}>Copy link</button>
        <button class="px-4 py-2 w-full rounded bg-[#162031] text-white" type="submit">Done</button>
      </form>
    </dialog>
  `;
}

export default SyncDeviceDialog;
