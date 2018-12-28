const electron = require('electron');
const remote = electron.remote;
const { dialog } = remote;
const ipcRenderer = electron.ipcRenderer;
const { closeWindow, minimizeWindow, maxsimizeWindow, loadModalWindow } = remote.require('./main.js');
const db = require('../../database/database');

var limit = 0;

const loadMenus = () => {

    db.menus.loadDatabase((err)=>{if(err) console.log(err);
    });

    db.menus.find({}, (err, docs) => {
        if (err) console.log(err)
        if (docs) {
            displayMenus(docs)
            console.log(docs);
        }
    })
}

const displayMenus = (menus) => {

    let items = "";
    menus.forEach((menu) => {

        items += `<li id="${menu._id}" class="list-group-item list-group-item-action d-flex justify-content-start">
                        
                        <div class=" media-body">
                            <h3>${menu.nombre}</h3>
                            <span>${ menu.fecha}</span>
                            <span>${ menu.tipo}</span>
                        </div>
                        <div class="buttons d-flex justify-content-center align-items-center">
                            <i class="far fa-edit"></i>
                            <i class="far fa-trash-alt"></i>
                        </div>
                    </li>`;

    });

    $('#list-content').html(items);

    if (menus.length >= limit) {

        $('.more i').removeClass('fa-sync-alt').addClass('fa-plus-circle');

    } else {
        $('.more i').removeClass('fa-plus-circle').addClass('fa-sync-alt');

    }

    limit = menus.length >= limit ? limit + 10 : 0;
}

$('.add-content').on('click', function () {
    let data = { id: 0 }
    loadModalWindow('/pages/menus-cartas/ventanas/menu-nueva-editar.html', data);
});

$('#close').on('click', () => { closeWindow(1) });

$('#min').on('click', () => { minimizeWindow(1) });

$('#max').on('click', () => { maxsimizeWindow(1) });

loadMenus();