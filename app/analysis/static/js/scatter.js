scatter = function (data, container) {
    const margin = {top: 20, right: 30, bottom: 30, left: 120};
    const height = 720;
    const width = 1080;
    function halo(text) {
        text.select(function() { return this.parentNode.insertBefore(this.cloneNode(true), this); })
            .attr("fill", "none")
            .attr("stroke", "white")
            .attr("stroke-width", 4)
            .attr("stroke-linejoin", "round");
    }
    const font_size = "20px";

    const x = d3.scaleTime().domain([
        Date.parse(data.x[0]),
        Date.parse(data.x[data.x.length - 1]),
    ]).range([margin.left, width - margin.right]);

    const y = d3.scaleLinear().domain([
        Math.min(0, ...d3.map(data.ys, y => d3.min(y))), 
        Math.max(...d3.map(data.ys, y => d3.max(y)))
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

    function length(path) {
        return d3.create("svg:path").attr("d", path).node().getTotalLength();
    }
    
    const line = d3.line()
        .curve(d3.curveCatmullRom)
        .x((d, i) => x(Date.parse(data.x[i])))
        .y(d => y(d));

    const svg = d3.select(container).append("svg")
        .attr("viewBox", [0, 0, width, height + margin.bottom])
        .attr("font", font_size + " sans-serif");
        
    svg.append("g")
        .call(xAxis);
        
    svg.append("g")
        .call(yAxis);
        
    plot = function (arr, color, str) {
        const l = length(line(arr));
        svg.append("path")
            .datum(arr)
            .attr("fill", "none")
            .attr("stroke", color)
            .attr("stroke-width", 2.5)
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-dasharray", `0,${l}`)
            .attr("d", line)
        .transition()
            .duration(5000)
            .ease(d3.easeLinear)
            .attr("stroke-dasharray", `${l},${l}`);

        svg.append("g")
            .attr("fill", "white")
            .attr("stroke", color)
            .attr("stroke-width", 2)
        .selectAll("circle")
        .data(arr)
        .join("circle")
            .attr("cx", (d, i) => x(Date.parse(data.x[i])))
            .attr("cy", d => y(d))
            .attr("r", 3)
            .append("title")
                .text(
                    (d, i) => `${str} ${d3.timeFormat("%b %y")(
                        Date.parse(data.x[i])
                    )}\n${d}`
                );
    }

    data.ys.map((y, i) => plot(y, data.colors[i], data.labels[i]));

}