/*

  https://github.com/AdamNaj/ZWaveGraphHA
  Old: https://gist.github.com/AdamNaj/cbf4d792a22f443fe9d354e4dca4de00

  Version 1.0:
    - based on the brilliant code by @NigelL - with cosmetic changes mostly about clarity and shaping of nodes based on their function

  Version 2.0: (02 July 2019)
    - you can now pan the graph by dragging it
    - you can now zoom the graph with your mouse wheel
    - the graph initially is scaled to fill the full screen width
    - added minimap to visualize which part of the graph you can see at the oment on the screen
    - added 2 more tree layouts (click on the top-legend) - they didn't necessarily help me make the graph more manageable for me, but may be useful to others in their topology
    - added the ability to show all node connections if someone wants to see the full picture of their Z-Wave mesh
    - fixed the broken new line in the node tooltips
    - you can now click on the node to see the entity dialog

  Version 2.1: (20 September 2019)
    - added Tools to graph legends so you can easily navigate to Z-Wave Network Management
    - fixed (hopefully) the problem with the graph requiring page reload then navigating to it

  Version 2.2: (04 October 2019)
    - ability to turn off node grouping. Having the nodes grouped requires editing locations defined in the zwcfg_*.cfg

  Version 2.3: (03 February 2020)
    - Graph background reflects theme background color after page reload
    - Fixed problem where some removed nodes lingering in the device registry could cause wrong node info card to be displayed after clicking on nodes with higher ids

  Version 3.0: (21 September 2020)
    - restructure to accomodate for a breaking change in Home Assistant 0.115
    - default graph ranker, edge visibility and grouping settings are now customizable in configuration.yaml
    - move from Gist to GitHub - Pull Requests are welcome :)
*/

import {
  LitElement,
  html,
  css,
} from "https://unpkg.com/lit-element@2.4.0/lit-element.js?module";

import "https://d3js.org/d3.v5.min.js";
import "https://cdnjs.cloudflare.com/ajax/libs/dagre-d3/0.6.1/dagre-d3.js";
import "https://cdn.jsdelivr.net/npm/svg-pan-zoom@3.5.0/dist/svg-pan-zoom.min.js";

class ZWaveGraphPanel extends LitElement {
  static get properties() {
    return {
      hass: { type: Object },
      narrow: { type: Boolean },
      route: { type: Object },
      panel: { type: Object },
    };
  }

  getHtmlTemplate = function(){
    var template = this.render();
    return template.getHTML();
  }

  render() {
    return html`
      <div id="content" class="content" style="background: var(--primary-background-color);">
        <svg id="svg" width="100%" height="100%"></svg>
        <svg id="scopeContainer" class="thumb">
          <g>
            <rect id="scope" fill="red" fill-opacity="0.03" stroke="red" stroke-width="1px" stroke-opacity="0.3" x="0"
              y="0" width="0" height="0" />
            <line id="line1" stroke="red" stroke-width="1px" x1="0" y1="0" x2="0" y2="0" />
            <line id="line2" stroke="red" stroke-width="1px" x1="0" y1="0" x2="0" y2="0" />
          </g>
        </svg>
        <svg id="miniSvg" class="thumb" style="background: var(--primary-background-color);"></svg>
      </div>
      `;
  }

  static get styles() {
    return css`
      :host {
        background-color: #0a0a0a;
        padding: 16px;
        display: block;
      }

      .thumb {
        border: 1px solid #ddd;
        position: absolute;
        bottom: 5px;
        right: 5px;
        margin: 1px;
        padding: 1px;
        overflow: hidden;
        display: none;
      }

      #miniSvg {
        z-index: 110;
        background: white;
        display: none;
      }

      #scopeContainer {
        z-index: 120;
        display: none;
      }

      .content {
        overflow: hidden;
        position: absolute;
        left: 0px;
        top: 0px;
        bottom: 0px;
        right: 0px;
        padding: 8px;
      }

      svg>.output {
        fill: #3598DB;
        stroke: #2470A2;
      }

      .node>rect {
        stroke: black;
      }

      .node.layer-1>rect,
      .edgePath.layer-1>path {
        fill: #3598DB;
        stroke: #2470A2;
      }

      .node.layer-1>polygon,
      .node.layer-1>rect,
      .edgePath.layer-1>path {
        fill: #3598DB;
        stroke: #2470A2;
      }

      .node.layer-1 text {
        fill: #1E5B84;
      }

      .node.layer-2>polygon,
      .node.layer-2>rect,
      .edgePath.layer-2>path {
        stroke: #1D8548;
      }

      .node.layer-2>rect,
      .edgePath.layer-2>path {
        fill: #1BBC9B;
      }

      .node.layer-2 text {
        fill: #11512C;
      }

      .node.layer-3>polygon,
      .node.layer-3>rect,
      .edgePath.layer-3>path {
        stroke: #1D8548;
      }

      .node.layer-3>rect,
      .edgePath.layer-3>path {
        fill: #2DCC70;
      }

      .node.layer-3 text {
        fill: #1D8548;
      }

      .node.layer-4>polygon,
      .node.layer-4>rect,
      .edgePath.layer-4>path {
        stroke: #D25400;
      }

      .node.layer-4>rect,
      .edgePath.layer-4>path {
        fill: #F1C40F;
      }

      .node.layer-5>polygon,
      .node.layer-4 text {
        fill: #D25400;
      }

      .node.layer-5>polygon,
      .node.layer-5>rect,
      .edgePath.layer-5>path {
        stroke: #D25400;
      }

      .node.layer-5>rect,
      .edgePath.layer-5>path {
        fill: #E77E23;
      }

      .node.layer-5 text {
        fill: #D25400;
      }

      .node.Error>polygon,
      .node.Error>rect {
        fill: #ff7676;
        stroke: darkred;
      }

      .node.Error text {
        fill: darkred;
      }

      .node.unset>rect {
        stroke: #666;
      }

      .node.unset>polygon,
      .node.unset>rect {
        stroke: #666;
        fill: lightgray;
      }

      .cluster>rect {
        stroke: lightgray;
        fill: #f8f8f8;
        stroke-width: 1px;
        stroke-linecap: round;
      }

      .cluster>.label {
        /* stroke: gray; */
        fill: lightgray;
      }

      .node.unset text {
        fill: #666;
      }

      .node text {
        font-size: 12px;
      }

      .edgePath.layer-1>path {
        fill: transparent;
      }

      .edgePath path {
        stroke: #333;
        fill: #333;
      }

      .node>polygon {
        opacity: 0.7;
      }

      .node>rect {
        stroke-width: 1px;
        stroke-linecap: round;
      }
      `;
  }

  async firstUpdated() {
    // Give the browser a chance to paint
    await new Promise((r) => setTimeout(r, 0));
    this.ready();
  }


  ready() {
    //super.ready();

    var that = this;
    setTimeout(function() {
      that.paintGraph(that.panel.config.ranker, that.panel.config.edge_visibility, that.panel.config.grouping);
    }, 100);
  }

  paintGraph(ranker, edgeVisibility, grouping) {
    var legends = [{
        shape: "rect",
        color: "#3598DB",
        stroke: "#2470A2",
        textcolor: "#2470A2",
        text: "Hub"
      },
      {
        shape: "rect",
        color: "#1BBC9B",
        stroke: "#1D8548",
        textcolor: "#11512C",
        text: "1 hop"
      },
      {
        shape: "rect",
        color: "#2DCC70",
        stroke: "#1D8548",
        textcolor: "#1D8548",
        text: "2 hops"
      },
      {
        shape: "rect",
        color: "#F1C40F",
        stroke: "#D25400",
        textcolor: "#D25400",
        text: "3 hops"
      },
      {
        shape: "rect",
        color: "E77E23",
        stroke: "#D25400",
        textcolor: "#D25400",
        text: "4 hops"
      },
      {
        shape: "rect",
        color: "crimson",
        stroke: "darkred",
        textcolor: "darkred",
        text: "Failed Node"
      },
      {
        shape: "rect",
        color: "lightgray",
        stroke: "#666666",
        textcolor: "#666666",
        text: "Unconnected"
      }
    ];

    var layout = [{
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Network Simplex",
        ranker: "network-simplex",
        cursor: "pointer"
      },
      {
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Tight Tree",
        ranker: "tight-tree",
        cursor: "pointer"
      },
      {
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Longest Path",
        ranker: "longest-path",
        cursor: "pointer"
      }
    ];

    var edgesLegend = [{
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Relevant Neighbors",
        edges: "relevant",
        cursor: "pointer"
      },
      {
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "All Neighbors",
        edges: "all",
        cursor: "pointer"
      }
    ];

    var groupingLegend = [{
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Z-Wave Locations",
        grouping: "z-wave",
        cursor: "pointer"
      },
      {
        shape: "rect",
        color: "var(--primary-color)",
        stroke: "#2470A2",
        textcolor: "var(--primary-color)",
        text: "Ungrouped",
        grouping: "ungrouped",
        cursor: "pointer"
      }
    ];

    var links = [{
      shape: "rect",
      color: "var(--primary-color)",
      stroke: "#2470A2",
      textcolor: "var(--primary-color)",
      text: "Network Management",
      cursor: "hand",
      url: "/config/zwave",
    }, ];

    this.$ = this.shadowRoot.querySelector("#content");
    this.$.svg = this.shadowRoot.querySelector("#svg");
    this.$.miniSvg = this.shadowRoot.querySelector("#miniSvg");
    this.$.scope = this.shadowRoot.querySelector("#scope");
    this.$.scopeContainer = this.shadowRoot.querySelector("#scopeContainer");
    this.$.svg.innerHTML = "";
    this.$.miniSvg.innerHTML = "";

    this.ranker = ranker;
    this.edgeVisibility = edgeVisibility;
    this.grouping = grouping;

    var data = this.listNodes(this.hass);

    var g = new dagreD3.graphlib.Graph({
      compound: true
    }).setGraph({});
    g.graph().rankDir = "BT";
    //g.graph().rankDir = 'RL';
    g.graph().nodesep = 10;

    g.graph().ranker = ranker;

    // Create the renderer
    var render = new dagreD3.render();

    var svg = d3.select(this.$.svg);
    var inner = svg.append("g").attr("transform", "translate(20,200)scale(1)");

    g.graph().minlen = 0;

    // Add our custom shape (a house)
    render.shapes().house = this.renderHouse;
    render.shapes().battery = this.renderBattery;

    var groups = [];

    var nodes = data["nodes"];
    // Set the parents to define which nodes belong to which cluster

    // add nodes  to graph
    for (var i = 0; i < nodes.length; i++) {
      var node = nodes[i];
      g.setNode(node.id, node);
      if (this.grouping !== "ungrouped" && node.location != "" && node.location != undefined) {
        g.setNode(node.location, {
          label: node.location,
          clusterLabelPos: 'bottom',
          class: "group",
          entityId: node.entity_id
        });
        g.setParent(node.id, node.location);
      }
    }

    // add edges to graph
    for (var i = 0; i < data["edges"].length; i++) {
      var edge = g.setEdge(
        data["edges"][i].from,
        data["edges"][i].to, {
          label: "",
          arrowhead: "undirected",
          style: data["edges"][i].style,
          class: data["edges"][i].class,
          curve: d3.curveBundle.beta(0.2)
          //curve: d3.curveBasis
        })
    }


    // Run the renderer. This is what draws the final graph.
    render(inner, g);


    // create battery state gradients
    for (let layer = 0; layer < legends.length; layer++) {
      for (let percent = 0; percent <= 100; percent += 10) {
        var grad = svg.append("defs").append("linearGradient").attr("id", "fill-" + (layer + 1) + "-" + percent)
          .attr("x1", "0%").attr("x2", "0%").attr("y1", "0%").attr("y2", "100%");
        grad.append("stop").attr("offset", (100 - percent - 10) + "%").style("stop-color", "white");
        grad.append("stop").attr("offset", (100 - percent) + "%").style("stop-color", legends[layer].color);
      }
    }

    // Add the title element to be used for a tooltip (SVG functionality)
    inner.selectAll("g.node")
      .append("title").html(function (d) {
        return g.node(d).title;
      });

    inner.selectAll("g.node")
      .attr("layer", function (d) {
        return g.node(d).layer;
      })
      .attr("fill", function (d) {
        if (g.node(d).battery_level === 100) {
          return "url(#fill-" + g.node(d).layer + "-100)";
        }
        if (g.node(d).battery_level !== undefined) {
          return "url(#fill-" + g.node(d).layer + "-" + Math.floor(g.node(d).battery_level / 10 % 10) + "0)";
        }
      });

    inner.selectAll("g.edgePath")
      .attr("layer", function (d) {
        return g.edges(d).layer;
      });

    var that = this;
    var handleClick = function (d, i, nodeList) { // Add interactivity
      var nodeId = nodeList[i].id;
      var node = nodes.find(function(element) {
        return element.id == nodeId;
      });
      that.fire('hass-more-info', {
        entityId: node.entity_id
      });
    };

    // append handlers
    svg.selectAll(".node")
      .on("mouseover", this.handleMouseOver)
      .on("mouseout", this.handleMouseOut)
      .on("click tap touchstart", handleClick);


    this.addLegend(this.$, svg, legends, 5, 20, "Node Colors", ranker, this.edgeVisibility, this.grouping);
    this.addLegend(this.$, svg, layout, 150, 20, "Tree Layout", ranker, this.edgeVisibility, this.grouping);
    this.addLegend(this.$, svg, edgesLegend, 320, 20, "Neighbors", ranker, this.edgeVisibility, this.grouping);
    this.addLegend(this.$, svg, groupingLegend, 510, 20, "Grouping", ranker, this.edgeVisibility, this.grouping);
    this.addLegend(this.$, svg, links, 700, 20, "Tools", ranker, this.edgeVisibility, this.grouping);

    this.$.miniSvg.innerHTML = this.$.svg.innerHTML;

    var panZoomGraph = svgPanZoom(this.$.svg);

    this.bindThumbnail(this.$);

  }

  listNodes(hass) {
    let states = new Array();
    for (let state in hass.states) {
      states.push({
        name: state,
        entity: hass.states[state]
      });
    }
    let zwaves = states.filter((s) => {
      return s.name.indexOf("zwave.") == 0 && s.entity.attributes["capabilities"] !== undefined
    });
    let result = {
      "edges": [],
      "nodes": []
    };

    let hubNode = 0;
    let neighbors = {};

    for (let b in zwaves) {
      let id = zwaves[b].entity.attributes["node_id"];
      let node = zwaves[b].entity;
      if (node.attributes["capabilities"].filter(
          (s) => {
            return s == "primaryController"
          }).length > 0) {
        hubNode = id;
      }
      neighbors[id] = node.attributes['neighbors'];

      let entities = states.filter((s) => {
        return ((s.name.indexOf("zwave.") == -1) &&
          (s.entity.attributes["node_id"] == id))
      });
      let batlev = node.attributes.battery_level;

      // create node
      let entity = {
        "id": id,
        "entity_id": node.entity_id,
        "label": "[" + id + (node.attributes["is_zwave_plus"] ? "+" : "") + "] " + (node.attributes[
          "friendly_name"] + " (" + node.attributes["averageResponseRTT"] + "ms)").replace(/ /g, "\n"),
        "class": "unset layer-7",
        "layer": 7,
        "rx": "6",
        "ry": "6",
        "neighbors": neighbors[id],
        "battery_level": batlev,
        "mains": batlev,
        "location": node.attributes["location"],
        "failed": node.attributes["is_failed"],
        "title": "<b>" + node.attributes["node_name"] + "</b>\n" +
          "\n Entity ID: " + node.entity_id +
          "\n Node: " + id + (node.attributes["is_zwave_plus"] ? "+" : "") +
          "\n Product Name: " + node.attributes["product_name"] +
          "\n Average Request RTT: " + node.attributes["averageResponseRTT"] + "ms" +
          "\n Power source: " + (batlev != undefined ? "battery (" + batlev + "%)" : "mains") +
          "\n " + entities.length + " entities" +
          "\n Neighbors: " + node.attributes['neighbors'],
        "forwards": (node.attributes.is_awake && node.attributes.is_ready && !node.attributes.is_failed &&
          node.attributes.capabilities.includes("listening")),
      };

      entity["shape"] = id === hubNode ? "house" : (entity.forwards || batlev === undefined ? "rect" : "battery");

      if (node.attributes["is_failed"]) {
        entity.label = "FAILED: " + entity.label;
        entity["font.multi"] = true;
        entity["title"] = "<b>FAILED: </b>" + entity.title;
        entity["group"] = "Failed";
        entity["failed"] = true;
        entity["class"] = "Error";
      }

      if (hubNode == id) {
        entity.label = "ZWave Hub";
        entity.borderWidth = 2;
        entity.fixed = true;
      }

      result.nodes.push(entity);
    }


    if (hubNode > 0) {
      let layer = 0;
      let previousRow = [hubNode];
      let mappedNodes = [hubNode];
      let layers = [];

      while (previousRow.length > 0) {
        layer = layer + 1;
        let nextRow = [];
        let layerMembers = []
        layers[layer] = layerMembers;

        for (let target in previousRow) {

          // assign node to layer
          result.nodes.filter((n) => {
              return ((n.id == previousRow[target]) && (n.group = "unset"))
            })
            .every((d) => {
              d.class = "layer-" + layer;
              d.layer = layer;
              if (d.failed) {
                d.class = d.class + " Error"
              }

              if (d.neighbors !== undefined) {
                d.neighbors.forEach((n) => {
                  d.class = d.class + " neighbor-" + n
                });
              }
            })

          if (result.nodes.filter((n) => {
              return ((n.id == previousRow[target]) && (n.forwards))
            }).length > 0) {
            let row = neighbors[previousRow[target]];
            for (let node in row) {
              if (neighbors[row[node]] !== undefined) {
                if (!mappedNodes.includes(row[node])) {
                  layerMembers.push(row[node]);
                  result.edges.push({
                    "from": row[node],
                    "to": previousRow[target],
                    "style": "",
                    "class": "layer-" + (layer + 1) + " node-" + row[node] + " node-" + previousRow[target],
                    "layer": layer,
                  });
                  nextRow.push(row[node]);
                } else {
                  // uncomment to show edges regardless of rows - mess!
                  if (this.edgeVisibility === "all") {
                    result.edges.push({
                      "from": row[node],
                      "to": previousRow[target],
                      "style": "stroke-dasharray: 5, 5; fill:transparent; ", //"stroke: #ddd; stroke-width: 1px; fill:transparent; stroke-dasharray: 5, 5;",
                      "class": "layer-" + (layer + 1) + " node-" + row[node] + " node-" + previousRow[target]
                    });
                  }
                }
              }
            }
          }
        }

        for (let idx in nextRow) {
          mappedNodes.push(nextRow[idx]);
        }
        previousRow = nextRow;
      }
    }
    return result;
  }

  // Add our custom shape (a house)
  renderHouse(parent, bbox, node) {
    var w = bbox.width,
      h = bbox.height,
      points = [{
          x: 0,
          y: 0
        },
        {
          x: w,
          y: 0
        },
        {
          x: w,
          y: -h
        },
        {
          x: w / 2,
          y: -h * 3 / 2
        },
        {
          x: 0,
          y: -h
        }
      ],
      shapeSvg = parent.insert("polygon", ":first-child")
      .attr("points", points.map(function (d) {
        return d.x + "," + d.y;
      }).join(" "))
      .attr("transform", "translate(" + (-w / 2) + "," + (h * 3 / 4) + ")");

    node.intersect = function (point) {
      return dagreD3.intersect.polygon(node, points, point);
    };

    return shapeSvg;
  };

  renderBattery(parent, bbox, node) {
    var w = bbox.width,
      h = bbox.height,
      points = [{
          x: 0,
          y: 0
        }, // bottom left
        {
          x: w,
          y: 0
        }, // bottom line
        {
          x: w,
          y: -h
        }, // right line
        {
          x: w * 7 / 10,
          y: -h
        }, // top right
        {
          x: w * 7 / 10,
          y: -h * 20 / 17
        }, // battery tip - right
        {
          x: w * 3 / 10,
          y: -h * 20 / 17
        }, // battery tip
        {
          x: w * 3 / 10,
          y: -h
        }, // battery tip - left
        {
          x: 0,
          y: -h
        }, // top left
        {
          x: 0,
          y: -h
        } // left line
      ],

      shapeSvg = parent.insert("polygon", ":first-child")
      .attr("points", points.map(function (d) {
        return d.x + "," + d.y;
      }).join(" "))
      .attr("transform", "translate(" + (-w / 2) + "," + (h * 2 / 4) + ")");

    node.intersect = function (point) {
      return dagreD3.intersect.polygon(node, points, point);
    };

    return shapeSvg;
  };

  handleMouseOver(d, i, nodeList) { // Add interactivity

    var svg;
    for (let nodeNum in nodeList) {
      let node = nodeList[nodeNum];
      if (node.style !== undefined && node.id !== d) {
        node.style.opacity = 0.1;
        svg = node.ownerSVGElement
      }
    }

    // Use D3 to select element, change color and size
    svg.querySelectorAll(".edgePath")
      .forEach(function (node) {
        node.style.opacity = "0.3"
      });

    var edges = svg.querySelectorAll(".edgePath.node-" + d);
    for (let i = 0; i < edges.length; i++) {
      edges[i].style.opacity = "1"
      edges[i].style['stroke-width'] = "2";
    };

    var neighbors = svg.querySelectorAll(".node.neighbor-" + d);
    for (let i = 0; i < neighbors.length; i++) {
      neighbors[i].style.opacity = "0.7"
    };
  };

  handleMouseOut(d, i, nodeList) { // Add interactivity

    var svg;
    for (let nodeNum in nodeList) {
      let node = nodeList[nodeNum];
      if (node.style !== undefined && node.id !== d) {
        node.style.opacity = 1;
        svg = node.ownerSVGElement
      }
    }

    // Use D3 to select element, change color and size
    svg.querySelectorAll(".edgePath")
      .forEach(function (node) {
        node.style.opacity = "1";
        node.style['stroke-width'] = "1";
      });
  };



  addLegend($, svg, legends, startX, startY, title, ranker, edges, grouping) {

    var that = this;

    var handleClick = function (d, i, nodeList) {

      if (nodeList[0].dataset.url !== undefined) {
        window.location = nodeList[0].dataset.url;
      }

      var ranker = nodeList[0].dataset.ranker || that.ranker;
      var edges = nodeList[0].dataset.edges || that.edgeVisibility;
      var grouping = nodeList[0].dataset.grouping || that.grouping;

      svg.selectAll("*").remove();

      $.innerHTML = that.getHtmlTemplate();

      that.paintGraph(ranker, edges, grouping);
    }

    var shape = svg.append('text')
      .attr('x', startX)
      .attr('y', startY + 5)
      .text(title)
      .attr('width', 10)
      .attr('height', 10)
      .style("fill", "var(--accent-color)")
      .style("font-weight", "800");

    for (var counter = 0; counter < legends.length; counter++) {

      var isLink = legends[counter].url !== undefined;

      if (isLink) {
        var text = svg.append('text')
          .attr("x", startX)
          .attr("y", startY + 10 + 20 * (counter + 1))
          .attr("class", "textselected")
          .attr('data-url', legends[counter].url)
          .text(legends[counter].text)
          .style("text-anchor", "start")
          .style("fill", legends[counter].textcolor)
          .style("font-size", 15)
          .style("text-decoration", "underline")
          .style("cursor", legends[counter].cursor)
          .on("click tap touchstart", handleClick);
      } else {

        var shape = svg.append(legends[counter].shape)
          .attr('x', startX)
          .attr('y', startY + 20 * (counter + 1))
          .attr('width', 10)
          .attr('height', 10)
          .style("stroke", legends[counter].stroke)
          .style("fill", legends[counter].color)
          .style("cursor", legends[counter].cursor);

        var text = svg.append('text')
          .attr("x", startX + 20)
          .attr("y", startY + 10 + 20 * (counter + 1))
          .attr("class", "textselected")
          .text(legends[counter].text)
          .style("text-anchor", "start")
          .style("fill", legends[counter].textcolor)
          .style("font-size", 15)
          .style("cursor", legends[counter].cursor);

        var dataLabel, dataValue, dataState;

        if (legends[counter].ranker) {
          dataLabel = 'data-ranker';
          dataValue = legends[counter].ranker;
          dataState = ranker;
        }

        if (legends[counter].edges) {
          dataLabel = 'data-edges';
          dataValue = legends[counter].edges;
          dataState = edges;
        }

        if (legends[counter].grouping) {
          dataLabel = 'data-grouping';
          dataValue = legends[counter].grouping;
          dataState = grouping;
        }

        if (dataLabel !== undefined) {
          shape.attr(dataLabel, dataValue)
            .on("click tap touchstart", handleClick);
          text.attr(dataLabel, dataValue)
            .on("click tap touchstart", handleClick);
            if (dataValue !== dataState) {
              shape.style("fill", "transparent");
            }
        }
      }
    }
  }

  bindThumbnail($) {

    var beforePanMain = function (oldPan, newPan) {
      var stopHorizontal = false,
        stopVertical = false,
        gutterWidth = 100,
        gutterHeight = 100
        // Computed variables
        ,
        sizes = this.getSizes(),
        leftLimit = -((sizes.viewBox.x + sizes.viewBox.width) * sizes.realZoom) + gutterWidth,
        rightLimit = sizes.width - gutterWidth - (sizes.viewBox.x * sizes.realZoom),
        topLimit = -((sizes.viewBox.y + sizes.viewBox.height) * sizes.realZoom) + gutterHeight,
        bottomLimit = sizes.height - gutterHeight - (sizes.viewBox.y * sizes.realZoom);
      customPan = {};
      customPan.x = Math.max(leftLimit, Math.min(rightLimit, newPan.x));
      customPan.y = Math.max(topLimit, Math.min(bottomLimit, newPan.y));
      return customPan;
    };

    var main = svgPanZoom($.svg, {
      zoomEnabled: true,
      controlIconsEnabled: true,
      fit: true,
      center: true,
      beforePan: beforePanMain
    });

    var thumb = svgPanZoom($.miniSvg, {
      zoomEnabled: false,
      panEnabled: false,
      controlIconsEnabled: false,
      dblClickZoomEnabled: false,
      preventMouseEventsDefault: true,
    });

    var resizeTimer;
    var interval = 300; //msec
    window.addEventListener('resize', function (event) {
      if (resizeTimer !== false) {
        clearTimeout(resizeTimer);
      }
      resizeTimer = setTimeout(function () {
        main.resize();
        thumb.resize();
      }, interval);
    });

    main.setOnZoom(function (level) {
      thumb.updateThumbScope();
    });

    main.setOnPan(function (point) {
      thumb.updateThumbScope();
    });

    var _updateThumbScope = function ($, main, thumb, scope, line1, line2) {
      var mainPanX = main.getPan().x,
        mainPanY = main.getPan().y,
        mainWidth = main.getSizes().width,
        mainHeight = main.getSizes().height,
        mainZoom = main.getSizes().realZoom,
        thumbPanX = thumb.getPan().x,
        thumbPanY = thumb.getPan().y,
        thumbZoom = thumb.getSizes().realZoom;

      if (mainZoom === 0) {
        return;
      }

      var thumByMainZoomRatio = thumbZoom / mainZoom;

      var scopeX = thumbPanX - mainPanX * thumByMainZoomRatio;
      var scopeY = thumbPanY - mainPanY * thumByMainZoomRatio;
      var scopeWidth = mainWidth * thumByMainZoomRatio;
      var scopeHeight = mainHeight * thumByMainZoomRatio;

      $.scope.setAttribute("x", scopeX + 1);
      $.scope.setAttribute("y", scopeY + 1);
      $.scope.setAttribute("width", scopeWidth - 2);
      $.scope.setAttribute("height", scopeHeight - 2);

    };

    thumb.updateThumbScope = function () {
      var scope = $.scope;
      var line1 = $.line1;
      var line2 = $.line2;
      _updateThumbScope($, main, thumb, scope, line1, line2);
    }
    thumb.updateThumbScope($);

    var _updateMainViewPan = function (clientX, clientY, scopeContainer, main, thumb) {
      var dim = scopeContainer.getBoundingClientRect(),
        mainWidth = main.getSizes().width,
        mainHeight = main.getSizes().height,
        mainZoom = main.getSizes().realZoom,
        thumbWidth = thumb.getSizes().width,
        thumbHeight = thumb.getSizes().height,
        thumbZoom = thumb.getSizes().realZoom;

      var thumbPanX = clientX - dim.left - thumbWidth / 2;
      var thumbPanY = clientY - dim.top - thumbHeight / 2;
      var mainPanX = -thumbPanX * mainZoom / thumbZoom;
      var mainPanY = -thumbPanY * mainZoom / thumbZoom;
      main.pan({
        x: mainPanX,
        y: mainPanY
      });
    };

    var updateMainViewPan = function (evt) {
      if (evt.which == 0 && evt.button == 0) {
        return false;
      }
      _updateMainViewPan(evt.clientX, evt.clientY, scopeContainer, main, thumb);
    }

    var scopeContainer = $.scopeContainer;
    scopeContainer.addEventListener('click', function (evt) {
      updateMainViewPan(evt);
    });

    scopeContainer.addEventListener('mousemove', function (evt) {
      updateMainViewPan(evt);
    });
  }

  fire(type, detail, options) {
    options = options || {};
    detail = (detail === null || detail === undefined) ? {} : detail;
    const event = new Event(type, {
      bubbles: options.bubbles === undefined ? true : options.bubbles,
      cancelable: Boolean(options.cancelable),
      composed: options.composed === undefined ? true : options.composed
    });
    event.detail = detail;
    const node = options.node || this;
    node.dispatchEvent(event);
    return event;
  }

}
customElements.define("zwave-graph-panel", ZWaveGraphPanel);