// https://www.portalprotect.dk/demologinnemidjs.jsp
jQuery(document).ready(function($) {
    $('body').prepend('<div id="nemid-terminal"></div><div id="nemid-terminal-scanlines"></div>');
    
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
            term.echo("Please enter your password");
            var user = document.querySelector('#userid') || document.querySelector('.input-2.person');
            user.value = args[0]; 

            console.log('Entered username: ' + args[0]);

            //document.querySelector('#password').value = "";

            term.push(function(password, term) {
                if(command) {
                	// '[type="password"]'
                   document.querySelector('#password').value = password; 
                }
            }, {
                prompt: '>',
                name: 'password',
                keydown: function(event, terminal) {
                	console.log(event, terminal);
                    if(event.keyCode !== 13) {
                        document.querySelector('#password').value += 
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