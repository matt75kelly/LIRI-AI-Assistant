require("dotenv").config();
var twitter = require("twitter");
var spotify = require("node-spotify-api");
var request = require("request");
var inquire = require("inquirer");
var fs = require("fs");

function urlConvert (string){
    let convertedString ='';
    for(let i = 0; i < string.length; i++){
        let char = string.toLowerCase().charAt(i);
        if(char === " ") convertedString += "+";
        else convertedString += char;
    }
    return convertedString;
}
function liriHelpMe(userData, keys){

    inquire.prompt([
        {
            type: "list",
            message: "Hey, I'm Liri. How can I help you today?",
            choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says" ],
            name: "action",
            default: userData.join("-")
        },
        {
            type: "input",
            when: answers => {return answers.action == "spotify-this-song"},
            message: "What song would you like me to spotify?",
            name: "userSong"
        },
        {
            type: "input",
            when: answers =>{ return answers.action == "movie-this"},
            message: "What movie would you like me to look up?",
            name: "userMovie"   
        }
    ]).catch(function(error){
        console.log(error);
    }).then(answers =>{
        let liriTask = answers.action;
        let song = answers.userSong;
        let movie = answers.userMovie;
        ;
        switch (liriTask){
            case "my-tweets":
                let userPromise0 = new Promise((resolve, reject)=>{
                    let client = new twitter({
                        consumer_key: keys.exports.twitter.consumer_key,
                        consumer_secret: keys.exports.twitter.consumer_secret,
                        access_token_key: keys.exports.twitter.token_key,
                        access_token_secret: keys.exports.twitter.token_secret
                      });
                       
                      var params = {screen_name: 'Yuen'};
                      client.get('statuses/user_timeline', params, function(error, tweets, response) {
                          console.log('twitter response: ' + response);
                        if (!error && response == 200) {
                          resolve(tweets);
                          reject(console.log("Call to Twitter has Failed"));
                        }
                      });
                });
                break

            case "spotify-this-song":
                let userPromise1 = new Promise((resolve, reject)=>{
                    var spot = new spotify({
                        id: keys.exports.spotify.id,
                        secret: keys.exports.spotify.secret
                      });
                       
                      spotify.search({ type: 'track', query: song}, function(err, data) {
                        if (err) {
                          return console.log(err);
                        }  
                        resolve(data);
                        reject(console.log("Call to the Spotify has Failed"));
                      });
                });
                break
            
            case "movie-this":
                let userPromise2 = new Promise((resolve, reject)=>{
                    let title = urlConvert(movie);
                    request(`http://www.omdbapi.com/?t=${title}&y=&plot=short&apikey=${keys.exports.omdb.consumer_key}`, function(error, response, body) {
                        if (!error && response.statusCode === 200) {
                            resolve(body);
                            reject(console.log("Call to OMDB has Failled"));
                        }
                    });
                });
                break

            case "do-what-it-says":
                let userPromise3 = new Promise((resolve, reject)=>{
                
                });
                break
    }
    });
}
let userData = process.argv.slice(2);
fs.readFile("keys.js", "utf8", (error, data)=>{
    if(error){
        return console.log(error);
    }
    liriHelpMe(userData, data); 
});
