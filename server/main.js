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
        callTwitter : function () {

            var insertTweet = Meteor.bindEnvironment(function (data) {
                 Tweets.insert(data);
            });
            //849370579031470082 Le monde
            // 849539610212528129 CNN
            // 849521521521569792 BCC
            var users         = [
                {
                    "name":"lemondefr",
                    "lastTweetId" : 849370579031470082
                },
                {
                    "name":"CNN",
                    "lastTweetId"  : 849539610212528129
                },
                {
                    "name":"BBCBreaking",
                    "lastTweetId" : 849521521521569792
                }]
              , lastTweetId   = 849521521521569792
              , iterations    = new Array(16)
              , firstLoop     = true;

            var fetchTweet = function(tweet, callbackDone) {

                Twitter.get('statuses/user_timeline',
                {
                    screen_name : 'BBCBreaking',
                    count : 200,
                    max_id : lastTweetId,
                    include_rts : true,
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
                    callbackDone();
                });

            }

            async.eachSeries(iterations, fetchTweet, function(error)  {
                console.log('Fetched all data');
            });


        },
        getTweetsByUser : function () {
          var tweets = Tweets.aggregate({
              $group :
              {
                  _id : "$user.screen_name",
                  retweets: {
                      $push:  {
                          hashtags : "$entities.hashtags",
                          text: "$text",
                          id  : "$id_str",
                          lang : "$lang",
                          retweet_count :"$retweet_count",
                          favorite_count : "$favorite_count",
                          created_at     : "$created_at",
                          followers : "$user.followers_count"
                      }
                  }
              }
          });
          return tweets;
        },

    });
});
