import d from '../../other/dominant.js';

class LoadingDialog {
  constructor(props) {
    this.props = props;
    d.effect(() => this.done, x => x && this.root.close());
    props.promise?.then?.(() => this.root.close())?.catch?.(() => this.root.close());
  }

  get done() { return d.resolve(this.props.done) }

  render = () => this.root = d.html`
    <dialog class="flex flex-col p-0 bg-transparent outline-none" data-closable="false">
      <div class="p-3"><img class="w-24 mx-auto" src="/images/spinner.gif"></div>
    </dialog>
  `;
}

export default LoadingDialog;
