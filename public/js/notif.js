(($) => {
    "use strict";

    var hostname = window.location.hostname;
    if (window.location.port) {
        hostname += ":" + window.location.port;
    }

    function getNofif(n) {
        return `<li class="dropdown-item">
            <a href="${n.url}" style="color: black;">
                ${n.text}
            </a>
            <div class="row text-center mt-2"> 
                <div class="col-sm-6" title="Elfogadás">
                    <a class="btn btn-sm btn-success" href="${n.rurl}/${n.id}/positive" style="border-radius: 100% !important;">
                        <i class="fas fa-check-circle"></i>
                    </a>
                </div>
                <div class="col-sm-6" title="Elutasítás">
                    <a class="btn btn-sm btn-danger" href="${n.rurl}/${n.id}/negative" style="border-radius: 100% !important;">
                        <i class="fas fa-times-circle"></i>
                    </a>
                </div>
            </div>
        </li>`;
    }

    $.ajax({
        method: 'GET',
        url: "http://" + hostname + "/user/notif",
        data: {}
    }).done((data) => {
        if (data.status !== 1) return false;
        
        for (let n of data.notifications) {
            $("#notification-list").html($("#notification-list").html() + getNofif(n));
        }

        if (data.notifications.length == 0) {
            $("#notification-list").html(`
                <div style="width: 200px; padding: 5px;" class="text-center">
                    <i class="small pe-1 ps-1 pt-1 pb-1 text-muted">Nincsenek újabb értesítéseid</i>
                </div>
            `);
        }
        else {
            $("#notification-badge").html(new String(data.notifications.length));
        }
    });    

})(jQuery);
