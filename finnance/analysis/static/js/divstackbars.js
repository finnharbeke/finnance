// Credits: Mike Bostock https://observablehq.com/@d3/diverging-stacked-bar-chart

divstackbars = function(data, container) {
    Object.assign(data, {
        negative: "← Expenses",
        positive: "Income →",
    });
    
    const margin = {top: 60, right: 30, bottom: 0, left: 160};
    const font_size = "20px";

    const color = d3.scaleOrdinal().domain(data.keys).range(data.colors);

    const bias = d3.rollups(data.categories, v => 
            d3.sum(v, d => d.value * Math.min(0, d.is_expense ? -1 : 1)), d => d.month
    );

    const height = bias.length * 45 + margin.top + margin.bottom;
    const width = 954;

    const series = d3.stack()
        .keys(data.keys)
        .value(([, value], category) => (data.negatives.includes(category) ? -value.get(category) : value.get(category)) || 0)
        .offset(d3.stackOffsetDiverging)(
            d3.rollups(data.categories, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.month)
    );

    const x = d3.scaleLinear()
        .domain(d3.extent(series.flat(2)))
        .rangeRound([margin.left, width - margin.right]);

    const y = d3.scaleBand()
        .domain(bias.map(([name]) => name))
        .rangeRound([margin.top, height - margin.bottom])
        .padding(2 / 33);

    const xAxis = g => g
        .attr("transform", `translate(0,${margin.top})`)
        .style("font-size", font_size)
        .call(d3.axisTop(x)
            .ticks(width / 80)
            .tickSizeOuter(0))
        .call(g => g.select(".domain").remove())
        .call(g => g.append("text")
            .attr("x", x(0) + 20)
            .attr("y", -30)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .text(data.positive))
        .call(g => g.append("text")
            .attr("x", x(0) - 20)
            .attr("y", -30)
            .attr("fill", "currentColor")
            .attr("text-anchor", "end")
            .text(data.negative))

    const yAxis = g => g
        .style("font-size", font_size)
        .call(d3.axisLeft(y).tickSizeOuter(0))
        .call(g => g.selectAll(".tick").data(bias).attr("transform", ([name, min]) => `translate(${x(min)},${y(name) + y.bandwidth() / 2})`))
        .call(g => g.select(".domain").attr("transform", `translate(${x(0)},0)`));

    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height])
        .style("font", font_size + " sans-serif");

    svg.append("g")
        .selectAll("g")
        .data(series)
        .join("g")
        .attr("fill", d => color(d.key))
        .attr("fill-opacity", 0.8)
        .selectAll("rect")
        .data(d => d.map(v => Object.assign(v, {key: d.key})))
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", ({data: [name]}) => y(name))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .on("mouseover", (ev, d) => over_category(data.key_to_id[d.key]))
        .on("mouseout", (ev, d) => out_category(data.key_to_id[d.key]))
        .append("title")
        .text(({key, data: [name, value]}) => `${name}\n${value.get(key)} ${key}`);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);
}