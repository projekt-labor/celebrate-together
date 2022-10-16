(($) => {
    "use strict";

    function makeMessage(m) {
        let otherUserId = $("#other_user_id").html();
        return `
        <li class="message ${m.src_user_id==otherUserId? "other-message" : "self-message"}">
            <p>${m.message}</p>
            <p class="text-muted">${m.date}</p>
        </li>`;
    }

    var hostname = window.location.hostname;
    if (window.location.port) {
        hostname += ":" + window.location.port;
    }

    function getNewMessages() {
        let url = "http://" + hostname + "/chat/" + $("#other_user_id").html() + "/" + new String(Date.now()) + "/api";
        console.log(new Date())

        $.ajax({
            method: 'POST',
            url: url,
            data: {}
        }).done((data) => {
            if (data.status !== 1) {
                return false;
            }
            
            let messagesListContent = "";

            for (let message of data.messages) {
                messagesListContent += makeMessage(message);
            }

            $("#messages-list").html(messagesListContent);
        });
    }

    getNewMessages();
    setInterval(() => {
        getNewMessages();
    }, 5000);

})(jQuery);
