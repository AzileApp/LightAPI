const fastify = require('fastify');
const fetch = require('node-fetch');
const chalk = require('chalk');
const HttpsProxyAgent = require("https-proxy-agent")
 const axios = require('axios');
const mysql = require('mysql');
const { Webhook, MessageBuilder } = require('discord-webhook-node');
const Connection = require('mysql/lib/Connection');
const { response } = require('express');
const app = fastify();
process.on('unhandledRejection', (reason, promise) => {
    console.log(reason.stack || reason)
})
const httpsAgent = new HttpsProxyAgent({host: "proxy.proxy-cheap.com", port: "31112", auth: "stiqnxo8:GJEuVAX23ux7MBMQ"})


async function doTaskSet() {
    const con = mysql.createConnection({
        database: "azileapp_star",
        host: "91.210.103.4",
        user: "azileapp_admin",
        password: "Azilesunlight?",
        charset: "utf8mb4"
    });

	con.connect(function(err) {
        if (err) throw err;
        console.log(`${chalk.yellowBright('[DATABASE] Database connected & synced.')}`);
    });
   
 try {
	con.query(`SELECT * FROM shouts`, function (err, result) {
        result.forEach(async group => {
            await fetch( `https://groups.roblox.com/v1/groups/${group.group_id}`,{ agent: httpsAgent})
            .then( async response => response.json() )
            .then( async response => {
                data = response
                if(data.shout.body !== group.lastShout) {
                    const hook = new Webhook(group.webhook);
                    
                    const Embed = new MessageBuilder()
                        .setColor(group.hex)
                        .setTitle(`:mega:  New Shout`)
                        .setTimestamp()
                        .setDescription(`${data.shout.body}`)
                        .setFooter(`Posted by ${data.shout.poster.username} in ${data.name}`, `http://www.roblox.com/Thumbs/Avatar.ashx?x=150&y=150&Format=Png&username=${data.shout.poster.username}`)
                    
                    hook.send(Embed)

                    con.query(`UPDATE shouts SET lastShout = '${data.shout.body}' WHERE group_id = ${group.group_id}`, function (err, result) {
                        if(err) throw err;
                        console.log(`${chalk.greenBright('[UPDATE] Shouts updated.')}`);
                    })
                }
            } );
        
       })
    })
}catch (err) {
    console.error(`\n\n\nAn error occured whilst getting group shout.\n\n\n`);
}}

doTaskSet()
setInterval(() => {
    doTaskSet();
}, 300000);

app.get('/check', function (request, reply) {
    doTaskSet();
    reply.send({
        response: true,
        message: 'Forced a shout check.'
    })
})
app.get('/', function (request, reply) {
    doTaskSet();
    reply.send({
        Endpoint: 'Light',
        Developer: 'Jonax'
    })
})
app.listen(3000, '0.0.0.0', (err, address) => {
    if (err) { console.error(err); }
    console.log(`${chalk.greenBright('[APP] API started.')}`);
})
