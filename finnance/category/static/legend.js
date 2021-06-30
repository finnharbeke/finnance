const mouseEvent = (stroke, vis, text) => 
    id => d3.selectAll('.categoryRect')
    .filter(d => d.id == id)
    .style("stroke", stroke)
    .each(d => {
        d3.select("#legendText")
            .style("visibility", vis)
            .text(text(d));
    })

const over_category = mouseEvent(
    getComputedStyle(document.body).getPropertyValue('--primary'),
    "visible", d => d.desc
)

const out_category = mouseEvent(
    "none", "hidden", d => ""
)

const legend = function(data, container) {
    const width = $(container).width();

    const size = 25;
    const outline = 3;
    const pad = 5;
    const between = 2 * pad;
    // const width = 500;
    const per_row = Math.floor(width / (size + pad) + (pad / size))
    // const width = per_row * size + (per_row - 1) * pad;

    const font_size = 35;
    const y_off = font_size + between;

    const svg = d3.select(container).append("svg");

    svg.append("text")
        .attr("id", "legendText")
        .attr("fill", "currentColor")
        .attr("font-size", font_size + "px")
        .attr("font-weight", 300)
        .attr("dominant-baseline", "hanging")
        .attr("x", 0)
        .attr("y", 0)
        .style("visibility", "hidden")
        .text("");

    rects = (data, y_off) => {

        const g = svg.append("g");

        g.selectAll("rect")
            .data(data)
            .enter()
            .append("rect")
            .attr("class", "categoryRect")
            .attr("x", (d, i) => 
                (i % per_row) * (size + pad)
            )
            .attr("y", (d, i) => 
                y_off + Math.floor(i / per_row) * (size + pad)
            )
            .attr("width", size)
            .attr("height", size)
            .style("fill", d => d.color)
            .attr("stroke-width", outline)
            .attr("stroke", "none")
            .on("mouseover", (ev, d) => over_category(d.id))
            .on("mouseout", (ev, d) => out_category(d.id));
        return g;
    }

    const h = n => Math.ceil(n / per_row) * (size + pad) - pad
    const inc_h = h(data.income.length);
    const exp_h = h(data.expenses.length);
    
    rects(data.income, y_off);
    rects(data.expenses, y_off + inc_h + between)

    const height = y_off + inc_h + between + exp_h;

    svg.attr("viewBox", [-outline, 0, width, height + outline])

}