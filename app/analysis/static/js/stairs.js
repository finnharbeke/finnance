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
        
    let min = d3.min(data.map(x => x.base));
    let max = d3.max(data.map(x => x.top));

    let xScale = d3.scaleBand()
        .rangeRound([0, width])
        .domain(data.map(x => x.name));

    var yScale = d3.scaleLinear()
        .rangeRound([height, 0])
        .domain([min, max]);

    svg.selectAll("div")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", d => xScale(d.name))
    .attr("width", xScale.bandwidth())
    .attr("y", d => yScale(d.top))
    .attr("height", d => yScale(d.base) - yScale(d.top))
    .attr("fill", d => d.color)
    .attr("fill-opacity", 0.8);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));
}