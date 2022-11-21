(function ($) {
    var currentAvatar = parseInt($("#avatar-form").attr("value").split(".")[0][6]);
    var max = 8;
    var min = 1;

    function showAvatar() {
        var s = "avatar" + new String(currentAvatar);
        var url = "/images/profiles/" + s + '.png';
        $('#avatar').attr('src', url);
        $('#avatar-form').attr('value', s + ".png");
        console.log(s);
    }

    $('#avatar-right-btn').on('click', function () {
        currentAvatar += 1;

        if (currentAvatar > max) {
            currentAvatar = min;
        }
    
        showAvatar();
    });

    $('#avatar-left-btn').on('click', function () {
        currentAvatar -= 1;

        if (currentAvatar < min) {
            currentAvatar = max;
        }
    
        showAvatar();
    });

})(jQuery);