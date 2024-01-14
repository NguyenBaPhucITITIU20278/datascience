import define1 from "./7a9e12f9fb3d8e06@459.js";
import define2 from "./a33468b95d0b15b0@808.js";

function _1(md) {
  return md`
# Mapping 2022's COVID-19 Dynamics: Bubble Chart Overview
  `;
}

function _lowerbound(Inputs) {
  return Inputs.range([0, 3], { label: "ratio", step: 1 });
}

function _fontSize(Inputs) {
  return Inputs.range([10, 20], { label: "font size", step: 1 });
}

function _chart(BubbleChart, data, fill) {
  return BubbleChart(data, {
    label: (d) =>
      [
        ...d.id
          .split(".")
          .pop()
          .split(/(?=[A-Z][a-z])/g),
        d.value.toLocaleString("en"),
      ].join("\n"),
    value: (d) => d.value,
    title: (d) => d.id,
    width: 800,
    fill: fill,
  });
}

function _5(md) {
  return md`

  `;
}

function _BubbleChart(d3, fontSize, location) {
  return function BubbleChart(
    data,
    {
      name = ([x]) => x, // alias for label
      label = name, // given d in data, returns text to display on the bubble
      value = ([, y]) => y, // given d in data, returns a quantitative size
      group, // given d in data, returns a categorical value for color
      title, // given d in data, returns text to show on hover
      link, // given a node d, its link (if any)
      linkTarget = "_blank", // the target attribute for links, if any
      width = 640, // outer width, in pixels
      height = width, // outer height, in pixels
      padding = 3, // padding between circles
      margin = 1, // default margins
      marginTop = margin, // top margin, in pixels
      marginRight = margin, // right margin, in pixels
      marginBottom = margin, // bottom margin, in pixels
      marginLeft = margin, // left margin, in pixels
      groups, // array of group names (the domain of the color scale)
      colors = d3.schemeTableau10, // an array of colors (for groups)
      fill = "#ccc", // a static fill color, if no group channel is specified
      fillOpacity = 0.7, // the fill opacity of the bubbles
      stroke, // a static stroke around the bubbles
      strokeWidth, // the stroke width around the bubbles, if any
      strokeOpacity, // the stroke opacity around the bubbles, if any
    } = {}
  ) {
    // Compute the values.
    const D = d3.map(data, (d) => d);
    const V = d3.map(data, value);
    const G = group == null ? null : d3.map(data, group);
    const I = d3.range(V.length).filter((i) => V[i] > 0);

    // Unique the groups.
    if (G && groups === undefined) groups = I.map((i) => G[i]);
    groups = G && new d3.InternSet(groups);

    // Construct scales.
    const color = G && d3.scaleOrdinal(groups, colors);

    // Compute labels and titles.
    const L = label == null ? null : d3.map(data, label);
    const T =
      title === undefined ? L : title == null ? null : d3.map(data, title);

    // Compute layout: create a 1-deep hierarchy, and pack it.
    const root = d3
      .pack()
      .size([
        width - marginLeft - marginRight,
        height - marginTop - marginBottom,
      ])
      .padding(padding)(d3.hierarchy({ children: I }).sum((i) => V[i]));

    const svg = d3
      .create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [-marginLeft, -marginTop, width, height])
      .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
      .attr("fill", "currentColor")
      .attr("font-size", fontSize)
      .attr("font-family", "sans-serif")
      .attr("text-anchor", "middle");

    const leaf = svg
      .selectAll("a")
      .data(root.leaves())
      .join("a")
      .attr(
        "xlink:href",
        link == null ? null : (d, i) => link(D[d.data], i, data)
      )
      .attr("target", link == null ? null : linkTarget)
      .attr("transform", (d) => `translate(${d.x},${d.y})`);

    leaf
      .append("circle")
      .attr("stroke", stroke)
      .attr("stroke-width", strokeWidth)
      .attr("stroke-opacity", strokeOpacity)
      .attr("fill", G ? (d) => color(G[d.data]) : fill == null ? "none" : fill)
      .attr("fill-opacity", fillOpacity)
      .attr("r", (d) => d.r);

    if (T)
      leaf.append("title").text((d) => {
        return T[d.data];
      });

    if (L) {
      // A unique identifier for clip paths (to avoid conflicts).
      const uid = `O-${Math.random().toString(16).slice(2)}`;

      leaf
        .append("clipPath")
        .attr("id", (d) => `${uid}-clip-${d.data}`)
        .append("circle")
        .attr("r", (d) => d.r);

      leaf
        .append("text")
        .attr(
          "clip-path",
          (d) => `url(${new URL(`#${uid}-clip-${d.data}`, location)})`
        )
        .selectAll("tspan")
        .data((d) => `${L[d.data]}`.split(/\n/g))
        .join("tspan")
        .attr("x", 0)
        .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
        .attr("fill-opacity", (d, i, D) => (i === D.length - 1 ? 0.7 : null))
        .text((d) => d);
    }

    return Object.assign(svg.node(), { scales: { color } });
  };
}

function _json_data(FileAttachment) {
  return FileAttachment("30_20_all-1-trans.json").csv({ typed: true });
}

function _data(json_data, lowerbound) {
  let prototype = [];
  for (let index = 0; index < json_data.length; index++) {
    const element = json_data[index];
    let sum = 0;
    for (const key in element) {
      if (Object.hasOwnProperty.call(element, key)) {
        const year2022 = element[key];
        let splitData = key.split("/");
        if (splitData[2] == 22) {
          sum += year2022;
        }
      }
    }
    let key = element["Country/Region"];
    let value = sum;
    prototype.push({ id: key, value: value });
  }

  let max = prototype[0]["value"];
  let min = prototype[0]["value"];
  for (let i = 0; i < prototype.length; i++) {
    const element = prototype[i]["value"];
    if (element > max) {
      max = element;
    }
    if (element < min) {
      min = element;
    }
  }
  let medium = ((max - min) * lowerbound) / 10 + min;
  let results = prototype.filter((e) => {
    return e["value"] > medium;
  });
  return results;
}

function _fill(d3) {
  return d3.scaleOrdinal(d3.schemeSet3);
}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() {
    return this.url;
  }
  const fileAttachments = new Map([
    [
      "30_20_all-1-trans.json",
      {
        url: new URL(
          "files/time_series_covid19_deaths_global.csv",
          import.meta.url
        ),
        mimeType: "text/csv",
        toString,
      },
    ],
  ]);
  main.builtin(
    "FileAttachment",
    runtime.fileAttachments((name) => fileAttachments.get(name))
  );
  main.variable(observer()).define(["md"], _1);
  main
    .variable(observer("viewof lowerbound"))
    .define("viewof lowerbound", ["Inputs"], _lowerbound);
  main
    .variable(observer("lowerbound"))
    .define("lowerbound", ["Generators", "viewof lowerbound"], (G, _) =>
      G.input(_)
    );
  main
    .variable(observer("viewof fontSize"))
    .define("viewof fontSize", ["Inputs"], _fontSize);
  main
    .variable(observer("fontSize"))
    .define("fontSize", ["Generators", "viewof fontSize"], (G, _) =>
      G.input(_)
    );
  main
    .variable(observer("chart"))
    .define("chart", ["BubbleChart", "data", "fill"], _chart);
  main.variable(observer()).define(["md"], _5);
  main
    .variable(observer("BubbleChart"))
    .define("BubbleChart", ["d3", "fontSize", "location"], _BubbleChart);
  const child1 = runtime.module(define1);
  main.import("howto", child1);
  const child2 = runtime.module(define2);
  main.import("Swatches", child2);
  main
    .variable(observer("json_data"))
    .define("json_data", ["FileAttachment"], _json_data);
  main
    .variable(observer("data"))
    .define("data", ["json_data", "lowerbound"], _data);
  main.variable(observer("fill")).define("fill", ["d3"], _fill);
  return main;
}
