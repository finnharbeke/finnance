function set_lock(locked) {
    if (locked) {
        $('#lockBtn').addClass('btn-warning').removeClass('btn-secondary')
            .addClass('active').attr('aria-pressed', true);
        $('#lockBtn > span').text('locked');
        $('#lock').val(true);
    } else {
        $('#lockBtn').addClass('btn-secondary').removeClass('btn-warning')
            .removeClass('active').attr('aria-pressed', false);
        $('#lockBtn > span').text('free');
        $('#lock').val(false);
    }
}
function set_catexpinc(exp) {
    if (exp) {
        $('#catExpenseLabel').removeClass('btn-light').addClass('btn-danger');
        $('#catIncomeLabel').removeClass('btn-success').addClass('btn-light');
        $("#catForm input[name=catExpinc]").removeAttr('checked');
        $("#catForm input[name=catExpinc][value=expense]").prop('checked', true);
        $('#catForm select[name=parentExp]').show()
        $('#catForm select[name=parentInc]').hide()
    } else {
        $('#catIncomeLabel').removeClass('btn-light').addClass('btn-success');
        $('#catExpenseLabel').removeClass('btn-danger').addClass('btn-light');
        $("#catForm input[name=catExpinc]").removeAttr('checked');
        $("#catForm input[name=catExpinc][value=income]").prop('checked', true);
        $('#catForm select[name=parentInc]').show()
        $('#catForm select[name=parentExp]').hide()
    }
}
$('#catModal #lockBtn').click(function() {
    let locked = $('#lock').val() === 'true';
    console.log(locked, $('#lock').val());
    set_lock(!locked)
});
$('#catForm input[type=radio][name=catExpinc]').change(function() {
    set_catexpinc(this.value == 'expense');
});
$(document).ready(function () {
    set_lock(false);
    set_catexpinc(true);
})
