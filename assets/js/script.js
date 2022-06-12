$(document).ready(() => {
    $('#search-btn').on('click', () => {
        $('#search-page').show();
    })

    $('#find-me-btn').on('click', () => {

    })

    $('#go-back').on('click', () => {
        $('#home').hide();
        $('#search-page').show();
    })

})