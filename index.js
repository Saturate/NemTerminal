// NemTerminal
// Demo: https://www.portalprotect.dk/demologinnemidjs.jsp
(function($){
    'use strict';

    var settings = {
        header: '#################################### \n#      Secure NemID Terminal      #\n####################################',
        submitBtnSelector: '.Box-Button-Submit'
    };

    function passwordTerminal(command, term) {
        $(settings.submitBtnSelector).click();

        // If we detect a error we should handle this.
        // Right now we look for strings there might be a smarter way.
        if($('.error_txt').text() === 'Fejl i bruger-id eller adgangskode.' || $('.forverifier.error_txt').text() === 'Fejl i bruger-id eller adgangskode.') {
            term.echo('Error logging in, please try again.');
            term.pop(); // Go back as we need to enter the username again
            return false;
        }

        $(document).on('pin-step-ready', function() {
            console.log('Change terminal to PIN input');

            var cardNumber = $('.Keyheader').prev().text();
            var pinNeeded = $('#keyhelp').next().find('label').text();

            term.echo('Active keycard is ' + cardNumber);
            term.echo('Please enter key for # ' + pinNeeded);

            term.push(function(command, term) {
                if(!command) {
                    term.echo('Please enter PIN code.');
                } else {
                    $('.PIN').val(command);

                    // Emulate click on the "logon button"
                    $(settings.submitBtnSelector).click();      
                }
            }, {
                prompt: 'PIN> ',
                name: 'pin'
            });
        });
    }

    $(function($) {
        // Prepend the terminal DOM nodes
        $('body').prepend('<div id="nemid-terminal"></div><div id="nemid-terminal-scanlines"></div>');

        // The ".step1" class is an indicator that nemid is loaded and you can enter usern & pass.
        $('.step1').waitUntilExists(function () {
            console.log('Step one is ready...');
        });

        // The .otp class is the box fot the 2FA key
        $('.otp').waitUntilExists(function () {
            console.log('Step otp is ready...');
            $(document).trigger('pin-step-ready');
        });

        // Init jQuery Terminal
        $('#nemid-terminal').terminal(function (rawCommand, term) {
            var command = rawCommand.split(' ')[0];
            var args = rawCommand.split(' ').slice(1);

            if (command === 'help') {
                term.echo('Available commands are:');
                term.echo('shutdown\t\t\t (closes the terminal, use a page refresh to get it back.)');
                term.echo('login %username%\t (Starts logging in to the site with nemid.)');
                term.echo('about\t\t\t\t(Shows information about this add-on.)');
                term.echo('help\t\t\t\t (Shows this help, awesome.)');
            } else if (command === 'site') {
                var site = document.referrer ? 'Current site is ' + document.referrer : 'No referrer found.'; 
                term.echo(site);
            } else if (command === 'login') {
                var $user = $('.input-2.person, #userid');
                var $password = $('[type="password"]');

                term.echo('Please enter your password');

                $user.val(args[0]);

                console.log('Entered username: ' + args[0]);

                term.push(passwordTerminal, {
                    prompt: '> ',
                    name: 'password',
                    keydown: function (event) {
                        console.log('Password: ', String.fromCharCode(event.keyCode));
                        if(event.keyCode !== 13) {
                            $password.val($password.val() + String.fromCharCode(event.keyCode));
                            return false;
                        }
                    }
                });

            } else if (command === 'about') {
                term.echo('The Terminal Interface for NemID is brought to you by Allan Kimmer Jensen');
            } else if (command === 'shutdown') {
                term.echo('Shutting down terminal...');
                setTimeout(function () {
                    $('#nemid-terminal, #nemid-terminal-scanlines').hide(200);
                }, 300);
            } else {
                term.echo('unknow command ' + command);
            }
        }, {
            greetings: settings.header,
            prompt: '> ',
            onClear: function (term) {
                term.echo(settings.header);
            },
            onBlur: function () {
                return false; // prevent loosing focus
            }
        });
    });
}(jQuery)); 