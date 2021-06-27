var script = $('script').filter(function() {
    console.log(this)
    if ($(this).attr('src') != undefined)
        return $(this).attr('src').match(/\/static\/js\/d3\.js.*/);
    else
        return false;
});
var year = script.attr('data-year');
var month = script.attr('data-month');
//------------------------SVG PREPARATION------------------------//
var width = 960;
var height = 500;
var adj = 20;
// we are appending SVG first
var svg = d3.select("div#container").append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
.attr("viewBox", "-" + adj + " -"+ adj + " " + (width + adj) + " " + (height + adj))
.style("padding", 15)
.style("margin", 5)
.classed("svg-content", true);

stairs = function(data) {
    console.log(data);
    let min = d3.min(data.map(x => x.base));
    let max = d3.max(data.map(x => x.top));

    // let t = min;
    // let pad = 0.05;
    // min -= (max - t) * pad;
    // max += (max - t) * pad;

    console.log(min, max)

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
    .attr("x", function (d) {
            return xScale(d.name);
    })
    .attr("width", function (d) {
        return xScale.bandwidth();
    })
    .attr("y", function (d) {
        return yScale(d.top);
    })
    .attr("height", function (d) {
        return yScale(d.base) - yScale(d.top);
    })
    .attr("fill", function(d){
        return d.color
    });

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(xScale));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale));
}