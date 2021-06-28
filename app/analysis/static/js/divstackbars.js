// Credits: Mike Bostock https://observablehq.com/@d3/diverging-stacked-bar-chart

divstackbars = function(data, container) {
    Object.assign(data, {
        negative: "← Expenses",
        positive: "Income →",
        negatives: [...new Set(data.filter(d => d.is_expense).map(d => d.category))],
        positives: [...new Set(data.filter(d => !d.is_expense).map(d => d.category))]
    });
    
    const margin = {top: 60, right: 30, bottom: 0, left: 160};
    const font_size = "20px";

    const color = d3.scaleOrdinal()
        .domain([].concat(data.negatives.sort(), data.positives.sort()))
        .range([].concat(
            // muted
            // ['#4878d0', '#ee854a', '#6acc64', '#d65f5f', '#956cb4', '#8c613c', '#dc7ec0', '#797979', '#d5bb67', '#82c6e2', '#4878d0', '#ee854a', '#6acc64', '#d65f5f', '#956cb4', '#8c613c', '#dc7ec0'],
            // flare
            ['#eba278', '#ea946f', '#e88667', '#e67861', '#e36a5c', '#de5c5b', '#d7505e', '#ce4762', '#c14067', '#b43c6b', '#a7396e', '#9a356f', '#8d3270', '#7e2e70', '#712c6d', '#64296a', '#572666'],
            ['#3a528b', '#20908c', '#5ec961']
        ));

    const bias = d3.rollups(data, v => 
            d3.sum(v, d => d.value * Math.min(0, d.is_expense ? -1 : 1)), d => d.month
    );

    const height = bias.length * 45 + margin.top + margin.bottom;
    const width = 954;

    const series = d3.stack()
        .keys([].concat(data.negatives.slice().reverse(), data.positives))
        .value(([, value], category) => (data.negatives.includes(category) ? -value.get(category) : value.get(category)) || 0)
        .offset(d3.stackOffsetDiverging)(
            d3.rollups(data, data => d3.rollup(data, ([d]) => d.value, d => d.category), d => d.month)
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
        .selectAll("rect")
        .data(d => d.map(v => Object.assign(v, {key: d.key})))
        .join("rect")
        .attr("x", d => x(d[0]))
        .attr("y", ({data: [name]}) => y(name))
        .attr("width", d => x(d[1]) - x(d[0]))
        .attr("height", y.bandwidth())
        .append("title")
        .text(({key, data: [name, value]}) => `${name}\n${value.get(key)} ${key}`);

    svg.append("g")
        .call(xAxis);

    svg.append("g")
        .call(yAxis);

    var legend = d3.legendColor()
        .cellFilter(function(d){ return d.label !== "e" })
        .scale(color);
        
    legend = svg.append("g")
        .attr("fill", "currentColor")
        .call(legend);
    
    legend.attr("transform", `translate(${width - legend._groups[0][0].getBBox().width}, 80)`)
}

function i(i){
    var o = i+"", a=t.get(o);
    if(!a){
        if(r!==op)return r;
        t.set(o,a=n.push(i))
    }
    return e[(a-1)%e.length]}