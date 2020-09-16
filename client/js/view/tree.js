let Backbone = require("backbone");
let Handlebars = require('handlebars/runtime').default;

Handlebars.registerHelper("treeTable", function(tree) {
  if (!tree || !tree.length) return "";
  let size = tree.length;
  let height = 32 - Math.clz32(size);
  // left & right trees are divided, thus height - 1
  tree[0].span = 1 << (height - 1);
  for (let i = 0; i < (1 << height) - 1; i++) {
    let level = 32 - Math.clz32(i + 1);
    tree[i] = tree[i] || {};
    tree[i].span = 1 << (height - level);
  }
  let left = collect(tree, 1, false);
  let right = collect(tree, 2, true);
  if (left[0]) left[0].push(tree[0]);

  let out = "";
  for (let i = 0; i < left.length; i++) {
    out += "<tr>"
    for (let node of left[i].concat(right[i] || [])) {
      let nodeClass = getNodeClass(node, tree);
      nodeClass.push("node");
      out += `<td rowspan="${node.span}" class="${nodeClass.join(" ")}">${innerTable(node)}</td>`;
    }
    out += "</tr>";
  }
  return out;
});

function getNodeClass(node, tree) {
  if (!node.nodeIndex && node.nodeIndex !== 0) {
    return ["empty-node"];
  }
  let nodeClass = [];
  let childIndex = 2 * node.nodeIndex + 1;
  if (!tree[childIndex] || !tree[childIndex].nodeIndex) {
    nodeClass.push("leaf");
  }
  nodeClass.push(node.nodeIndex % 2 === 0 ? "right-node" : "left-node");
  nodeClass.push(node.reverse ? "right-tree" : "left-tree");
  return nodeClass;
}

function innerTable(node) {
  if (!node.nodeIndex && node.nodeIndex !== 0) return "";
  node.players = node.players || [];
  node.bandNames = node.bandNames || [];
  let out = '<div class="inner-table"><table>';
  for (let i = 0; i < 2; i++) {
    out += "<tr><td>";
    if (node.players && node.players[i]) {
      out += `${node.bandNames[i]}(${node.players[i]})`;
    }
    out += "</td>";
    if (node.me && node.me === node.players[i]) {
      out += '<td><button class="btn btn-success button-prepare">准备</button></td>';
    } else if (node.winner && node.winner === node.players[i]) {
      out += '<td class="winner-badge"></td>';
    } else {
      out += "<td></td>";
    }
    out += "</tr>";
  }
  out += "</table></div>";
  return out;
}

function collect(tree, top, reverse) {
  if (top >= tree.length) return [];
  tree[top].reverse = reverse;
  let left = collect(tree, top * 2 + 1, reverse);
  if (left && left[0]) {
    if (reverse) {
      left[0].unshift(tree[top]);
    } else {
      left[0].push(tree[top]);
    }
  } else {
    left = [[tree[top]]];
  }
  return left.concat(collect(tree, top * 2 + 2, reverse));
}

let Tree = Backbone.View.extend({
  template: require("../../templates/competition/tree.handlebars"),
  initialize: function(options) {
    this.app = options.app;
    this.user = this.app.user;
    this._compId = options.compId;
    this._comp = {};
    this.listenTo(this.user, "change:serverStatus", this.renderStatus.bind(this));
    this.app.receive("response:competition", this.onCompResponse.bind(this));
    this.app.send("request:competition", {
      compId: this._compId,
      includeTree: true,
    });
    $(".gwent-battle").html(this.el);
    this.render();
  },
  events: {
    "click .button-quit": "close",
  },
  render: function() {
    this.$el.html(this.template({
      tree: this._comp.tree,
    }));
    this.renderStatus();
    return this;
  },
  renderStatus: function() {
    let data = this.user.get("serverStatus");
    this.$el.find(".nr-player-online").html(data.online);
    this.$el.find(".nr-player-idle").html(data.idle);
  },
  onCompResponse: function(comp) {
    this._comp = comp;
    this.render();
  },
});

module.exports = Tree;
