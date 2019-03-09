var request = require("request");
var client;
var mod = {
	categories: [
		require("./Commands/basic.js"),
		require("./Commands/currency.js"),
		require("./Commands/music.js"),
		require("./Commands/fun.js"),
		require("./Commands/nsfw.js"),
		require("./Commands/admin.js")
	],
	execute: (client,msg) => {
		let cmdarray = msg.content.split(" ");
		let cmd = cmdarray[0].toLowerCase();
		let args = cmdarray.slice(1);

		if(msg.content.charAt(0) == process.env.prefix){
			let executed = false;

			if(cmd == process.env.prefix + "help"){
				let embed = {};
				embed.title = "Commands";
				embed.fields = [];
				embed.footer = {text: "Made by _programmeKid"};
				for(let i = 0; i < mod.categories.length; i++){
					let field = {};
					let category = mod.categories[i];
					if(!category.hidden){
						field.name = category.name + " commands";
						field.value = "";
						for(let k = 0; k < category.commands.length; k++){
							let command = category.commands[k];
							if(!command.options.hidden){
								field.value += command.format() + "\n";
							}
						}
						embed.fields.push(field);
					}
				}
				msg.channel.send({embed: embed});
				executed = true;
			} else{
				for(let i = 0; i < mod.categories.length; i++){
					let category = mod.categories[i];
					for(let k = 0; k < category.commands.length; k++){
						let command = category.commands[k];
						if(cmd == command.options.prefix + command.name){
							if(command.options.roles){
								let canexecute = false;
								for(let j = 0; j < command.options.roles.length; j++){
									let role = command.options.roles[j];
									if(msg.member.roles.find("id",role)){
										canexecute = true;
									}
								}
								if(canexecute){
									command.execute(client,msg,args);
									executed = true;
								} else{
									msg.channel.send(":no_entry_sign: Error: Nice try");
									executed = true;
								}
							} else{
								command.execute(client,msg,args);
								executed = true;
							}
						}
					}
				}
			}

			if(!executed){
				msg.channel.send(":no_entry_sign: Error: Unknown command");
			}
		}
	},
	init: (cli) => {
		client = cli;
		let guild = cli.guilds.find("id","543238772276330537");
		let channel = guild.channels.find("id","543711309137707009");
		setInterval(() => {
			request("https://www.reddit.com/r/dankmemes/new.json?sort=new",(err,res,body) => {
				let json = JSON.parse(body);
				let posts = json.data.children;
				let post = posts[Math.floor(Math.random() * posts.length)];
				while(post == undefined){
					let post = posts[Math.floor(Math.random() * posts.length)];
				}
				channel.send(post.title,{
					files: [
						post.data.url
					]
				});
			});
		},20*1000);
		for(let i = 0; i < mod.categories.length; i++){
			let category = mod.categories[i];
			if(category.run){
				category.run(client);
			}
		}
	}
};

module.exports = mod;