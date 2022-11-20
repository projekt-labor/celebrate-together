(($) => {
    "use strict";

    var hostname = window.location.hostname;
    if (window.location.port) {
        hostname += ":" + window.location.port;
    }

    function getNofif(n) {
        return `<li class="dropdown-item">
            <a href="${n.url}">
                ${n.text}
            </a>
            <br/>
            <div class="row"> 
                <div class="col-sm">
                    <a class="btn btn-sm btn-success" href="${n.rurl}/${n.id}/positive">
                        Elfogadás
                    </a>
                </div>
                <div class="col-sm">
                    <a class="btn btn-sm btn-danger" href="${n.rurl}/${n.id}/negative">
                        Elutasítás
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
                <div style="width: 350px; padding: 20px;" class="text-center">
                    <i class="small pe-5 ps-5 pt-5 pb-5 text-muted">Nincsenek újabb értesítéseid</i>
                </div>
            `);
        }
        else {
            $("#notification-badge").html(new String(data.notifications.length));
        }
    });    

})(jQuery);
