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
                    <a class="btn btn-sm btn-success" href="${n.url}/positive">
                        Elfogadás
                    </a>
                </div>
                <div class="col-sm">
                    <a class="btn btn-sm btn-danger" href="${n.url}/negative">
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

        $("#notification-badge").html(new String(data.notifications.length));
        
        for (let n of data.notifications) {
            $("#notification-list").html($("#notification-list").html() + getNofif(n));
        }
    });    

})(jQuery);
