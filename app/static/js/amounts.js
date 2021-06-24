function regulateAmounts(node) {
    let n = parseInt($('#flowCount').val()) + parseInt($('#recordCount').val());
    const  step = parseFloat(
        $('#transactionForm input[type=number][name=amount]').prop('step')
    );
    let _ = $('#transactionForm input[type=number][name=amount]').val();
    const total = _ == "" ? 0 : parseFloat(_);
    const decimals = parseInt(
        $('#transactionForm select[name=currency] option:selected').data('decimals')
    );

    if (node != undefined && node.value == "") {
        $(node).val(step);
    }

    // cap at tr.amount - (n - 1) * step
    const cap = Math.max(total - (n - 1) * step, step);
    if (node != undefined && $(node).val() > cap)
        $(node).val(cap);

    const all_parts = '#flowRows input[type=number], #recordRows input[type=number]';


    // if sum <= tr.amount it's fine
    let sum = 0;
    $(all_parts).each(function () {
        if (parseFloat(this.value) == 0.0)
            $(this).val(step);
        $(this).val(parseFloat(this.value).toFixed(decimals));
        sum += parseFloat(this.value);
    });

    let left = n - 1;
    
    if (sum != total) {
        let i = n;
        $($(all_parts).get().reverse()).each(function () {
            let my_val = parseFloat(this.value);
            if (this == node)
                return;
            left--;
            if (sum < total) {
                $(this).val((my_val + total - sum).toFixed(decimals))
                sum += total - sum;
                return false;
            } else {
                let decrease = my_val - Math.max(my_val - (sum - total), step);
                $(this).val((my_val - decrease).toFixed(decimals));
                sum -= decrease;
                if (sum == total)
                    return false;
            }
        });
    }
    if (sum < total && node != undefined) { // should only be possible with node != undefined
        $(node).val((parseFloat(node.value) + total - sum).toFixed(decimals));
    }
}