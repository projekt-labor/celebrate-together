(($) => {
    "use strict";

    $("#send-msg-btn").on("click", function (e) {
        e.preventDefault();
        let msg = $("#msg-to-send").val();

        var hostname = window.location.hostname;
        if (window.location.port) {
            hostname += ":" + window.location.port;
        }

        let url = "http://" + hostname + "/chat/" + $("#other_user_id").html() + "/send";
        $.ajax({
            method: 'POST',
            url: url,
            data: {
                message: msg
            }
        }).done((data) => {
            getNewMessages();
            $("#msg-to-send").val("");
        });
    });

    $(".friend-link").on("click", function (e) {
        $("#messages-list").html("");
    
        let user_id = $(this).attr("href").split("#")[1];
        $("#other_user_id").html(user_id);
    
        $(".active-friend").attr("class", "");
        $(this).parent().attr("class", "active-friend");
    
        $("#other-user-name").html($(this).parent().html().replace("#", "/user/"));

        getNewMessages();
    });

})(jQuery);
