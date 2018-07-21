require("dotenv").config();
var Twitter = require("twitter");
var Spotify = require("node-spotify-api");
var request = require("request");
var inquire = require("inquirer");
var keys = require("./keys");
var omdbUrlBase = "http://www.omdbapi.com"
var fs = require("fs");

// Prints instructions to the console so the user knows what valid options are available.
function printInstructions(){
    console.log("\nHello! My Name is Liri. I am an AI assistant.");
    console.log("I can perform the following tasks:");
    console.log(`\n"my-tweets": This command will return Yuen's latest tweets.`);
    console.log(`\n"spotify-this-song": This command will return information about a song of your choice.`);
    console.log(`\n"movie-this": This command will return information about a movie of your choice.`);
    console.log(`\n"do-what-it-says": This command will perform a random command on a predefined query`);
    console.log(`-------------------`);
}
// Checks Command Line Parameters for a Valid Request
function validInput(string){
    switch(string){
        case "my-tweets":
        return true;

        case "spotify-this-song":
        return true;

        case "movie-this":
        return true;

        case "do-what-it-says":
        return true;

        default:
        return false;
    }
}

// Converts a text string into a valid url parameter
function urlConvert (string){
    let convertedString ='';
    for(let i = 0; i < string.length; i++){
        let char = string.toLowerCase().charAt(i);
        if(char === " ") convertedString += "+";
        else convertedString += char;
    }
    return convertedString;
}

// Main function for Liri's operation. Uses Switch Statements in order to create distinct logic branches based on command line, or user inquired input.
// Utilizes recursion to bring user back to the beginning after successful task completion.
function askLiri(userData){
    let userRequest = (userData[0] === undefined)? "": userData[0].toLowerCase();
    if(validInput(userRequest)){
        let userInput = (userData.slice(1) === undefined)? userData.slice(1).join(" ").toLowerCase() : {song: "The Sign", movie: "Mr Nobody"};
        // console.log(userInput);
        switch (userRequest){
            case "my-tweets":
                    var client = new Twitter({
                        consumer_key: keys.twitter.consumer_key,
                        consumer_secret: keys.twitter.consumer_secret,
                        access_token_key: keys.twitter.access_token_key,
                        access_token_secret: keys.twitter.access_token_secret
                    });
                    var params = {screen_name: 'Yuen08761892'};
                    client.get('statuses/user_timeline', params, function(error, tweets, response) {
                        if (error) {
                            console.log(error);
                        }
                        else if(!error && response.statusCode === 200){
                            for(var i = 0; i< tweets.length; i++){
                                console.log(`Name: ${tweets[i].user.name}`);
                                console.log(`\t Posted on: ${tweets[i].created_at}`);
                                console.log(`\t Tweet: ${tweets[i].text}\n`)
                            }
                            let log = ` ${userRequest}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }
                    });
                    
                    break

                case "spotify-this-song":
                    var spotify = new Spotify({
                        id: keys.spotify.id,
                        secret: keys.spotify.secret
                    });
                    spotify.search({ type: 'track', query: userInput.song, limit: 1}, function(err, data) {
                        if (err) {
                          return console.log(err);
                        }
                        let trackID = data.tracks.items[0].href;
                        spotify.request(trackID)
                        .then(function(results) {
                            console.log(`\nSong: ${results.name}`);
                            console.log(`Artist: ${results.artists[0].name}`);
                            console.log(`Album: ${results.album.name}`);
                            console.log(`Released: ${results.album.release_date}`);
                            console.log(`Preview: ${results.external_urls.spotify}`)
                            console.log(`-------------------`);
                            let log = ` ${userRequest}, ${userInput}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }).catch(function(err) {
                            console.error('Error occurred: ' + err);
                        });
                    });
                    break
                
                case "movie-this":
                    request.get(`${omdbUrlBase}/?t=${urlConvert(userInput.movie)}&y=&plot=short&apikey=${keys.omdb.consumer_key}`,function(error, response, body){
                        if (!error && response.statusCode === 200) {
                            console.log(JSON.parse(body));
                            let log = ` ${userRequest}, ${userInput}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }
                    })    
                    break

                case "do-what-it-says":
                    fs.readFile("random.txt", "utf-8", (error, data)=>{
                        if(error){
                            return console.log(error);
                        }
                        else{
                            console.log(data);
                            let log = ` ${userRequest}, ${data.join(" ")}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri(data);
                                }
                            });
                        }
                    });
                    break
                default:
                    console.log(`\n\nI'm sorry. I do not understand what you mean by ${userRequest} or by ${userInput}`);
        }
    }
    else {
        inquire.prompt([
            {
                type: "list",
                message: "\n\nHey, I'm Liri. How can I help you today?\n",
                choices: ["my-tweets", "spotify-this-song", "movie-this", "do-what-it-says" ],
                name: "action",
                default: "do-what-it-says"
            },
            {
                type: "input",
                when: answers => {return answers.action == "spotify-this-song"},
                message: "\nWhat song would you like me to spotify?",
                name: "userSong"
            },
            {
                type: "input",
                when: answers =>{ return answers.action == "movie-this"},
                message: "\nWhat movie would you like me to look up?",
                name: "userMovie"   
            }
        ]).catch(function(error){
            console.log(error);
        }).then(answers =>{
            let liriTask = answers.action;
            let song = answers.userSong;
            let movie = answers.userMovie;

            switch (liriTask){
                case "my-tweets":
                    var client = new Twitter({
                        consumer_key: keys.twitter.consumer_key,
                        consumer_secret: keys.twitter.consumer_secret,
                        access_token_key: keys.twitter.access_token_key,
                        access_token_secret: keys.twitter.access_token_secret
                    });
                    var params = {screen_name: 'Yuen08761892'};
                    client.get('statuses/user_timeline', params, function(error, tweets, response) {
                        if (error) {
                            console.log(error);
                        }
                        else if(!error && response.statusCode === 200){
                            for(var i = 0; i< tweets.length; i++){
                                console.log(`Name: ${tweets[i].user.name}`);
                                console.log(`\t Posted on: ${tweets[i].created_at}`);
                                console.log(`\t Tweet: ${tweets[i].text}\n`)
                            }
                            let log = ` ${liriTask}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }
                    });
                    break

                case "spotify-this-song":
                    var spotify = new Spotify({
                        id: keys.spotify.id,
                        secret: keys.spotify.secret
                    });
                    spotify.search({ type: 'track', query: song, limit: 1}, function(err, data) {
                        if (err) {
                          return console.log(err);
                        }
                        let trackID = data.tracks.items[0].href;
                        spotify.request(trackID)
                        .then(function(results) {
                            console.log(`\nSong: ${results.name}`);
                            console.log(`Artist: ${results.artists[0].name}`);
                            console.log(`Album: ${results.album.name}`);
                            console.log(`Released: ${results.album.release_date}`);
                            console.log(`Preview: ${results.external_urls.spotify}`)
                            console.log(`-------------------`);
                            let log = ` ${liriTask}, ${song}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }).catch(function(err) {
                            console.error('Error occurred: ' + err);
                        });
                    });
                    break
                
                case "movie-this":
                    request.get(`${omdbUrlBase}/?t=${urlConvert(movie)}&y=&plot=short&apikey=${keys.omdb.consumer_key}`,function(error, response, body){
                        if (!error && response.statusCode === 200) {
                            console.log(JSON.parse(body));
                            let log = ` ${liriTask}, ${movie}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri("")
                                }
                            });
                        }
                    });
                    break

                case "do-what-it-says":
                    fs.readFile("random.txt", "utf-8", (error, data)=>{
                        if(error){
                            return console.log(error);
                        }
                        else{
                            let instruct = data.split("|");
                            let random = Math.floor(Math.random() * instruct.length);
                            let input = instruct[random].split(",");
                            console.log(input);
                            let log = ` ${liriTask}, ${input}`;
                            fs.appendFile("log.txt", log, err =>{
                                if(err) console.log(err);
                                else {
                                    console.log("Log Updated");
                                    askLiri(input)
                                }
                            });
                        }
                    });
                    break

                default:
                    console.log(`\n\nI'm sorry. I do not understand what you mean by ${liriTask}.`);
                    askLiri("");
                    break
    }
        });
    }
}

let userData = process.argv.slice(2);
printInstructions();
askLiri(userData); 