function redAlert() {
    function undo(){
        $('#zip').removeClass('has-background-danger');
    }
    $('#zip').addClass('has-background-danger');
    setTimeout(undo, 500);
}

$(document).ready(() => {
    $('#search-btn').on('click', () => {
        zipEntry = zip.value;
        if (zipEntry.length > 4 && zipEntry.length < 12){
            $('#home').hide();
            $('#search-page').show();
            console.log(zipEntry);
            zip.value = "";
        } else {
            redAlert();
        }
    })

    $('#find-me-btn').on('click', () => {
        $('#home').hide();
        $('#search-page').show();
    })

    $('#go-back').on('click', () => {
        $('#search-page').hide();
        $('#home').show();
    })
    $('#show-img').on('click', () => {
        dayEntry = datepicker.value;
        console.log(dayEntry);
    }
    )

});




$(function(){
$('#datepicker').datepicker();
});