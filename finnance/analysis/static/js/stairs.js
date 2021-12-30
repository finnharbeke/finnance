stairs = function(data, container) {
    var width = 960;
    var height = 500;
    var adj = 20;
    // we are appending SVG first
    var svg = d3.select(container).append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "-" + adj + " -"+ adj + " " + (width + adj) + " " + (height + adj))
        .style("padding", 15)
        .style("margin", 5)
        .classed("svg-content", true);
        
    let min = d3.min(data.entries.map(x => x.base));
    let max = d3.max(data.entries.map(x => x.top));

    const x = d3.scaleBand().domain(
            d3.map(data.days, day => Date.parse(day))
        ).rangeRound([0, width]);

    // let xScale = d3.scaleBand()
    //     .rangeRound([0, width])
    //     .domain(data.map(x => x.name));

    var yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([min, max]);

    svg.selectAll("div")
        .data(data.entries)
        .enter()
        .append("rect")
        .attr("x", d => x(Date.parse(d.day)))
        .attr("width", x.bandwidth())
        .attr("y", d => yScale(d.top))
        .attr("height", d => yScale(d.base) - yScale(d.top))
        .attr("fill", d => d.color)
        .on("mouseover", (ev, d) => over_category(d.id))
        .on("mouseout", (ev, d) => out_category(d.id));

    // svg.append("g")
    //     .attr("class", "axis")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("transform", `translate(0,${height})`)
        .call(d3.axisBottom(x).tickFormat(d3.timeFormat("%a %d.%m.%y"))
            .tickValues(x.domain().filter((d, i) => !(i % Math.floor(x.domain().length / 7)) || i == x.domain().length - 1)));
        // .call(g => g.select(".domain").remove())
        // .call(g => g.selectAll(".tick line").clone()
        //     .attr("y2", -height)
        //     .attr("stroke-opacity", 0.1))
        // .call(g => g.append("text")
        //     .attr("x", width - 4)
        //     .attr("y", -4)
        //     .attr("font-weight", "bold")
        //     .attr("text-anchor", "end")
        //     .attr("fill", "black")
        //     .text(x_label)
        //     .call(halo));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));
}