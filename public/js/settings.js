(() => {
    "use strict";

    $("#delete-btn").on("click", function (e) {
        
        let c = confirm("Tényleg szeretnéd törölni a fiókodat?\nFIGYELEM: EZ A DÖNTÉS NEM VONHATÓ VISSZA!");

        console.log(c);
        if (c) {
            e.submit();
        }
        else
            e.preventDefault();
    })

})();
