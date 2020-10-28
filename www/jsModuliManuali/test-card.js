import "https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js?module";
import "https://unpkg.com/wired-card@0.8.1/wired-card.js?module";
import "https://unpkg.com/wired-toggle@0.8.0/wired-toggle.js?module";
import "http://192.168.1.45:8123/local/jsModuliManuali/modern-ticker/js/jquery.modern-ticker.min.js?module";

function loadCSS(url) {
  const link = document.createElement("link");
  link.type = "text/css";
  link.rel = "stylesheet";
  link.href = url;
  document.head.appendChild(link);
}
loadCSS("http://192.168.1.45:8123/local/jsModuliManuali/modern-ticker/themes/theme1.css");





class TestCard extends HTMLElement {
  set hass(hass) {
    if (!this.content) {
      const card = document.createElement('ha-card');
      card.header = 'Example card';
      this.content = document.createElement('div');
      this.content.style.padding = '0 16px 16px';
      card.appendChild(this.content);
      this.appendChild(card);
    }    
    const entityId = this.config.entity;
    const state = hass.states[entityId];
    const stateStr = state ? state.state : 'unavailable';

    this.content.innerHTML = `
    <div class="modern-ticker mt-round">
        <div class="mt-body">
            <div class="mt-label">NEWS:</div>
            <div class="mt-news">
                <ul>
                	<li><a href="#" target="_self">News 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1 news 1</a></li>
                    <li><a href="#" target="_self">News 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2 news 2</a></li>
                    <li><a href="#" target="_self">News 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3 news 3</a></li>
                    <li><a href="#" target="_self">News 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4 news 4</a></li>
                    <li><a href="#" target="_self">News 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5 news 5</a></li>
                </ul>
            </div>
            <div class="mt-controls">
            	<div class="mt-prev"></div>
            	<div class="mt-play"></div>
                <div class="mt-next"></div>
            </div>
        </div>
    </div>
    `;
  }
  loadScripts() {
    this.isScriptsLoading = true;

    const promises = [];

    promises.push(this.loadScript(`/local/jsModuliManuali/modern-ticker/js/jquery.min.js`, true));
    promises.push(this.loadScript('/local/jsModuliManuali/modern-ticker/js/jquery.modern-ticker.min.js', true));
    
    return Promise.all(promises)
      .then(() => {
        this.isScriptsLoading = false;
        this.isScriptsLoaded = true;
      });
  }
  setConfig(config) {
    if (!config.entity) {
      throw new Error('You need to define an entity');
    }
    this.config = config;
  }

  // The height of your card. Home Assistant uses this to automatically
  // distribute all cards over the available columns.
  getCardSize() {
    return 3;
  }
  loadScript(scriptUrl, useCache) {
    return new Promise((resolve, reject) => {
      let script = document.createElement('script');
      script.async = true;
      script.src = useCache ? scriptUrl : this.cacheBuster(scriptUrl);
      script.onload = () => resolve();
      script.onerror = (err) => reject(new URIError(`${err.target.src}`));
      this.appendChild(script);
    });
  }



}



customElements.define('test-card', TestCard);



jQuery(document).ready(function() {      
  jQuery(".modern-ticker").modernTicker({
    effect: "slide",
    slideDistance: 100,
    displayTime: 4000,
    transitionTime: 350
    });          
});
   