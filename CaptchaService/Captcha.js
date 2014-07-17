
(function ($) {

    $.fn.SetupCaptcha = function (options) {

        this.Settings = $.extend({
            captchaWidget: this,
            defaultTheme: true,
            characterLevel: 2,
            graphicLevel: 2,
            length: 5,
            width: 120,
            height: 50
        }, options);

        if (this.Settings.defaultTheme == true)
            this.Settings.captchaWidget.html('');

        this.Settings = Validate(this.Settings);

        this.addClass('Captcha');

        if (this.Settings.defaultTheme == false) {
            Reload(this.Settings);
        } else {

            var captchaMarkup = '<img class="captchaImg" src="data:image/gif;base64,R0lGODlhgAAPAPEBAC9rwP///8PU7AAAACH/C05FVFNDQVBFMi4wAwEAAAAh/hpDcmVhdGVkIHdpdGggYWpheGxvYWQuaW5mbwAh+QQECgD/ACwAAAAAgAAPAAACo5QvoYG33NKKUtF3Z8RbN/55CEiNonMaJGp1bfiaMQvBtXzTpZuradUDZmY+opA3DK6KwaQTCbU9pVHc1LrDUrfarq765Ya9u+VRzLyO12lwG10yy39zY11Jz9t/6jf5/HfXB8hGWKaHt6eYyDgo6BaH6CgJ+QhnmWWoiVnI6ddJmbkZGkgKujhplNpYafr5OooqGst66Uq7OpjbKmvbW/p7UAAAIfkEBQoAAQAsAAAAAAcADwAAAgiEj6nL7Q+jLAAh+QQFCgABACwLAAAABwAPAAACCISPqcvtD6MsACH5BAUKAAEALBYAAAAHAA8AAAIIhI+py+0PoywAIfkEBQoAAQAsIQAAAAcADwAAAgiEj6nL7Q+jLAAh+QQFCgABACwsAAAABwAPAAACCISPqcvtD6MsACH5BAUKAAEALDcAAAAHAA8AAAIIhI+py+0PoywAIfkEBQoAAQAsQgAAAAcADwAAAgiEj6nL7Q+jLAAh+QQFCgABACxNAAAABwAPAAACCISPqcvtD6MsACH5BAUKAAEALFgAAAAHAA8AAAIIhI+py+0PoywAIfkEBQoAAQAsYwAAAAcADwAAAgiEj6nL7Q+jLAAh+QQFCgABACxuAAAABwAPAAACCISPqcvtD6MsACH5BAUKAAEALHkAAAAHAA8AAAIIhI+py+0PoywAOw==" alt="Image missing" /><div class="captchaContainer"><input type="button" class="captchaRefresh" /></div><input type="text" class="captchaText" />';
            this.Settings.captchaWidget.append(captchaMarkup);
            Reload(this.Settings);
            SetCss(this.Settings);
        }

        this.data('CaptchaSettings', this.Settings);

        this.Settings.captchaWidget.find('.captchaRefresh').click(function () {
            var settings = $(this).parents('.Captcha').data('CaptchaSettings');
            Reload($(this).parents('.Captcha').data('CaptchaSettings'));
        });

        return this;
    },

    Validate = function (Settings) {
        if (Settings.characterLevel < 1 || Settings.characterLevel > 3)
            Settings.characterLevel = 2;

        if (Settings.graphicLevel < 1 || Settings.characterLevel > 3)
            Settings.graphicLevel = 2;

        if (Settings.length < 4 || Settings.length > 8)
            Settings.length = 6;

        if (Settings.width < 120 || Settings.width > 240)
            Settings.width = 120;

        if (Settings.height < 50 || Settings.height > 100)
            Settings.height = 50;

        return Settings;
    }

    $.fn.VerifyCaptchaResponse = function (callBack) {
        var options = $(this).data('CaptchaSettings');
        var response = options.captchaWidget.find('.captchaText').val();
        if (response == "") {
            return;
        }
        var answer = { "Key": options.captchaWidget.find('.captchaKey').val(), "Answer": response };
        answer = JSON.stringify(answer);

        answer = "answer=" + answer;
        var result = false;
        $.ajax({
            url: '/api/tavisca/captcha/submit',
            type: "GET",
            dataType: "jsonp",
            data: answer,
            contentType: 'application/json',
            success: function (response) {
                if (response == false) {
                   Reload(options);
                }
                
                return callBack(response);

            },
            error: function (response) {
               return callBack(false);
            }
        });
    },



    Reload = function (Settings) {

        var customizationParams = { "Width": Settings.width, "Height": Settings.height, "Length": Settings.length, "Level": Settings.characterLevel, "GraphicLevel": Settings.graphicLevel };
        customizationParams = JSON.stringify(customizationParams);
        customizationParams = "customizationParams=" + customizationParams;
        var caller = this;
        $.ajax({
            url: '/api/tavisca/captcha/challenge',
            type: "GET",
            dataType: 'jsonp',
            data: customizationParams,
            contentType: 'application/json',
            cache: false,
            success: function (jsonResponse) {
                GetJson(jsonResponse, Settings);
            },
            error: function (response) {
            }
        });


    },

    GetJson = function (jsonResponse, Settings) {
        var res = JSON.parse(jsonResponse);
        this.captchaResponseKey = res.Key;
        if (Settings.captchaWidget.find('.captchaKey').length)
            Settings.captchaWidget.find('.captchaKey').val(res.Key);
        else {
            var $responseKey = $('<input/>', {
                type: 'hidden',
                'class': 'captchaKey',
                value: res.Key
            });
            $responseKey.appendTo(Settings.captchaWidget);
        }
        Settings.captchaWidget.find('img').attr('src', 'data:image/png;base64,' + res.Image);
        Settings.captchaWidget.find('.captchaText').val('');
        return jsonResponse;
    },

    SetCss = function (CaptchaOptions) {

        var divId = CaptchaOptions.captchaWidget[0].id;
        if (typeof divId == 'undefined') {
            CaptchaOptions.captchaWidget.attr('id', 'captcha-' + Math.floor((Math.random() * 100) + 1));
            divId = CaptchaOptions.captchaWidget[0].id;
        }

        var totalWidth = CaptchaOptions.width + 35;

        $('#' + divId).css('width', totalWidth);
        $('#' + divId + ' .captchaImg').css('width', CaptchaOptions.width);
        $('#' + divId + ' .captchaImg').css('height', CaptchaOptions.height);
        $('#' + divId + ' .captchaText').css('width', CaptchaOptions.width);
        $('#' + divId + ' .captchaContainer').css('height', CaptchaOptions.height);

    }

}(jQuery));








