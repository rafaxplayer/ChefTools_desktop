const remote = require('electron').remote;
const { closeWindow, minimizeWindow, maxsimizeWindow, loadPage } = remote.require('./main.js');

$('#close').on('click', () => closeWindow(0));

$('#min').on('click', () => minimizeWindow(0));

$('#max').on('click', () => maxsimizeWindow(0));

$('.item').on('click', function() {
    loadPage('/pages/'+$(this).attr('id')+'/'+$(this).attr('id')+'.html');
});
