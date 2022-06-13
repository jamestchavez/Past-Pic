


$(document).ready(() => {
    $('#search-btn').on('click', () => {
        zipEntry = zip.value
        $('#home').hide();
        $('#search-page').show();
        console.log(zipEntry);
    })

    $('#find-me-btn').on('click', () => {
        $('#home').hide();
        $('#search-page').show();
    })

    $('#go-back').on('click', () => {
        $('#search-page').hide();
        $('#home').show();
    })

});




$(function(){
$('#datepicker').datepicker();
});