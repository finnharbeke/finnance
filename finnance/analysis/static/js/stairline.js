stairline = function (data, container) {
    const margin = {top: 20, right: 30, bottom: 30, left: 120};
    const height = 720;
    const width = 1080;
    const font_size = "20px";

    function halo(text) {
        text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round");
    }

    const x = d3.scaleTime().domain([
        Date.parse(d3.min(d3.map(data.plots, p => p.xy[0].x))),
        Date.parse(d3.max(d3.map(data.plots, p => p.xy[p.xy.length - 1].x)))
    ]).range([margin.left, width - margin.right]);

    const y = d3.scaleLinear().domain([
        Math.min(0, ...d3.map(data.plots, p => d3.min(d3.map(p.xy, xy => xy.y)))), 
        Math.max(...d3.map(data.plots, p => d3.max(d3.map(p.xy, xy => xy.y))))
    ]).range([height - margin.bottom, margin.top]);

    const xAxis = g => g
        .attr("transform", `translate(0,${height - margin.bottom})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%b %y")))
            .attr("font-size", font_size)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("y2", -height)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", width - 4)
            .attr("y", -4)
            .attr("font-weight", "bold")
            .attr("text-anchor", "end")
            .attr("fill", "black")
            .text(data.x_label)
            .call(halo));

    const yAxis = g => g
        .attr("transform", `translate(${margin.left},0)`)
        .call(d3.axisLeft(y).tickFormat(d => `${d} ${data.curr_code}`))
            .attr("font-size", font_size)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width)
            .attr("stroke-opacity", 0.1))
        .call(g => g.select(".tick:last-of-type text").clone()
            .attr("x", 4)
            .attr("text-anchor", "start")
            .attr("font-weight", "bold")
            .attr("fill", "black")
            .text(data.y_label)
            .call(halo));

    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height + margin.bottom])
        .attr("font", font_size + " sans-serif");
    
    const line = d3.line()
        .curve(d3.curveStep)
        .x(d => x(Date.parse(d.x)))
        .y(d => y(d.y));

    plot = function (pl) {
        svg.append("path")
            .datum(pl.xy)
            .attr("fill", "none")
            .attr("stroke", pl.color)
            .attr("stroke-width", 1.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("d", line)
            .append("title")
                .text(d => pl.label);
    }

    data.plots.map(pl => plot(pl));

    svg.append("g")
        .call(xAxis);
        
    svg.append("g")
        .call(yAxis);
}