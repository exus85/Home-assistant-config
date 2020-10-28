class MarqueeStateElement2 extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }
  setConfig(config) {
  const root = this.shadowRoot;
  if (root.lastChild) root.removeCHild(root.lastChild);
  const cardConfig = Object.assign({}, config);
  const card = document.createElement('ha-card');
  const content = document.createElement ('div');
  content.id = "value"
  //const title = document.createElement('div');
  //title.id = "title"
  //title.textContent = cardConfig.title;
  const style = document.createElement('style');
  style.textContent = `
    ha-card {
      height: 50px; 
      overflow: hidden;
      position: relative;
      white-space: nowrap;
      background: none;
      box-shadow: none;
      width: 100% !important;

    }
    #value {
        position: absolute;
        width: 100%;
        height: 100%;
        margin: 0;
        line-height: 50px;
        text-align: center;
        
        
        /* Starting position */
        -moz-transform:translateX(100%);
        -webkit-transform:translateX(100%); 
        transform:translateX(100%);
        /* Apply animation to this element */ 
        -moz-animation: scroll-left 30s linear infinite;
        -webkit-animation: scroll-left 30s linear infinite;
        animation: scroll-left 30s linear infinite;
        }
        /* Move it (define the animation) */
        @-moz-keyframes scroll-left {
        0% { -moz-transform: translateX(100%); }
        100% { -moz-transform: translateX(-100%); }
        }
        @-webkit-keyframes scroll-left {
        0% { -webkit-transform: translateX(100%); }
        100% { -webkit-transform: translateX(-100%); }
        }
        @keyframes scroll-left {
        0% { 
        -moz-transform: translateX(100%); /* Browser bug fix */
        -webkit-transform: translateX(100%); /* Browser bug fix */
        transform: translateX(100%); 
        }
        100% { 
        -moz-transform: translateX(-100%); /* Browser bug fix */
        -webkit-transform: translateX(-100%); /* Browser bug fix */
        transform: translateX(-100%); 
    }
    #title {
    }  
  `;

  card.appendChild(content);
  //card.appendChild(title);
  card.appendChild(style);
  root.appendChild(card);
  this._config = cardConfig;
  }


  set hass(hass) {
    const config = this._config;
    const root = this.shadowRoot;
    const entityState = hass.states[config.entity].state;


    if (entityState !== this._entityState) {
      root.getElementById("value").textContent = `${entityState}`;
      this._entityState = entityState
    }
    root.lastChild.hass = hass;
  }

  getCardSize() {
    return 1;
  }
}

customElements.define('marquee-state-element2', MarqueeStateElement2);