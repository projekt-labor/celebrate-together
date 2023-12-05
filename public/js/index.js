(() => {
    "use strict";

    /*
    $(".post-del-btn").on("click", function (e) {
        e.preventDefault();
        let c = confirm("Tényleg szeretnéd törölni ezt a posztot?\nFIGYELEM: EZ A DÖNTÉS NEM VONHATÓ VISSZA!");

        console.log(c);
        if (c) {
            e.submit();
        }
    });
    */
    $("#delete-btn-admin").on("click", function (e) {
        
        let c = confirm("Tényleg szeretnéd törölni a fiókot?\nFIGYELEM: EZ A DÖNTÉS NEM VONHATÓ VISSZA!");

        console.log(c);
        if (c) {
            e.submit();
        }
        else
            e.preventDefault();
    })

    $("#delete-btn-event").on("click", function (e) {
        
        let c = confirm("Tényleg szeretnéd törölni az eseményt?\nFIGYELEM: EZ A DÖNTÉS NEM VONHATÓ VISSZA!");

        console.log(c);
        if (c) {
            e.submit();
        }
        else
            e.preventDefault();
    })

})();
