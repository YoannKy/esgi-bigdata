import { Meteor } from 'meteor/meteor';
import async from 'async';
Meteor.startup(() => {
    Tweets = new Mongo.Collection("tweets");

    const Twitter = new Twit({
        consumer_key:         '41Fg2eQgAs3BxH88l2M4umqYb', // API key
        consumer_secret:      'HKlmZL5lcuyiIwn3asJTqOfWLAx4yTvySthHfMp16HCtPrzxsl', // API secret
        access_token:         '849211176953282564-D5n45eFHV3bglVG1JxXr8s8IANOvmIr',
        access_token_secret:  'lMiGJa9zwcYbbaabUEcbByFjVU4VyoSa9EV0SHyj4NjVB'
    });

     Meteor.methods({
        callTwitter: function () {

            insertTweet = Meteor.bindEnvironment(function (data) {
                 Tweets.insert(data);
            });

            var users         = ["lemondefr","CNN", "BBCBreaking"]
              , lastTweetId   = 849370579031470082
              , iterations    = new Array(15)
              , firstLoop     = true;

            console.log(iterations);
            async.eachSeries(iterations, function(iteration, iterationsCallback) {
                Twitter.get('statuses/user_timeline',
                {
                    screen_name : 'lemondefr',
                    count : 200,
                    max_id : lastTweetId,
                    include_rts : false,
                },
                function (err, data, response) {
                    if(firstLoop) {
                        insertTweet(data[0]);
                        firstLoop = false;
                    }
                    for (let tweetIndex = 1; tweetIndex < data.length; tweetIndex++) {
                          insertTweet(data[tweetIndex]);
                    }

                    lastTweetId = data[data.length-1].id_str;
                    iterationsCallback();
                });
            });

            // var stream = Twitter.stream('statuses/filter', { track: ['#react']});
            //
            // stream.on('tweet', function (tweet) {
            //   // console.log(tweet);
            //   insertTweet(tweet);
            // })

        },
    });
});
