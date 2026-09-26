/**
 * <ygo-deck> Web Component 入口，构建为独立的 ygo-deck.js。
 *
 *   <script type="module" src="https://你的站点/ygo-deck.js"></script>
 *   <ygo-deck name="卡组名" deck="ydke://..."></ygo-deck>
 */
import { createRoot, type Root } from 'react-dom/client';
import themeCss from '../lib/theme.css?inline';
import componentsCss from '../components/components.css?inline';
import DeckView from '../components/DeckView';
import { parseAny } from '../lib/deck';
import { BUILDER_URL } from './config';

const HOST_CSS = `
:host {
  display: block;
  font-family: system-ui, -apple-system, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.5;
  text-align: left;
}
:host([hidden]) { display: none; }
.ygo-root {
  box-sizing: border-box;
  background: var(--panel);
  color: var(--text);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 12px;
}
.ygo-root *, .ygo-root *::before, .ygo-root *::after { box-sizing: border-box; }
`;

class YgoDeckElement extends HTMLElement {
  static observedAttributes = ['deck', 'name', 'compact', 'toolbar'];
  private root: Root | null = null;

  connectedCallback() {
    if (!this.root) {
      const shadow = this.shadowRoot ?? this.attachShadow({ mode: 'open' });
      const style = document.createElement('style');
      style.textContent = themeCss + componentsCss + HOST_CSS;
      const mount = document.createElement('div');
      mount.className = 'ygo-root';
      shadow.replaceChildren(style, mount);
      this.root = createRoot(mount);
    }
    this.render();
  }

  disconnectedCallback() {
    // 延迟卸载，避免元素在 DOM 中移动时反复重建
    queueMicrotask(() => {
      if (!this.isConnected && this.root) {
        this.root.unmount();
        this.root = null;
      }
    });
  }

  attributeChangedCallback() {
    if (this.root) this.render();
  }

  private render() {
    // 未设置 deck 属性时读取标签内的文本（如 <ygo-deck>ydke://...</ygo-deck>）
    const source = this.getAttribute('deck') || this.textContent || '';
    const deck = parseAny(source, this.getAttribute('name') ?? '');
    this.root!.render(
      deck ? (
        <DeckView deck={deck} builderUrl={BUILDER_URL} compact={this.hasAttribute('compact')} showToolbar={this.getAttribute('toolbar') !== 'false'} />
      ) : (
        <p className="ygo-error">ygo-deck：无法识别卡组内容（支持 ydke:// 卡组码或 YDK 文本）</p>
      ),
    );
  }
}

if (!customElements.get('ygo-deck')) customElements.define('ygo-deck', YgoDeckElement);
