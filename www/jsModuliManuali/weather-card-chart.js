const locale = {
  da: {
    tempHi: "Temperatur",
    tempLo: "Temperatur nat",
    precip: "Nedbør",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NØ', 'NØ', 'Ø-NØ', 'Ø', 'Ø-SØ', 'SØ', 'S-SØ',
      'S', 'S-SV', 'SV', 'V-SV', 'V', 'V-NV', 'NV', 'N-NV', 'N'
    ]
  },
  de: {
    tempHi: "Höchsttemperatur",
    tempLo: "Tiefsttemperatur",
    precip: "Niederschlag",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NO', 'NO', 'O-NO', 'O', 'O-SO', 'SO', 'S-SO',
      'S', 'S-SW', 'SW', 'W-SW', 'W', 'W-NW', 'NW', 'N-NW', 'N'
    ]
  },
  en: {
    tempHi: "Temperature",
    tempLo: "Temperature night",
    feels_like: "Feels",
    precip: "Precipitation",
    uPress: "inHg",
    uSpeed: "mph",
    uPrecip: "in",
    cardinalDirections: [
      'N', 'N-NE', 'NE', 'E-NE', 'E', 'E-SE', 'SE', 'S-SE',
      'S', 'S-SW', 'SW', 'W-SW', 'W', 'W-NW', 'NW', 'N-NW', 'N'
    ]
  },
  es: {
    tempHi: "Temperatura máxima",
    tempLo: "Temperatura mínima",
    precip: "Precipitations",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NE', 'NE', 'E-NE', 'E', 'E-SE', 'SE', 'S-SE',
      'S', 'S-SO', 'SO', 'O-SO', 'O', 'O-NO', 'NO', 'N-NO', 'N'
    ]
  },
  fr: {
    tempHi: "Température",
    tempLo: "Température nuit",
    precip: "Précipitations",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NE', 'NE', 'E-NE', 'E', 'E-SE', 'SE', 'S-SE',
      'S', 'S-SO', 'SO', 'O-SO', 'O', 'O-NO', 'NO', 'N-NO', 'N'
    ]
  },
  nl: {
    tempHi: "Maximum temperatuur",
    tempLo: "Minimum temperatuur",
    precip: "Neerslag",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NO', 'NO', 'O-NO', 'O', 'O-ZO', 'ZO', 'Z-ZO',
      'Z', 'Z-ZW', 'ZW', 'W-ZW', 'W', 'W-NW', 'NW', 'N-NW', 'N'
    ]
  },
  ru: {
    tempHi: "Температура",
    tempLo: "Температура ночью",
    precip: "Осадки",
    uPress: "гПа",
    uSpeed: "м/с",
    uPrecip: "мм",
    cardinalDirections: [
      'С', 'С-СВ', 'СВ', 'В-СВ', 'В', 'В-ЮВ', 'ЮВ', 'Ю-ЮВ',
      'Ю', 'Ю-ЮЗ', 'ЮЗ', 'З-ЮЗ', 'З', 'З-СЗ', 'СЗ', 'С-СЗ', 'С'
    ]
  },
  sv: {
    tempHi: "Temperatur",
    tempLo: "Temperatur natt",
    precip: "Nederbörd",
    uPress: "hPa",
    uSpeed: "m/s",
    uPrecip: "mm",
    cardinalDirections: [
      'N', 'N-NO', 'NO', 'O-NO', 'O', 'O-SO', 'SO', 'S-SO',
      'S', 'S-SV', 'SV', 'V-SV', 'V', 'V-NV', 'NV', 'N-NV', 'N'
    ]
  }
};

class WeatherCardChart extends Polymer.Element {

  static get template() {
    return Polymer.html `
      <style>
        ha-icon {
        color: var(--paper-item-icon-color);
        }
        .card {
        padding: 0 18px 18px 18px;
        }
        .main {
        display: flex;
        align-items: center;
        font-size: 60px;
        font-weight: 350;
        margin-top: -10px;
        }
        .main ha-icon {
        --iron-icon-height: 74px;
        --iron-icon-width: 74px;
        margin-right: 20px;
        }
        .main div {
        cursor: pointer;
        margin-top: -11px;
        }
        .feels_like {
        cursor: pointer;
        font-size: 14px;
        }
        .feels_like_sup {
        font-size: 10px;
        }
        .main sup {
        font-size: 32px;
        }
        .summary {
        font-size: 14px;
        margin-left: 20px;
        }
        .attributes {
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 10px 0px 10px 0px;
        }
        .attributes div {
        #text-align: center;
        }
        .conditions {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0px 2px 0px 15px;
        }
        .fcasttooltip {
        position: relative;
        display: inline-block;
        }
        /* Tooltip text */
        .fcasttooltip .fcasttooltiptext {
        visibility: hidden;
        width: 100px;
        background-color: #555;
        color: #fff;
        text-align: center;
        padding: 5px 5px;
        border-radius: 6px;
        /* Position the tooltip text */
        position: absolute;
        z-index: 1;
        bottom: 200%;
        left: 50%;
        margin-left: -50px;
        /* Fade in tooltip */
        opacity: 0;
        transition: opacity 0.3s;
        }
        /* Show the tooltip text when you mouse over the tooltip container */
        .fcasttooltip:hover .fcasttooltiptext {
        visibility: visible;
        opacity: 1;
        }    
      </style>
      <ha-card header="[[title]]">
        <div class="card">
          <div class="main">
            <ha-icon icon="[[getWeatherIcon(weatherObj.state)]]"></ha-icon>
            <template is="dom-if" if="[[tempObj]]">
              <div on-click="_tempAttr">[[roundNumber(tempObj.state)]]<sup>[[tempObj.attributes.unit_of_measurement]]</sup>
              <template is="dom-if" if="[[feels_likeObj]]">
                <span class="feels_like" on-click="_feels_likeAttr">[[ll('feels_like')]]: [[roundNumber(feels_likeObj.state)]][[feels_likeObj.attributes.unit_of_measurement]]</span>
              </template>
            </div>
            </template>
            <template is="dom-if" if="[[!tempObj]]">
              <div on-click="_weatherAttr">[[roundNumber(weatherObj.attributes.temperature)]]<sup>[[getUnit('temperature')]]</sup>
              <template is="dom-if" if="[[feels_likeObj]]">
                <span class="feels_like" on-click="_feels_likeAttr"><br />[[ll('feels_like')]]:[[roundNumber(feels_likeObj.state)]]<sup>[[feels_likeObj.attributes.unit_of_measurement]]</sup></span>
              </template>
            </div>
            </template>
            <div class="summary" on-click="_weatherAttr">[[getSummary(weatherObj)]]</div>
            </template>
          </div>
          <div class="attributes" on-click="_weatherAttr">
            <div>
              <ha-icon icon="hass:water-percent"></ha-icon>
              <template is="dom-if" if="[[humidityObj]]">
                <span on-click="_humidityAttr">[[roundNumber(humidityObj.state)]] [[humidityObj.attributes.unit_of_measurement]]</span><br>
              </template>
              <template is="dom-if" if="[[!humidityObj]]">
                [[roundNumber(weatherObj.attributes.humidity)]] %<br>
              </template>
              <ha-icon icon="hass:gauge"></ha-icon>
              <template is="dom-if" if="[[pressureObj]]">
                <span on-click="_pressureAttr">[[roundNumber(pressureObj.state,2)]] [[pressureObj.attributes.unit_of_measurement]]</span>
              </template>
              <template is="dom-if" if="[[!pressureObj]]">
                [[roundNumber(weatherObj.attributes.pressure,2)]] [[ll('uPress')]]
              </template>
              <template is="dom-if" if="[[option1Obj]]">
                <br><span on-click="_option1Attr">[[option1Obj.attributes.friendly_name]] [[option1Obj.state]]</span> [[option1Obj.attributes.unit_of_measurement]]
              </template>
            </div>
            <div>
              <template is="dom-if" if="[[sunObj]]">
                <ha-icon icon="mdi:weather-sunset-up"></ha-icon>
                [[computeTime(sunObj.attributes.next_rising)]]<br>
                <ha-icon icon="mdi:weather-sunset-down"></ha-icon>
                [[computeTime(sunObj.attributes.next_setting)]]
              </template>
              <template is="dom-if" if="[[option2Obj]]">
                <br><span on-click="_option2Attr">[[option2Obj.attributes.friendly_name]] [[option2Obj.state]] [[option2Obj.attributes.unit_of_measurement]]</span>
              </template>
            </div>
            <div>
              <ha-icon icon="[[getWindDirIcon(windBearing)]]"></ha-icon>
              [[getWindDir(windBearing)]]<br>
              <ha-icon icon="hass:weather-windy"></ha-icon>
              [[computeWind(weatherObj.attributes.wind_speed)]] [[ll('uSpeed')]]
              <template is="dom-if" if="[[option3Obj]]">
                <br><span on-click="_option3Attr">[[option3Obj.attributes.friendly_name]] [[option3Obj.state]]</span> [[option3Obj.attributes.unit_of_measurement]]
              </template>
            </div>
          </div>
          <ha-chart-base hass="[[_hass]]" data="[[ChartData]]"></ha-chart-base>
          <div class="conditions">
            <template is="dom-repeat" items="[[forecast]]">
              <div on-mouseover="_tooltipPosition" class="fcasttooltip">
                <div class="fcasttooltiptext">[[getDetailedDescription(item)]]</div>
                <ha-icon style="--mdc-icon-size: 100%;" icon="[[getWeatherIcon(item.condition)]]"></ha-icon>
              </div>
            </template>
          </div>
        </div>
      </ha-card>
    `;
  }

  static get properties() {
    return {
      config: Object,
      sunObj: Object,
      tempObj: Object,
      feels_likeObj: Object,
      humidityObj: Object,
      pressureObj: Object,
      option1Obj: Object,
      option2Obj: Object,
      option3Obj: Object,
      mode: String,
      points: Number,
      weatherObj: {
        type: Object,
        observer: 'dataChanged'
      }
    };
  }

  constructor() {
    super();
    this.mode = 'daily';
    this.weatherIcons = {
      'clear-night': 'hass:weather-night',
      'cloudy': 'hass:weather-cloudy',
      'fog': 'hass:weather-fog',
      'hail': 'hass:weather-hail',
      'lightning': 'hass:weather-lightning',
      'lightning-rainy': 'hass:weather-lightning-rainy',
      'partlycloudy': 'hass:weather-partly-cloudy',
      'pouring': 'hass:weather-pouring',
      'rainy': 'hass:weather-rainy',
      'snowy': 'hass:weather-snowy',
      'snowy-rainy': 'hass:weather-snowy-rainy',
      'sunny': 'hass:weather-sunny',
      'windy': 'hass:weather-windy',
      'windy-variant': 'hass:weather-windy-variant'
    };
    this.cardinalDirectionsIcon = [
      'mdi:arrow-down', 'mdi:arrow-bottom-left', 'mdi:arrow-left',
      'mdi:arrow-top-left', 'mdi:arrow-up', 'mdi:arrow-top-right',
      'mdi:arrow-right', 'mdi:arrow-bottom-right', 'mdi:arrow-down'
    ];
  }

  setConfig(config) {
    this.config = config;
    this.title = config.title;
    //this.weatherObj = config.weather;
    //this.tempObj = config.temp;
    //this.humidityObj = config.humidity;
    //this.pressureObj = config.pressure;
    //this.option1Obj = config.option1;
    //this.option2Obj = config.option2;
    //this.option3Obj = config.option3;
    this.mode = config.mode;
    this.points = typeof (config.points) === 'number' ? config.points : 9;
    if (!config.weather) {
      throw new Error('Please define "weather" entity in the card config');
    }
  }

  set hass(hass) {
    this._hass = hass;
    this.lang = this._hass.selectedLanguage || this._hass.language;
    this.weatherObj = this.config.weather in hass.states ? hass.states[this.config.weather] : null;
    this.sunObj = 'sun.sun' in hass.states ? hass.states['sun.sun'] : null;
    this.tempObj = this.config.temp in hass.states ? hass.states[this.config.temp] : null;
    this.feels_likeObj = this.config.feels_like in hass.states ? hass.states[this.config.feels_like] : null;
    this.humidityObj = this.config.humidity in hass.states ? hass.states[this.config.humidity] : null;
    this.pressureObj = this.config.pressure in hass.states ? hass.states[this.config.pressure] : null;
    this.option1Obj = this.config.option1 in hass.states ? hass.states[this.config.option1] : null;
    this.option2Obj = this.config.option2 in hass.states ? hass.states[this.config.option2] : null;
    this.option3Obj = this.config.option3 in hass.states ? hass.states[this.config.option3] : null;
    this.forecast = this.weatherObj.attributes.forecast.slice(0, this.points);
    this.windBearing = this.weatherObj.attributes.wind_bearing;
  }

  dataChanged(obj) {
    this.drawChart();
    //this.setProperties({
    //    _weatherObj: obj
    //});
  }

  roundNumber(number, decimals = 0) {
    return Number(Math.round(number + 'e' + decimals) + 'e-' + decimals);
  }

  ll(str) {
    if (locale[this.lang] === undefined)
      return locale.en[str];
    return locale[this.lang][str];
  }

  computeTime(time) {
    const date = new Date(time);
    return date.toLocaleTimeString(this.lang, {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  computeWind(speed) {
    var calcSpeed = Math.round(speed * 1000 / 3600);
    //return calcSpeed;
    return speed;
  }

  getCardSize() {
    return 4;
  }

  getUnit(unit) {
    return this._hass.config.unit_system[unit] || '';
  }

  getWeatherIcon(condition) {
    return this.weatherIcons[condition];
  }

  getWindDirIcon(degree) {
    return this.cardinalDirectionsIcon[parseInt((degree + 22.5) / 45.0)];
  }

  getWindDir(deg) {
    if (locale[this.lang] === undefined)
      return locale.en.cardinalDirections[parseInt((deg + 11.25) / 22.5)];
    return locale[this.lang]['cardinalDirections'][parseInt((deg + 11.25) / 22.5)];
  }

  getSummary(Obj) {
    return this.getDetailedDescription(Obj.attributes.forecast[0]);
  }

  getDetailedDescription(item) {
    var title;
    var tooltip;
    var daynight;
    var data = new Date(item.datetime).toLocaleDateString(locale, {
      weekday: 'short'
    });
    var time = new Date(item.datetime).toLocaleTimeString(locale, {
      hour: 'numeric'
    });
    if (this.mode == 'hourly') {
      title = time;
    } else {
      title = data
    }
    if (item.daytime) {
      daynight = 'day';
    } else {
      daynight = 'night';
    }
    tooltip = title + ' ' + daynight + ': ' + item.detailed_description;
    return tooltip;
  }

  drawChart() {
    if (typeof this.weatherObj.attributes === 'undefined') {
      return [];
    }
    if (typeof this.weatherObj.attributes.forecast === 'undefined') {
      return [];
    }
    var data = this.weatherObj.attributes.forecast.slice(0, this.points);
    var locale = this._hass.selectedLanguage || this._hass.language;
    var tempUnit = this._hass.config.unit_system.temperature;
    var lengthUnit = this._hass.config.unit_system.length;
    var precipUnit = lengthUnit === 'km' ? this.ll('uPrecip') : 'in';
    var mode = this.mode;
    var i;
    var dateTime = [];
    var tempHigh = [];
    var tempLow = [];
    var precip = [];
    for (i = 0; i < data.length; i++) {
      var d = data[i];
    
      dateTime.push(new Date(d.datetime));
      if (d.daytime) {
        tempHigh.push({x: new Date(d.datetime), y: d.temperature });
      } else {
        tempLow.push({x: new Date(d.datetime), y: d.temperature });
      }
      precip.push(d.precipitation_probability);
    }
    var style = getComputedStyle(document.body);
    var textColor = style.getPropertyValue('--primary-text-color');
    var dividerColor = style.getPropertyValue('--divider-color');
    const chartOptions = {
      type: 'bar',
      data: {
        labels: dateTime,
        datasets: [{
            label: this.ll('tempHi'),
            type: 'line',
            data: tempHigh,
            yAxisID: 'TempAxis',
            borderWidth: 2.0,
            lineTension: 0.4,
            pointRadius: 3.0,
            pointHitRadius: 5.0,
            fill: false,
          },
          {
            label: this.ll('tempLo'),
            type: 'line',
            data: tempLow,
            yAxisID: 'TempAxis',
            borderWidth: 2.0,
            lineTension: 0.4,
            pointRadius: 3.0,
            pointHitRadius: 5.0,
            fill: false,
          },
          {
            label: this.ll('precip'),
            type: 'bar',
            data: precip,
            yAxisID: 'PrecipAxis',
          },
        ]
      },
      options: {
        animation: {
          duration: 300,
          easing: 'linear',
          onComplete: function () {
            var chartInstance = this.chart,
              ctx = chartInstance.ctx;
            ctx.fillStyle = textColor;
            var fontSize = 10;
            var fontStyle = 'normal';
            var fontFamily = 'Roboto';
            ctx.font = Chart.helpers.fontString(fontSize, fontStyle, fontFamily);
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            var meta = chartInstance.controller.getDatasetMeta(2);
            meta.data.forEach(function (bar, index) {
              var data = (Math.round((chartInstance.data.datasets[2].data[index]) * 10) / 10).toFixed(0);
              ctx.fillText(data, bar._model.x, bar._model.y - 5);
            });
          },
        },
        legend: {
          display: false,
        },
        scales: {
          xAxes: [{
              type: 'time',
              distribution: 'series',
              maxBarThickness: 15,
              display: false,
              ticks: {
                display: false,
              },
              gridLines: {
                display: false,
              },
            },
            {
              id: 'DateAxis',
              position: 'bottom',
              gridLines: {
                display: true,
                drawBorder: false,
                color: dividerColor,
              },
              ticks: {
                display: true,
                source: 'labels',
                autoSkip: true,
                fontColor: textColor,
                maxRotation: 0,
                callback: function (value, index, values) {
                  var data = new Date(value).toLocaleDateString(locale, {
                    weekday: 'short'
                  });
                  var time = new Date(value).toLocaleTimeString(locale, {
                    hour: 'numeric'
                  });
                  if (mode == 'hourly') {
                    return time;
                  }
                  return data;
                },
              },
            }
          ],
          yAxes: [{
              id: 'TempAxis',
              position: 'left',
              gridLines: {
                display: true,
                drawBorder: false,
                color: dividerColor,
                borderDash: [1, 3],
              },
              ticks: {
                display: true,
                fontColor: textColor,
              },
              afterFit: function (scaleInstance) {
                scaleInstance.width = 28;
              },
            },
            {
              id: 'PrecipAxis',
              position: 'right',
              gridLines: {
                display: false,
                drawBorder: false,
                color: dividerColor,
              },
              ticks: {
                display: false,
                min: 0,
                max: 100,
                //suggestedMax: 20,
                fontColor: textColor,
              },
              afterFit: function (scaleInstance) {
                scaleInstance.width = 15;
              },
            }
          ],
        },
        tooltips: {
          mode: 'point'
//          callbacks: {
//            title: function (items, data) {
//              const item = items[0];
//              const date = data.labels[item.index];
//              return new Date(date).toLocaleDateString(locale, {
//                month: 'long',
//                day: 'numeric',
//                weekday: 'long',
//                hour: 'numeric',
//                minute: 'numeric',
//              });
//            },
//            label: function (tooltipItems, data) {
//              var label = data.datasets[tooltipItems.datasetIndex].label || '';
//              if (data.datasets[2].label == label) {
//                return label + ': ' + (tooltipItems.yLabel ?
//                  (tooltipItems.yLabel + ' %') : ('0 %'));
//              }
//              return label + ': ' + tooltipItems.yLabel + ' ' + tempUnit;
//            },
//          },
        },
      },
    };
    this.ChartData = chartOptions;
  }

  _fire(type, detail, options) {
    const node = this.shadowRoot;
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const e = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    e.detail = detail;
    node.dispatchEvent(e);
    return e;
  }

  _tempAttr() {
    this._fire('hass-more-info', {
      entityId: this.config.temp
    });
  }
  _feels_likeAttr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.feels_like
    });
  }
  _humidityAttr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.humidity
    });
  }
  _pressureAttr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.pressure
    });
  }
  _option1Attr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.option1
    });
  }
  _option2Attr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.option2
    });
  }
  _option3Attr(ev) {
    ev.stopPropagation();
    this._fire('hass-more-info', {
      entityId: this.config.option3
    });
  }

  _weatherAttr() {
    this._fire('hass-more-info', {
      entityId: this.config.weather
    });
  }
  _tooltipPosition(ev) {
    var el = ev.currentTarget;
    var elChild = ev.currentTarget.firstElementChild;
    var elParent = ev.currentTarget.parentNode;
    var offset = elParent.getBoundingClientRect().left - el.getBoundingClientRect().left;
    elChild.style.marginLeft = offset + "px";
    elChild.style.left = "0px";
    elChild.style.width = elParent.clientWidth + "px";
  }


}

customElements.define('weather-card-chart', WeatherCardChart);
