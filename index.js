// https://www.portalprotect.dk/demologinnemidjs.jsp

(function ($) {

/**
* @function
* @property {object} jQuery plugin which runs handler function once specified element is inserted into the DOM
* @param {function} handler A function to execute at the time when the element is inserted
* @param {bool} shouldRunHandlerOnce Optional: if true, handler is unbound after its first invocation
* @example $(selector).waitUntilExists(function);
*/

$.fn.waitUntilExists = function (handler, shouldRunHandlerOnce, isChild) {
    var found       = 'found';
    var $this       = $(this.selector);
    var $elements   = $this.not(function () { return $(this).data(found); }).each(handler).data(found, true);

    if (!isChild)
    {
        (window.waitUntilExists_Intervals = window.waitUntilExists_Intervals || {})[this.selector] =
            window.setInterval(function () { $this.waitUntilExists(handler, shouldRunHandlerOnce, true); }, 500)
        ;
    }
    else if (shouldRunHandlerOnce && $elements.length)
    {
        window.clearInterval(window.waitUntilExists_Intervals[this.selector]);
    }

    return $this;
}

}(jQuery));


jQuery(document).ready(function($) {
    var events;
    // Prepend the terminal DOM nodes
    $('body').prepend('<div id="nemid-terminal"></div><div id="nemid-terminal-scanlines"></div>');

    $('.step1').waitUntilExists(function() {
        console.log('Step one is ready...');
    });

    $('.Box-Content .otp').waitUntilExists(function() {
        console.log('Step otp is ready...');
        $(document).trigger('pin-step-ready');
    });
    
    // Init jQuery Terminal
    $('#nemid-terminal').terminal(function(rawCommand, term) {
        var command = rawCommand.split(' ')[0];
        var args = rawCommand.split(" ").slice(1);

        if (command == 'help') {
            term.echo('Available commands are:');
           	term.echo('shutdown\t\t\t (closes the terminal, use a page refresh to get it back.)');
           	term.echo('login %username%\t (Starts logging in to the site with nemid.)');
           	term.echo('about\t\t\t\t(Shows information about this add-on.)');
           	term.echo('help\t\t\t\t (Shows this help, awesome.)');
        } else if (command == 'site') {
            if (document.referrer) {
                term.echo("Current site is " + document.referrer);
            } else {
                term.echo("No referrer found. ");
            }
        } else if (command == 'login') {
            var $user = $('.input-2.person, #userid');
            var $password = $('[type="password"]');
            
            term.echo("Please enter your password");
            
            $user.val(args[0]);

            console.log('Entered username: ' + args[0]);

            term.push(function(command, term) {
                $('.Box-Button-Submit').click();

                if($('.error_txt').text() === "Fejl i bruger-id eller adgangskode.") {
                    term.echo("Error logging in, please try again.");
                    return false;
                }

                $(document).on('pin-step-ready', function() {
                    console.log('Change terminal to PIN input');

                    var cardNumber = $('.Keyheader').prev().text();
                    var pinNeeded = $('#keyhelp').next().find('label').text();

                    term.echo("Active keycard is " + cardNumber);
                    term.echo("Please enter key for # " + pinNeeded);
                    
                    term.push(function(command, term) {
                        $('.PIN').val(command);

                        // Emulate click on the "logon button"
                        $('.Box-Button-Submit').click();
                    }, {
                        prompt: 'PIN> ',
                        name: 'pin'
                    });
                });

            }, {
                prompt: '>',
                name: 'password',
                keydown: function(event, terminal) {
                	console.log('Password: ', String.fromCharCode(event.keyCode));
                    if(event.keyCode !== 13) {
                        $password.val($password.val() + String.fromCharCode(event.keyCode));
                        return false;    
                    }
                }
            });

        } else if (command == 'about') {
            term.echo("The Terminal Interface for NemID is brought to you by Allan Kimmer Jensen");
        } else if (command == 'shutdown') {
            term.echo("Shutting down terminal...");
            setTimeout(function(){
				$('#nemid-terminal, #nemid-terminal-scanlines').hide(200);
            }, 300);
        } else {
            term.echo("unknow command " + command);
        }
    }, {
        greetings: "#################################### \n#      Secure NemID Terminal      #\n####################################",
        prompt: '> ',
        onClear: function(term) {
        	term.echo("#################################### \n#      Secure NemID Terminal      #\n####################################");
        },
        onBlur: function() {
            // prevent loosing focus
            return false;
        }
    });
});