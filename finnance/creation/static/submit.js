function submit_transaction() {
    console.log('submit');
    if (checks())
        post()
}

function checks() {
    return check_date() && check_amount() && check_agents() && check_categories() && check_hasflowRecords();
}

function post() {
    let is_expense = $('#transactionForm input[type=radio]:checked').val() == 'expense';
    let settings = {
        type: $('#transactionForm input[name=method]').val(),
        url: $('#transactionForm input[name=url]').val(),
        contentType: 'application/json',
        data: JSON.stringify({
            account_id: parseInt($('input[name=accountId]').val()),
            currency_id: parseInt($('select[name=currency]').val()),
            date_issued: luxon.DateTime.fromFormat(
                $('#transactionForm input[name=date_issued]').val(),
                DATE_FMT
            ).toISO(),
            amount: parseFloat($('#transactionForm input[name=amount]').val()),
            is_expense: is_expense,
            agent: $('input[name=agent]').val(),
            records: $.map($('#recordRows > div.form-row'), function (row) {
                    let i = parseInt(row.id.substring("recordRow".length));
                    return {
                        "category_id": parseInt(is_expense ? 
                            $(row).find(`select[name=recordCategoryExp${i}]`).val() :
                            $(row).find(`select[name=recordCategoryInc${i}]`).val()),
                        "amount": parseFloat($(row).find(`input[name=recordAmount${i}`).val())
                    }
                }),
            flows: $.map($('#flowRows > div.form-row'), function (row) {
                let i = parseInt(row.id.substring("flowRow".length));
                    return {
                        "agent": $(row).find(`input[name=flowAgent${i}]`).val(),
                        "amount": parseFloat($(row).find(`input[name=flowAmount${i}`).val())
                    }
                }),
            directflow: $('#directFlow').val() === 'true',
            remote_agent: $('#remoteAgentForm').is(':hidden') ?
                null : $('#transactionForm input[name=remoteAgent]').val(),
            comment: $('#transactionForm input[name=comment]').val()
        }),
        error: (e) => {
            alert(`Error: ${e.status} ${e.statusText}\n${e.responseText}`);
        },
        success: (r) => {
            empty();
            $('#transModal').modal('hide');
            console.log(r.responseText);
        }
    }
    console.log(settings);
    $.ajax(settings);
}


function check_date() {
    let issued = luxon.DateTime.fromFormat(
        $('#transactionForm input[name=date_issued]').val(), DATE_FMT);
    if (!issued.isValid) {
        alert(`${issued.invalidReason}:\n${issued.invalidExplanation}`);
        return false;
    } else if (issued > luxon.DateTime.now()) {
        alert("Transaction can't be in the future!");
        return false;
    }
    if (!$('#accountForm').is(':hidden')) {
        let acc_id = parseInt($('input[name=accountId]').val());
        let date_created_str;
        let accounts = document.getElementById('accounts');
        for (let i = 0; i < accounts.options.length; i++) {
            if (accounts.options[i].value == acc_id) {
                date_created_str = $(accounts.options[i]).data('date_created');
                break;
            }
        }
        let date_created = luxon.DateTime.fromFormat(date_created_str, DATE_FMT);
        if (date_created > issued) {
            alert(`Can't make Transaction before Creation of Account!\n${
                date_created.toFormat(DATE_FMT)
            }`);
            return false;
        }
    }
    return true;
}

function check_hasflowRecords() {
    if ($('#directFlow').val() === 'true')
        return true;
    else if ($('#flowRows > div, #recordRows > div').length == 0) {
        alert('You need to enter at least one Record or Flow!');
        return false;
    }
    return true;
}

function check_agents() {
    let used = [];
    let broke_out = false;
    $('input[name=agent], input[name=remoteAgent], #flowRows input[type=text]').each(function () {
        if ($(this).prop('name') == 'remoteAgent' && $(this).is(':hidden'))
            return;
        if (this.value != "" && used.indexOf(this.value) == -1) {
            used.push(this.value);
        } else {
            if (this.value == "")
                alert('Agents must be non-empty Strings!');
            else
                alert("Use distinct Agents for the Transaction and Flows!");
            broke_out = true;
            return false;
        }
    });
    return !broke_out
}

function check_categories() {
    let is_expense = $('#transactionForm input[type=radio]:checked').val() == 'expense';
    let broke_out = false;
    used = [];
    $('#recordRows select').each(function() {
        if (($(this).prop('name').startsWith('recordCategoryExp') && !is_expense) ||
            ($(this).prop('name').startsWith('recordCategoryInc') && is_expense))
            return;
        
        if (used.indexOf(this.value) == -1) {
            used.push(this.value);
        } else {
            // duplicate
            alert("Use distinct Categories for the Records!");
            broke_out = true;
            return false;
        }
    });
    return !broke_out;
}

function check_amount() {
    let total = parseFloat($('#transactionForm input[name=amount]').val());
    console.log(total);
    if (isNaN(total) || total == 0) {
        alert("Enter an amount >= 0!");
        return false
    }
    return true;
    // sum must be right bc of regulateAmounts()
}