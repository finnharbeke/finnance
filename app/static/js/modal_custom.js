$(document).ready(function () {
    $('button.toggler').click(function () {
        prepare(this);
    });

    $('#transactionForm input[type=radio][name=expinc]').change(function() {
        set_expense(this.id == 'expense');
    });
    
    $('#directFlowBtn').click(function() {
        let directFlow = $('#directFlow').val() === 'true';
        set_directflow(true, !directFlow);
    });

    $('#transactionForm select[name=currency]').change(function() {
        currency(true, this.value);
    });
    
    $('#transactionForm input[name=amount]').change(function() {
        $(this).val(parseFloat($(this).val()).toFixed(
            $('#transactionForm select[name=currency] option:selected').data('decimals')
        ));
        regulateAmounts();
    });

    $('#transactionSubmit').click(submit_transaction);

    $("#transactionForm").keypress(function(e) {
        if(e.which == 13) {
            $('#transactionSubmit').click();
        }
    });

    $('#transModal button[data-dismiss="modal"]').click(empty)
});

function empty() {
    $('#transactionForm input[type=number]').val("");
    $('#transactionForm input[type=text]').val("").prop("placeholder", "");
    $('#transactionForm select').prop('selectedIndex', 0);
    toggle_flows(false);
    toggle_records(false);
}

function prepare(node) {
    let info = $(node).data('info');
    if (info.startsWith('new')) {
        let account_id = parseInt(info.substring('new'.length));
        let accounts = document.getElementById('accounts');
        for (let i = 0; i < accounts.options.length; i++) {
            if (accounts.options[i].value == account_id) {
                modal_as_new(
                    accounts.options[i].value,
                    $(accounts.options[i]).data('desc'),
                    parseInt($(accounts.options[i]).data('curr_id'))
                );
                break;
            }
        }
    } else if (info.startsWith('edit')) {
        let trans_id = parseInt(info.substring('edit'.length));
        modal_as_edit(trans_id);
    } else if (info == 'remote') {
        modal_as_remote();
    } else {
        console.log('invalid "data-info" attribute for button.toggler!')
    }
    // noch direct modal?
}

function modal_as_new(account_id, account_desc, currency_id) {
    request(null);
    title("Add new Transaction");
    submit("Add new Transaction");
    remote(false);
    set_expense(true);
    set_directflow(true, false);
    currency(false, currency_id);
    account(true, account_id, account_desc);
}

function modal_as_edit(trans_id) {
    $.ajax({
        type: "GET",
        url: EDITINFO_TRANS_URL(trans_id),
        success: (json_response) => {
            trans = json_response.trans;
            flows = json_response.flows;
            records = json_response.records;
            if (trans.remote_agent != null) {
                modal_as_remote();
                currency(true, trans.currency_id);
                $('#remoteAgentForm input[name=remoteAgent]').val(trans.remote_agent);
            } else {
                modal_as_new(trans.account_id, trans.account_desc, trans.currency_id);
                if (trans.direct_flow)
                    set_directflow(true, true);
            }
            request(trans_id);
            title(`Edit Transaction #${trans_id}`);
            submit("save");
            set_expense(trans.is_expense);
            $('#transactionForm input[name=date_issued]').val(
                luxon.DateTime.fromISO(trans.date_issued).toFormat(DATE_FMT)
            );
            $('#transactionForm input[name=amount]').val(trans.amount);
            $('#transactionForm input[name=agent]').val(trans.agent);
            $('#transactionForm input[name=comment]').val(trans.comment);
            for (let i in records) {
                $('#newRecord').click();
                $('#recordRows > div:last-child select').filter(function () {
                    return ($(this).prop('name').startsWith('recordCategoryExp') &&
                        trans.is_expense) || (
                            $(this).prop('name').startsWith('recordCategoryInc') &&
                        !trans.is_expense)
                }).val(records[i].category_id)
                $('#recordRows > div:last-child input[type=number]').val(
                    records[i].amount
                );
            }
            for (let i in flows) {
                $('#newFlow').click();
                $('#flowRows > div:last-child input[type=text]').val(flows[i].agent);
                $('#flowRows > div:last-child input[type=number]').val(flows[i].amount);
            }
            // so that numbers get formatted
            regulateAmounts();
        },
        error: (e) => {
            alert(`Error: ${e.status} ${e.statusText}\n${e.responseText}`);
            console.log(e);
            $('#transModal').modal('hide');
        }
    })
}

function modal_as_remote() {
    request(null);
    title("Add remote Transaction");
    submit("Add remote Transaction");
    remote(true);
    set_expense(true);
    set_directflow(false, false);
    currency(true);
    account(false);
    toggle_flows(false);
    toggle_records(true);
}

function request(trans_id) {
    if (trans_id == null) {
        $('#transactionForm input[name=method]').val("POST");
        $('#transactionForm input[name=url]').val(ADD_TRANS_URL);
    } else {
        $('#transactionForm input[name=method]').val("PUT");
        $('#transactionForm input[name=url]').val(EDIT_TRANS_URL(trans_id));
    }
}

function title(text) {
    $('#transLabel').html(text);
}

function submit(text) {
    $('#transactionSubmit').html(text);
}

function set_expense(is_expense) {
    if (is_expense) {
        $('#expenseLabel').removeClass('btn-light').addClass('btn-danger');
        $('#incomeLabel').removeClass('btn-success').addClass('btn-light');
        $("input[name=expinc]").removeAttr('checked');
        $("input[name=expinc][value=expense]").prop('checked', true);
        $("#recordRows select").each(function () {
            if ($(this).prop('name').startsWith('recordCategoryExp'))
                $(this).show()
            else
                $(this).hide()
        });
    } else {
        $('#incomeLabel').removeClass('btn-light').addClass('btn-success');
        $('#expenseLabel').removeClass('btn-success').addClass('btn-light');
        $("input[name=expinc]").removeAttr('checked');
        $("input[name=expinc][value=income]").prop('checked', true);
        $("#recordRows select").each(function () {
            if ($(this).prop('name').startsWith('recordCategoryInc'))
                $(this).show()
            else
                $(this).hide()
        });
    }
    $('#recordRows select option').each(function () {
        if ($(this).data('exp') === 'True')
            $(this).show()
        else
            $(this).hide()
    })
}

function set_directflow(show, on) {
    if (on) {
        $('#directFlowBtn').addClass('btn-info').removeClass('btn-secondary')
            .addClass('active').attr('aria-pressed', true);
        $('#directFlow').val(true);
    } else {
        $('#directFlowBtn').addClass('btn-secondary').removeClass('btn-info')
            .removeClass('active').attr('aria-pressed', false);
        $('#directFlow').val(false);
    }
    if (show)
        $('#directFlowBtn').show();
    else
        $('#directFlowBtn').hide();
    toggle_flows(!on);
    toggle_records(!on);
}

function toggle_flows(show) {
    if (show) {
        $('#flows').show();
    } else {
        $('#flowRows').html('');
        $('#flowCount').val(0);
        $('#flows').hide();
    }
}

function toggle_records(show) {
    if (show) {
        $('#records').show();
    } else {
        $('#recordRows').html('');
        $('#recordCount').val(0);
        $('#records').hide()
    }
}

function currency(show, currency_id) {
    if (show) {
        $('#currencyForm').show();
    } else {
        $('#currencyForm').hide();
    }
    
    if (currency_id != undefined) {
        $('#transactionForm select[name=currency]').val(currency_id);
    }
    let curr_decimals = $('#transactionForm select[name=currency] option:selected').data('decimals');
    let step = Math.pow(10, -parseInt(curr_decimals));
    $('#transactionForm input[name=amount]').attr('step', step).attr('min', step);
    update = (obj) => {
        $(obj).attr('step', step).attr('min', step);
        $(obj).attr('step', step).attr('min', step);
        $(obj).val(parseFloat($(obj).val()).toFixed(curr_decimals));
    }
    $('#transModal input[type=number]').each(function() {
        update(this);
    });

    regulateAmounts(undefined);
}

function account(show, account_id, account_desc) {
    if (show) {
        $('#accountForm').show();
        $('#accountForm > input[type=text]').attr('placeholder', account_desc);
        $('#accountForm > input[type=hidden]').val(account_id);
    } else {
        $('#accountForm').hide();
        $('#accountForm > input[type=text]').removeAttr('placeholder');
        $('#accountForm > input[type=hidden]').val(null);
    }
}

function remote(show) {
    if (show)
        $('#remoteAgentForm').show();
    else
        $('#remoteAgentForm').hide();
}