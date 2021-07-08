$(document).ready(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.has('currency_id'))
        $('#filter select[name=currency_id]').val(params.get('currency_id'))
    if (params.has('category_id'))
        $('#filter select[name=category_id]').val(params.get('category_id'))
    if (params.has('min'))
        $('#filter input[name=min]').val(params.get('min'))
    if (params.has('max'))
        $('#filter input[name=max]').val(params.get('max'))
    if (params.has('start') && params.get('start') != "") {
        $('#filter input[name=start_in]').val(
            luxon.DateTime.fromISO(params.get('start')).toFormat(DATE_FMT)
        );
        $('#filter input[name=start]').val(params.get('start'));
    }
    if (params.has('end') && params.get('end') != "") {
        $('#filter input[name=end_in]').val(
            luxon.DateTime.fromISO(params.get('end')).toFormat(DATE_FMT)
        );
        $('#filter input[name=end]').val(params.get('end'));
    }
    let makeiso = s => 
        $(`#filter input[name=${s}_in]`).on('change', 
        function() {
            if ($(this).val() === "") {
                $(`#filter input[name=${s}]`).val('');
                return
            }
            let dt = luxon.DateTime.fromFormat($(this).val(), DATE_FMT);
            if (!dt.isValid) {
                alert(`${dt.invalidReason}:\n\t${dt.invalidExplanation}`);
                $(`#filter input[name=${s}_in]`).val('');
                return;
            }
            $(`#filter input[name=${s}]`).val(
                dt.toISO()
            );
        });
    makeiso('start');
    makeiso('end');
})