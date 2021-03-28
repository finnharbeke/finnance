function update_currency(input_selector, d, zero=false) {
    let input = $(input_selector);
    let val = parseFloat(input.val());
    input.prop({
       "step": Math.pow(10, -d),
       "value": (zero || isNaN(val)) ? 0 : val.toFixed(d),
       "min": 0
    });
    let inputs = document.querySelectorAll(input_selector);
    for (let inp of inputs) {
        let sub = inp.nextElementSibling;
        if (sub != null && sub.tagName == "SMALL") {
            sub.innerHTML = "non-negative, " + (d == 0 ? "no" : `up to ${d}`) + " decimals";
        }
    }
}