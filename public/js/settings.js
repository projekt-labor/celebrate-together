(() => {
    "use strict";

    $("#delete-btn").on("click", function (e) {
        e.preventDefault();
        let c = confirm("Tényleg szeretnéd törölni a fiókodat?\nFIGYELEM: EZ A DÖNTÉS NEM VONHATÓ VISSZA!");

        console.log(c);
        if (c) {
            e.submit();
        }
    })

})();
